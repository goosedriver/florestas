// Snapshot of mineral occurrences (LNEG CRM2023, derived from SIORMINP) and caves / mines (OpenStreetMap) for the
// "Minerals" map mode. Both live services are slow or rate-limited, and file:/// pages cannot
// fetch local JSON, so the app reads the generated geo-data.js instead.
//
//   node scripts/fetch-geodata.mjs            # refresh both sources
//   node scripts/fetch-geodata.mjs --osm-only # keep the existing LNEG snapshot
//
// Licences: LNEG (SIORMINP / CRM2023) — CC BY 4.0; OpenStreetMap — ODbL 1.0 (© OpenStreetMap contributors).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'geo-data.js');

// Mainland Portugal only (excludes Azores and Madeira)
const BBOX = { south: 36.9, west: -9.6, north: 42.2, east: -6.15 };

// LNEG "Depósitos de Matérias-Primas Críticas em Portugal Continental" (CRM2023), built from
// SIORMINP records. The full SIORMINP service (OcorrenciasMinerais/MapServer) publishes the same
// records but its query endpoint was timing out when this script was written (2026-10-16).
const LNEG_BASE = 'https://sig.lneg.pt/server/rest/services/CRM2023/MapServer';
// Point layers of the CRM2023 service: classification under the 2023 EU raw-materials lists
const LNEG_GROUPS = [
  { layer: 7, id: 'critical' },
  { layer: 6, id: 'critical_strategic' },
  { layer: 5, id: 'strategic' }
];

const OVERPASS_ENDPOINTS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJson(url, options = {}, attempts = 5) {
  let wait = 5000;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(180000) });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
      const json = JSON.parse(text);
      if (json.error) throw new Error(JSON.stringify(json.error).slice(0, 200));
      if (json.remark && /error/i.test(json.remark)) throw new Error(json.remark);
      return json;
    } catch (err) {
      console.warn(`  attempt ${i}/${attempts} failed: ${err.message}`);
      if (i === attempts) throw err;
      await sleep(wait);
      wait *= 2;
    }
  }
}

const round = n => Math.round(n * 1e5) / 1e5;
const clean = v => (v === null || v === undefined ? '' : String(v).trim());

// "W - Sn ,  Ta/Nb" → ['W', 'Sn', 'Nb/Ta']
function normalizeSubstances(raw) {
  return clean(raw)
    .split(/\s*[-,;]\s*/)
    .map(x => x.trim().replace(/\s+/g, ' '))
    .map(x => (x === 'Ta/Nb' ? 'Nb/Ta' : x))
    .filter(Boolean);
}

async function fetchLneg() {
  const byId = new Map();
  for (const g of LNEG_GROUPS) {
    console.log(`LNEG CRM2023 layer ${g.layer} (${g.id})…`);
    let offset = 0;
    for (;;) {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: '*',
        outSR: '4326',
        returnGeometry: 'true',
        resultOffset: String(offset),
        resultRecordCount: '1000',
        f: 'json'
      });
      const json = await fetchJson(`${LNEG_BASE}/${g.layer}/query?${params}`);
      const feats = json.features || [];
      feats.forEach(f => {
        const a = f.attributes || {};
        const geo = f.geometry || {};
        if (typeof geo.y !== 'number' || typeof geo.x !== 'number') return;
        if (geo.y < BBOX.south || geo.y > BBOX.north || geo.x < BBOX.west || geo.x > BBOX.east) return;
        const subs = normalizeSubstances(a.Todas_Substancias);
        // A deposit can appear in several layers; keep its first (most specific) group
        const key = a.SIORMINP ? 'S' + a.SIORMINP : `${round(geo.y)},${round(geo.x)},${clean(a.NOME)}`;
        if (byId.has(key)) return;
        byId.set(key, {
          lat: round(geo.y),
          lng: round(geo.x),
          name: clean(a.NOME),
          code: a.SIORMINP ? String(a.SIORMINP) : '',
          group: g.id,
          substances: subs.join(', '),
          main: subs[0] || '',
          size: clean(a.Tamanho_mineralizacao),
          genesis: clean(a.Origem_Genese2),
          link: clean(a.Hyperlink)
        });
      });
      console.log(`  +${feats.length}`);
      if (!json.exceededTransferLimit && feats.length < 1000) break;
      offset += feats.length;
    }
  }
  return Array.from(byId.values());
}

function classifyOsm(tags) {
  // Old (often Roman) adits are sometimes mapped as cave entrances; trust the name
  const name = tags.name || tags['name:pt'] || '';
  if (tags.natural === 'cave_entrance') return /^minas?\b/i.test(name) ? 'mine_abandoned' : 'cave';
  const abandoned =
    Object.keys(tags).some(k => /^(abandoned|disused|ruins|historic)(:|$)/.test(k)) ||
    tags.historic === 'mine' ||
    tags.abandoned === 'yes' ||
    tags.disused === 'yes';
  return abandoned ? 'mine_abandoned' : 'mine';
}

async function fetchOsm() {
  const b = `${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}`;
  const query = `[out:json][timeout:180];
area["ISO3166-1"="PT"][admin_level=2]->.pt;
(
  nwr["natural"="cave_entrance"](area.pt)(${b});
  nwr["historic"="mine"](area.pt)(${b});
  nwr["man_made"~"^(mineshaft|adit)$"](area.pt)(${b});
  nwr["abandoned:man_made"~"^(mineshaft|adit)$"](area.pt)(${b});
  nwr["disused:man_made"~"^(mineshaft|adit)$"](area.pt)(${b});
  nwr["landuse"="quarry"]["historic"="mine"](area.pt)(${b});
);
out center tags;`;

  let lastErr;
  for (const ep of OVERPASS_ENDPOINTS) {
    console.log(`Overpass ${ep}…`);
    try {
      const json = await fetchJson(
        ep,
        {
          method: 'POST',
          headers: { 'User-Agent': 'florestas-de-portugal geo snapshot', 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + encodeURIComponent(query)
        },
        3
      );
      return json.elements
        .map(el => {
          const lat = el.lat !== undefined ? el.lat : el.center && el.center.lat;
          const lng = el.lon !== undefined ? el.lon : el.center && el.center.lon;
          if (typeof lat !== 'number') return null;
          const t = el.tags || {};
          return {
            lat: round(lat),
            lng: round(lng),
            kind: classifyOsm(t),
            name: clean(t.name || t['name:pt'] || t['old_name']),
            resource: clean(t.resource || t['mine:resource'] || t['historic:resource'] || t.mineral),
            osm: `${el.type}/${el.id}`,
            wikipedia: clean(t.wikipedia),
            access: clean(t.access)
          };
        })
        .filter(Boolean);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

function readExisting() {
  if (!fs.existsSync(OUT)) return null;
  const sandbox = {};
  new Function('window', fs.readFileSync(OUT, 'utf8'))(sandbox);
  return sandbox.FLORESTAS_GEO || null;
}

const osmOnly = process.argv.includes('--osm-only');
const existing = readExisting();
const today = new Date().toISOString().slice(0, 10);

const minerals = osmOnly ? (existing ? existing.minerals : []) : await fetchLneg();
const sites = await fetchOsm();

const out = {
  generatedAt: today,
  mineralsFetchedAt: osmOnly ? (existing ? existing.mineralsFetchedAt : null) : today,
  sitesFetchedAt: today,
  minerals,
  sites
};

fs.writeFileSync(
  OUT,
  '// GENERATED by scripts/fetch-geodata.mjs — do not edit by hand.\n' +
    '// Minerals: LNEG CRM2023 / SIORMINP (CC BY 4.0). Caves & mines: © OpenStreetMap contributors (ODbL 1.0).\n' +
    'window.FLORESTAS_GEO = ' +
    JSON.stringify(out) +
    ';\n'
);
console.log(`Wrote ${OUT}: ${minerals.length} mineral occurrences, ${sites.length} caves/mines`);
