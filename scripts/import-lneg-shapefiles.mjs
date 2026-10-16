// Converts LNEG shapefile downloads (geoportal.lneg.pt → Dados abertos → Recursos minerais)
// into geo-areas.js for the Minerals mode:
//   - Áreas potenciais de recursos minerais 2022 (9 commodity-group polygon layers)
//   - Algares (Pé da Pedreira) and Grutas (Codaçal) of the Maciço Calcário Estremenho
//
//   npm install            # once: shapefile + proj4 (devDependencies)
//   node scripts/import-lneg-shapefiles.mjs <folder with the extracted LNEG zips>
//
// The zips are not committed (see .gitignore); extract each into its own folder named after the
// zip, e.g. areaspotenciaisrecursosminerais_2022/, shapefiles_mce_áreapépedreira/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as shapefile from 'shapefile';
import proj4 from 'proj4';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'geo-areas.js');
const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) {
  console.error('Usage: node scripts/import-lneg-shapefiles.mjs <extracted LNEG folder>');
  process.exit(1);
}

// ETRS89 / PT-TM06 (EPSG:3763). The MCE shapefiles ship without a .prj but use the same grid.
const PT_TM06 = '+proj=tmerc +lat_0=39.6682583333333 +lon_0=-8.13310833333333 +k=1 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
const toWgs = proj4(PT_TM06, 'EPSG:4326');

const AREA_LAYERS = [
  'Au_Ag_Sb', 'Caul_AreiaSilic', 'Cr_Ni_Va_Talc', 'Cu_Pb_Zn', 'Fe',
  'Qz_Feldp_Li_Be', 'Salgema_Gesso', 'Uranio', 'W_Sn_Ta_Nb'
];

// Douglas–Peucker in projected metres before reprojection; 60 m is invisible at national zooms
const SIMPLIFY_M = 60;

function simplify(points, tol) {
  if (points.length <= 4) return points;
  const sqTol = tol * tol;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let maxD = 0;
    let idx = -1;
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
      t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px;
      const ey = ay + t * dy - py;
      const d = ex * ex + ey * ey;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > sqTol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  const out = points.filter((_, i) => keep[i]);
  return out.length >= 4 ? out : points;
}

const r5 = v => Math.round(v * 1e5) / 1e5;
const ring = pts => simplify(pts, SIMPLIFY_M).map(p => toWgs.forward(p).map(r5));

function reprojectGeometry(g) {
  if (g.type === 'Polygon') return { type: 'Polygon', coordinates: g.coordinates.map(ring) };
  if (g.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: g.coordinates.map(poly => poly.map(ring)) };
  throw new Error('Unexpected geometry ' + g.type);
}

async function readAll(file) {
  // LNEG .cpg files say UTF-8 but some field names are Windows-1252; values decode fine as UTF-8
  const src = await shapefile.open(file, undefined, { encoding: 'utf-8' });
  const feats = [];
  for (;;) {
    const r = await src.read();
    if (r.done) return feats;
    feats.push(r.value);
  }
}

const clean = v => (v === null || v === undefined ? '' : String(v).trim());
const prop = (props, prefix) => {
  const k = Object.keys(props).find(key => key.toLowerCase().startsWith(prefix.toLowerCase()));
  return k ? clean(props[k]) : '';
};

const areas = [];
for (const group of AREA_LAYERS) {
  const file = path.join(SRC, 'areaspotenciaisrecursosminerais_2022', `Potencial_${group}.shp`);
  for (const f of await readAll(file)) {
    const p = f.properties || {};
    // The Fe layer carries an empty placeholder polygon (no name, no substance) — skip it
    if (!f.geometry || (!clean(p.Nome) && !clean(p.Substancia))) continue;
    areas.push({
      type: 'Feature',
      properties: { group, name: clean(p.Nome), substance: clean(p.Substancia) },
      geometry: reprojectGeometry(f.geometry)
    });
  }
}

const mceCaves = [];
const pePedreira = path.join(SRC, 'shapefiles_mce_áreapépedreira', 'Pé da Pedreira', 'Algares.shp');
for (const f of await readAll(pePedreira)) {
  const p = f.properties || {};
  const [x, y] = f.geometry.coordinates[0];
  const [lng, lat] = toWgs.forward([x, y]);
  mceCaves.push({
    lat: r5(lat), lng: r5(lng), kind: 'cave_mce',
    name: clean(p.Nome), code: clean(p.Numero),
    validated: /^sim/i.test(prop(p, 'Valida')),
    coordSource: clean(p.Fonte_Coor),
    area: 'Pé da Pedreira'
  });
}
const codacal = path.join(SRC, 'shapefiles_mce_áreacodaçal', 'Codaçal', 'Grutas.shp');
for (const f of await readAll(codacal)) {
  const [x, y] = f.geometry.coordinates[0];
  const [lng, lat] = toWgs.forward([x, y]);
  mceCaves.push({ lat: r5(lat), lng: r5(lng), kind: 'cave_mce', name: clean(f.properties.Name), code: '', validated: null, coordSource: '', area: 'Codaçal' });
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  OUT,
  '// GENERATED by scripts/import-lneg-shapefiles.mjs — do not edit by hand.\n' +
    '// LNEG: Áreas potenciais de recursos minerais (2022); algares e grutas do Maciço Calcário Estremenho.\n' +
    'window.FLORESTAS_GEO_AREAS = ' +
    JSON.stringify({ importedAt: today, areasDate: '2022-01-20', areas: { type: 'FeatureCollection', features: areas }, mceCaves }) +
    ';\n'
);
const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`Wrote ${OUT}: ${areas.length} potential-area polygons, ${mceCaves.length} MCE caves (${kb} KB)`);
