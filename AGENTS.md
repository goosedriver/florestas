# AGENTS.md — Developer & AI Agent Guidelines for Florestas de Portugal

This document serves as the architectural specification, data integrity standard, and developer handbook for all human developers and AI coding agents working on the **Florestas de Portugal** codebase.

---

## 1. Project Overview & Purpose

**Florestas de Portugal** is a standalone, client-side, zero-server web application (100% compatible with `file:///` local browsing as well as any static hosting) providing a rich, interactive, trilingual cartographic exploration of mainland Portugal's forests, tree species phenology (flowering and fruiting), and elevation-stratified autumn foliage dynamics.

### Primary Objectives:
- **Official Forest Cartography**: Render live WMS vector land-cover polygons directly from the Portuguese government Direção-Geral do Território (DGT) GeoServer without API keys or watermarks.
- **Seasonal Phenology & Autumn Dynamics**: Track when trees flower, fruit, undergo foliar senescence (golden/amber peak), or enter winter rest (fallen leaves) across Portugal's distinct bioclimatic zones.
- **Click-to-Inspect Land Parcels**: Enable users to click anywhere on mainland Portugal to query official DGT COS Level 4 cadastral/land-cover polygons via `GetFeatureInfo`, with full trilingual classification and clear identification of non-forest parcels (vineyards, urban, water, olive groves).
- **Trilingual Parity**: Provide native, culturally accurate translations across Russian (`ru` - default), European Portuguese (`pt-PT`), and English (`en`).

---

## 2. Core Data Integrity Rules (Mandatory for All Future Agents)

1. **Authentic, Recent Scientific Sources Only (2016–2026)**:
   - Base all forest data, spatial classifications, and phenological calendars strictly on official and scientific authorities updated within the past 10 years:
     - **DGT** (Direção-Geral do Território): COS 2025v1 Série 2, COS 2023v1 Série 2, CPV 2025–2026.
     - **ICNF** (Instituto da Conservação da Natureza e das Florestas): 6.º Inventário Florestal Nacional (IFN6, 2019/2021).
     - **Flora-On / Sociedade Portuguesa de Botânica**: Official Portuguese botanical phenology monographs.
     - **iNaturalist**: Live geotagged field observations in Portugal (place_id: 7122).
2. **Absolute Zero Data Fabrication (Honesty Principle)**:
   - Never fabricate or guess phenological statuses or land-cover codes.
   - If a phenological phase has **0 matching species** for a selected period (for example, `foliage_fallen` in mid-October when deciduous canopies are still golden/green), **explicitly show 0 species** and set the WMS CQL filter to `cos25v1_n4_c = 'NONE'`, explaining to the user in the `#active-layer-explainer` banner that leaves have not fallen yet, rather than falling back to unfiltered layers.
3. **No General Scrubland in Forest Filters**:
   - `6.1.1.1` (`Matos` / general Mediterranean maquis & treeless brush — ~1.5 million ha) must **never** be included in forest CQL filters (`FOREST_TYPE_CQL.all`, `deciduous`, `orchard_shrub`, etc.). It overwhelms the map and confuses users who are searching for true tree-covered woodland.
4. **Full Trilingual Parity Across All Features**:
   - Every UI string, species card, location profile, and DGT COS Level 4 land-cover translation must exist in `ru`, `pt`, and `en`.
   - The default language is Russian (`state.lang = 'ru'`), with instant one-click switching to `pt` and `en`.

---

## 3. Architecture & File Structure

The project is designed with a lightweight, dependency-free architecture relying only on Leaflet 1.9.4 from CDN:

```
c:\Users\alebedev\Documents\antigravity\Florestas\
├── index.html       # HTML5 Semantic layout & DOM structure
├── styles.css       # Botanical-cartographic styles, glassmorphism, responsive & zoom rules
├── data.js          # Authoritative dataset (sources, species, locations, stats, COS dictionary)
├── app.js           # State machine, Leaflet map management, CQL filters, events, inspector
├── cos-dict.json    # Reference export of all 101 DGT COS Level 4 classes with translations
├── geo-data.js      # GENERATED snapshot for Minerals mode (window.FLORESTAS_GEO) — do not hand-edit
├── geo-areas.js     # GENERATED from LNEG shapefiles: potential areas + MCE caves (window.FLORESTAS_GEO_AREAS)
├── scripts/fetch-geodata.mjs  # Regenerates geo-data.js from LNEG + OpenStreetMap
├── scripts/import-lneg-shapefiles.mjs  # Builds geo-areas.js from downloaded LNEG zips
├── package.json     # devDependencies for the scripts only (the site itself has none)
└── AGENTS.md        # This specification file
```

### Detailed Component Roles:

- **`index.html`**:
  - Top header with trilingual language switcher (`ru`, `pt`, `en`) and official data badge.
  - Sidebar:
    - Time Machine calendar: Month dropdown (1–12) and Decade selector (`early` 1–10, `mid` 11–20, `late` 21–31) with dynamic season summary banner.
    - Preset tabs (`FILTER_PRESETS`): *Visão Geral* (no filters), *Trilhos de Outono* (deciduous × golden foliage), *Flor & Fruto* (flowering + fruiting). A preset only sets the chips below (visibly, with a flash); a tab is highlighted only while the chips match it exactly.
    - Forest Type filter pills: All, Eucalyptus, Pine, Deciduous, Montado, Orchards & Carob.
    - Phenology filter pills: All, Flowering, Fruiting, Golden Foliage, Fallen Leaves, Evergreen.
    - Active Phenomenon breakdown card (`#card-active-phenomenon`): Live chips of blooming/fruiting/yellowing species for the selected decade.
    - Specific Tree Species filter section (`#wms-panel`): Dropdown and quick pills for 1-click WMS CQL isolation.
    - WMS layer toggle & live iNaturalist toggle.
    - Search input & tabs (*Florestas & Trilhos*, *Guia de Espécies*, *Estatísticas ICNF*).
  - Map Canvas (`<main class="map-container">`):
    - Leaflet container (`#map`).
    - Top status bar (`#map-status-bar`): Marker toggle button, base map switcher, WMS radar indicator, iNaturalist counter, map hint.
    - Floating Active Layer & Phenomenon Explainer banner (`#active-layer-explainer`): Dynamic explanation of active polygons + reset button (`#btn-reset-filters`).
    - Collapsible interactive cartographic legend (`#map-legend`).
    - Floating parcel inspector drawer (`#parcel-inspector`): Displays Level 4 land-cover name, code, area in ha, GPS coordinates, nearest mountain/region, and forest/non-forest badge.
  - Modals: Detail modal (`#modal-detail`) with phenology chart & trails, and sources modal (`#modal-sources`).

- **`styles.css`**:
  - Dark botanical palette (`--color-forest-900: #0d1e17`, `--color-forest-400: #52b788`, amber `#f59e0b`, rose `#f472b6`).
  - **Zoom-Responsive Marker Classes** on `#map`:
    - `.map-zoom-far` (`zoom <= 7`): Markers become sleek 24px circular pins showing emoji only (`.marker-pill-name` and `.marker-pill-event` set to `display: none !important;`). Hover triggers `.custom-leaflet-tooltip`. iNaturalist markers shrink to 10px dots.
    - `.map-zoom-mid` (`zoom 8–9`): Displays emoji + short location name.
    - `.map-zoom-close` (`zoom >= 10`): Displays full badge with event details and elevation.
  - `.active-layer-explainer`: Glassmorphic floating card with amber/emerald accent borders, responsive positioning, and warning mode styles (`.warning-mode`).
  - Inspector badges: `.inspector-badge.badge-forest` (emerald) vs `.inspector-badge.badge-nonforest` (amber).

- **`data.js`**:
  - Exports `FLORESTAS_DATA` to global scope (and `module.exports` for Node tests).
  - Contains:
    - `sources`: 5 official sources (DGT COS, DGT CPV, ICNF IFN6, Flora-On, iNaturalist).
    - `wmsConfig`: Official GeoServer endpoint (`https://geo2.dgterritorio.gov.pt/geoserver/ows`), layer ID `COS-S2:cos2025v1-s2`.
    - `species`: 16 core Portuguese tree and shrub taxa with exact `dgtCosCodes`, `inatTaxonId`, phenological calendars (`floweringMonths`, `fruitingMonths`, `autumnTiming`), and trilingual descriptions.
    - `locations`: 55 forested serras, national/natural parks, and national forests with GPS coordinates, elevation, regional phenology, and walking trails. Newer records also carry `sources` (URLs read) and `sourceNotes` (uncertainties). Rules: `speciesIds` only where a source names the tree as dominant/notable — an empty list renders as "no species data" (`foliage.status: 'unknown'`), never as evergreen; `trails` empty when no marked trail is documented (never invent PR codes); `autumnWalkRating` may be `null` (no rating shown).
    - Maples, poplars and ash are not modelled as species: sourced flowering months exist (Flora iberica, UTAD) but no sourced autumn-colour timing for Portugal. They are covered on the map only through COS 5.1.1.8 inside the "deciduous" chip.
    - `regionalStats`: Forest distribution percentages from IFN6 (Norte, Centro, Lisboa e Vale do Tejo, Alentejo, Algarve).
    - `cosN4Translations`: Complete dictionary of all 101 official DGT COS Level 4 classes (`1.1.1.1` to `9.3.4.1`) with `ru`, `pt`, `en`, and `isForest` flag.

- **`app.js`**:
  - State machine: `state.lang`, `state.month`, `state.decade`, `state.forestTypes` (Set), `state.phenoStates` (Set), `state.specificSpecies`, `state.wmsEnabled`, `state.markersVisible`, `state.inspectedParcel`.
  - Base maps: Esri World Dark Gray Canvas (default), Esri World Topographic Map (`World_Topo_Map`), and Esri Satellite (`World_Imagery`) — all 100% free, keyless, watermark-free, and compatible with `file:///` (do NOT use `tile.openstreetmap.org`, as OSM blocks `file:///` requests lacking an HTTP `Referer` header with HTTP 403).
  - DGT WMS integration: Real-time `setParams({ CQL_FILTER: cql, _t: Date.now() })` cache-busting.
  - Filter model: forest-type and phenology chips are multi-select — OR inside a group, AND between groups. The WMS CQL is the intersection of the two COS code sets (`getActiveCodeSet()`); an empty intersection must show `NONE` with an explanation, never fall back to unfiltered polygons. Picking a single species overrides and clears the chips. `#filter-summary` states what is on the map.
  - `onMapClick(e)`: Issues WMS `GetFeatureInfo` in EPSG:4326/JSON to DGT GeoServer; extracts polygon GeoJSON and highlights it on map (`highlightParcelLayer`); resolves N4 code via `getParcelTranslation` and renders parcel in inspector.
  - Real-time active layer explainer updater (`updateActiveLayerExplainer()`).
  - Public interface exported on `window.florestasApp`.

---

## 3b. Minerals Mode (Forests ⇄ Minerals switch)

The header switch (`.map-mode-btn`, `setMapMode()` in app.js) swaps the forest layers (DGT WMS, location markers, iNaturalist, parcel inspector) for a minerals view drawn from `geo-data.js`:

- **Mineral occurrences** — LNEG **CRM2023** "Depósitos de Matérias-Primas Críticas" (`https://sig.lneg.pt/server/rest/services/CRM2023/MapServer`, point layers 7 = critical, 6 = critical & strategic, 5 = strategic), built from SIORMINP records, CC BY 4.0. Fields kept: name, SIORMINP id, substances (element symbols / PT mineral names), size class, genesis, SIORMINP record link. It covers EU critical/strategic raw materials only — say so in the UI. The full SIORMINP service (`OcorrenciasMinerais/MapServer`, 9 commodity-group layers, with municipality/district) is the preferred upgrade, but its query endpoint was timing out on 2026-10-16.
- Raw attribute values are translated through `MIN_VALUE_I18N` in app.js (pt = LNEG original wording); add new values there when a refresh introduces them.
- **Mineral potential areas** — LNEG "Áreas potenciais de recursos minerais" (2022), 9 polygon layers (`AREA_GROUPS` in app.js), each a separately toggled tag. They show geological potential only; never describe them as mines or reserves. Drawn in the `mineralAreas` pane (z 350) under the point markers.
- **MCE caves** (`kind: 'cave_mce'`) — LNEG algares (Pé da Pedreira) and grutas (Codaçal) of the Maciço Calcário Estremenho, a separate layer from OSM caves. Keep the "coordinates not field-validated" note when `validated === false`.
- Both come from LNEG shapefile downloads, converted by `scripts/import-lneg-shapefiles.mjs` (needs `npm install`: shapefile + proj4) into **`geo-areas.js`** (`window.FLORESTAS_GEO_AREAS`, generated — do not hand-edit). The MCE shapefiles have no `.prj`; they are ETRS89 / PT-TM06 (EPSG:3763). The source zips stay out of git (`zipped_data/` is ignored).
- Every object popup and the parcel inspector carry an "Open in Google Maps" link (`googleMapsUrl()`).
- **Caves, mines, abandoned mines** — OpenStreetMap via Overpass (`natural=cave_entrance`, `man_made=mineshaft|adit`, `historic=mine`, `abandoned:/disused:` prefixes), ODbL. Mines without an abandoned/disused/historic tag are labelled "status unknown" — never assume they are active.
- Both live services are slow or rate-limited and `file:///` cannot fetch JSON, so data is **snapshotted**: `node scripts/fetch-geodata.mjs` (or `--osm-only` to keep the LNEG part). Record the snapshot dates; the UI shows them.
- Mindat (`mindat.org/loc-14425.html`) has no keyless API and sits behind Cloudflare: use it only as an outbound search link, never as a scraped source.
- Popups for caves and mines must keep the safety warning.

## 4. DGT COS 2025 Série 2 (`COS-S2:cos2025v1-s2`) Reference Codes

The official DGT COS Level 4 classification uses hierarchical codes (`Level 1 . Level 2 . Level 3 . Level 4`). Key forest and tree codes used across this codebase:

| Code | Portuguese Label (DGT) | English Translation | Russian Translation | Forest? |
|---|---|---|---|:---:|
| `5.1.1.1` | Florestas de sobreiro | Cork oak closed forests | Леса пробкового дуба (сомкнутые sobreirais) | Yes |
| `5.1.1.2` | Florestas de azinheira | Holm oak closed forests | Леса каменного дуба (сомкнутые azinhais) | Yes |
| `5.1.1.3` | Florestas de outros carvalhos | Deciduous oak forests (*Q. robur, pyrenaica, faginea*) | Дубравы черешчатого, пиренейского и португальского дубов | Yes |
| `5.1.1.4` | Florestas de castanheiro | Sweet chestnut forests & groves (*soutos*) | Каштановые леса и рощи (*soutos*) | Yes |
| `5.1.1.5` | Florestas de alfarrobeira | Carob tree woodlands | Рожковые рощи (*alfarrobeiras*) | Yes |
| `5.1.1.6` | Florestas de eucalipto | Eucalyptus forests & pulp plantations | Эвкалиптовые леса и плантации | Yes |
| `5.1.1.7` | Florestas de acácias e outras infestantes | Invasive acacia and exotic broadleaf stands | Насаждения акаций и инвазивных древесных пород | Yes |
| `5.1.1.8` | Florestas de outras folhosas | Other broadleaf forests (birch, poplars, ash, willow) | Березовые, ясеневые, ольховые и прочие широколиственные леса | Yes |
| `5.1.2.1` | Florestas de pinheiro bravo | Maritime pine forests (*Pinus pinaster*) | Леса приморской сосны (*pinheiro-bravo*) | Yes |
| `5.1.2.2` | Florestas de pinheiro manso | Stone / umbrella pine forests (*Pinus pinea*) | Леса средиземноморской пинии (*pinheiro-manso*) | Yes |
| `5.1.2.3` | Florestas de outras resinosas | Other coniferous forests (cypress, cedar, douglas-fir) | Леса прочих хвойных пород (кипарисы, кедры, псевдотсуга) | Yes |
| `4.1.x.x` | Superfícies agrossilvícolas de … | Agro-silvicultural systems (trees over crops): cork, holm, other oaks, other broadleaf, stone pine, other conifers | Агролесоводство (деревья над пашней) | Yes |
| `4.2.x.x` | Superfícies silvopastoris de … | Silvopastoral systems (trees over pasture) — the classic montado for `.1.1`/`.1.2` | Сильвопастораль (деревья над пастбищем), классический монтаду | Yes |
| `2.2.2.1` | Pomares em copa de baixa densidade | Low-density (traditional) orchards — any crop | Сады низкой плотности (любые культуры) | Yes (traditional) |
| `2.2.2.2` | Pomares em copa de alta densidade | High-density orchards — any crop | Сады высокой плотности | **No** (Agri) |
| `2.2.2.3` | Pomares em sebe | Hedge orchards — any crop | Шпалерные сады | **No** (Agri) |
| `6.1.1.1` | Matos | Shrublands, Mediterranean maquis & heath | Кустарниковые заросли (маки, вересковые пустоши) | **No** (Scrub) |
| `2.2.1.1` | Vinhas | Vineyards | Виноградники | **No** (Agri) |
| `2.2.3.x` | Olival em copa de baixa / alta densidade / em sebe | Olive groves | Оливковые рощи | **No** (Agri) |

> **Verified against the live server** (`GetLegendGraphic&FORMAT=application/json` on `COS-S2:cos2025v1-s2`, 2026-10-16). COS 2.2.2.x are orchard *density/form* classes, **not crop types** — COS cannot isolate almond, chestnut or nut orchards. Re-check labels against that legend rather than guessing.

### Species ↔ COS mapping rules:
- Species with `cosRole: 'associated'` (strawberry tree, hawthorn, almond) have no COS class of their own; their `dgtCosCodes` are typical habitat only. They must not drive phenology-state polygon filters (`DATA.isCosMappable`).
- COS has no elevation, so nationwide phenology filters use `DATA.getNationalAutumnStatus` (a species matches if the phase occurs in any altitude zone). Location markers use the location's own zone.
- `phenology.leafOutMonth` keeps deciduous species bare in early spring until leaf-out.

### Important Filter Constraints:
- **`FOREST_TYPE_CQL.all`**:
  ```sql
  cos25v1_n1_c = '5' OR cos25v1_n1_c = '4' OR cos25v1_n4_c = '2.2.2.1'
  ```
- **`FOREST_TYPE_CQL.deciduous`**:
  ```sql
  cos25v1_n4_c IN ('5.1.1.3', '5.1.1.4', '5.1.1.8', '4.1.1.3', '4.1.1.4', '4.2.1.3', '4.2.1.4')
  ```
- **`FOREST_TYPE_CQL.eucalyptus`**: `cos25v1_n4_c = '5.1.1.6'`
- **`FOREST_TYPE_CQL.pine`**: `cos25v1_n4_c IN ('5.1.2.1', '5.1.2.2', '5.1.2.3', '4.1.2.1', '4.1.2.2', '4.2.2.1', '4.2.2.2')`
- **`FOREST_TYPE_CQL.montado`**: `cos25v1_n4_c IN ('5.1.1.1', '5.1.1.2', '4.1.1.1', '4.1.1.2', '4.2.1.1', '4.2.1.2')`
- **`FOREST_TYPE_CQL.orchard_shrub`**: `cos25v1_n4_c IN ('5.1.1.5', '2.2.2.1', '2.2.2.2', '2.2.2.3')`

---

## 5. Verification & Testing Guidelines

Before committing or completing any modifications, always execute an automated verification check using Node.js to validate:
1. JavaScript syntax of `data.js` and `app.js`.
2. Completeness and validity of `DATA.cosN4Translations` (101 codes).
3. Presence of all essential DOM elements and IDs in `index.html`.
4. Absence of `6.1.1.1` in forest CQL queries.
5. Presence of required responsive and zoom CSS rules in `styles.css`.

### Running Verification Script:

Execute the following command in PowerShell:

```powershell
node -e "
const fs = require('fs');
console.log('Testing data.js syntax...');
const data = require('./data.js');
console.log('✓ data.js OK. Species:', data.species.length, 'Locations:', data.locations.length, 'COS Translations:', Object.keys(data.cosN4Translations).length);

console.log('Testing app.js syntax...');
const appJs = fs.readFileSync('app.js', 'utf8');
new Function(appJs);
console.log('✓ app.js OK');

console.log('Checking 6.1.1.1 exclusion...');
if (appJs.includes(\"5.1.1.5', '6.1.1.1'\") || appJs.includes(\"2.2.2.3', '6.1.1.1'\")) {
  throw new Error('6.1.1.1 Matos found in forest filters!');
}
console.log('✓ 6.1.1.1 Matos excluded from forest filters');

console.log('Checking DOM IDs in index.html...');
const html = fs.readFileSync('index.html', 'utf8');
['active-layer-explainer', 'btn-reset-filters', 'parcel-inspector', 'inspector-status-badge', 'val-parcel-name'].forEach(id => {
  if (!html.includes('id=\"' + id + '\"')) throw new Error('Missing ID: ' + id);
});
console.log('✓ Critical DOM IDs present');

console.log('ALL INTEGRITY CHECKS PASSED');
"
```

If all checks pass, the repository is verified and ready for deployment.
