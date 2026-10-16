# 🌲 Florestas de Portugal — Интерактивная карта лесов, цветения и осенней листвы Португалии

🌐 **Открыть карту онлайн (GitHub Pages):** **[https://goosedriver.github.io/florestas/](https://goosedriver.github.io/florestas/)**

---

## 🇷🇺 О проекте (RU)

Интерактивная трёхъязычная (`RU` / `PT-PT` / `EN`) карта лесов материковой Португалии, сезонной фенологии (цветение и плодоношение деревьев и кустарников) и динамики осенней листвы.

### Возможности:
* **Официальная карта лесов DGT COS 2025 v1 (`COS-S2:cos2025v1-s2`)**: прямая потоковая отрисовка полигонов лесного покрова с государственного геосервера *Direção-Geral do Território (DGT)* с фильтрацией по породам (`CQL_FILTER`):
  * Эвкалиптовые леса (*Eucalyptus globulus*)
  * Сосновые и хвойные леса (*Pinus pinaster*, *Pinus pinea*)
  * Листопадные дубравы, каштановые рощи и буковые леса (*Quercus robur*, *Quercus pyrenaica*, *Castanea sativa*, *Fagus sylvatica*, *Betula celtiberica*)
  * Вечнозелёные дубы Монтаду (*Quercus suber* — пробковый дуб, *Quercus rotundifolia* — каменный дуб)
  * Сады и рожковые рощи: фильтр «сады» охватывает плодовые сады (в классе COS 2.2.2.x культуры не различаются — сюда входит и миндаль) и рожковые рощи (*Ceratonia siliqua*)
* **Фенология и Машина времени сезона**: просмотр по любому месяцу и декаде года — что сейчас цветёт (миндаль, черешня, земляничное дерево и др.), что плодоносит (каштаны, медронхо, пиньоны, жёлуди, рожковое дерево, боярышник) и где в горах желтеет или уже опала осенняя листва.
* **Инспектор участков по клику**: клик в любую точку Португалии возвращает официальный кадастровый контур и перевод типа землепользования DGT COS (101 класс уровня N4).
* **Живые наблюдения iNaturalist (2016–2026)**: геопривязанные фотографии исследовательского уровня (*Research Grade*) с территории Португалии.
* **Переключатель «Леса ⇄ Минералы» в шапке**: в режиме «Минералы» слои лесов заменяются на:
  * **Месторождения и проявления LNEG** — карта *«Depósitos de Matérias-Primas Críticas em Portugal Continental»* (CRM2023, на основе базы SIORMINP) от *Laboratório Nacional de Energia e Geologia (LNEG)*: 1 171 проявление критического и стратегического для ЕС сырья (вольфрам, марганец, медь, полевой шпат, сурьма, титан, литий, ниобий/тантал и др.), лицензия CC BY 4.0. Фильтр по веществу (цветные чипы) и классу ЕС (критическое / стратегическое / оба), поиск и сортировка (название, вещество, класс, с севера на юг, тип объекта).
  * **Пещеры (333), шахты и штольни с неизвестным статусом (86) и заброшенные рудники (49)** из OpenStreetMap (© участники OpenStreetMap, ODbL). Во всплывающих окнах пещер и шахт показано предупреждение о безопасности.
  * Важно: CRM2023 охватывает только критическое и стратегическое сырьё, а не все полезные ископаемые; данные OSM неполны.
* **Обновление данных о минералах**: данные — статический снимок в `geo-data.js`, пересоздаётся командой `node scripts/fetch-geodata.mjs` (флаг `--osm-only` обновляет только OpenStreetMap). Серверы LNEG и Overpass часто медленные — поэтому и нужен снимок; он же позволяет сайту работать с `file:///`.

---

## 🇵🇹 Sobre o Projeto (PT-PT)

Aplicação cartográfica interativa trilingue (`RU` / `PT-PT` / `EN`) dedicada à distribuição florestal de Portugal Continental, fenologia sazonal (floração e frutificação) e monitorização da folhagem de outono.

* **Fontes Oficiais (2016–2026)**:
  * **DGT (Direção-Geral do Território)** — Carta de Uso e Ocupação do Solo `COS 2025v1 Série 2` (`COS-S2:cos2025v1-s2`).
  * **ICNF** — *6.º Inventário Florestal Nacional (IFN6)*.
  * **Flora-On / Sociedade Portuguesa de Botânica** — Calendários fenológicos de floração e frutificação.
  * **iNaturalist API** — Observações georreferenciadas em Portugal Continental (`place_id=7122`).
  * **LNEG (Laboratório Nacional de Energia e Geologia)** — mapa *«Depósitos de Matérias-Primas Críticas em Portugal Continental»* (CRM2023, base de dados SIORMINP), CC BY 4.0.
  * **OpenStreetMap** — grutas, minas e galerias (© colaboradores do OpenStreetMap, ODbL).

* **Alternador «Florestas ⇄ Minerais»** no cabeçalho: no modo Minerais, as camadas florestais dão lugar a 1 171 ocorrências de matérias-primas críticas e estratégicas da UE do LNEG (CRM2023: tungsténio, manganês, cobre, feldspato, antimónio, titânio, lítio, nióbio/tântalo, etc.), com filtro por substância e classe UE, pesquisa e ordenação, e a grutas (333), minas e galerias de estado desconhecido (86) e minas abandonadas (49) do OpenStreetMap, com aviso de segurança nos popups. O CRM2023 cobre apenas matérias-primas críticas/estratégicas, não todos os minerais, e o OSM é incompleto.
* **Atualizar os dados de minerais**: instantâneo estático em `geo-data.js`, regenerado com `node scripts/fetch-geodata.mjs` (`--osm-only` atualiza só o OpenStreetMap). Os servidores do LNEG e do Overpass são frequentemente lentos, daí o instantâneo, que também permite o funcionamento a partir de `file:///`.

---

## 🇬🇧 About the Project (EN)

Interactive trilingual (`RU` / `PT-PT` / `EN`) web map exploring mainland Portugal's forests, tree and shrub phenology (blooming and fruiting seasons), and elevation-stratified autumn foliage dynamics.

* **Forests ⇄ Minerals switch** in the header: in Minerals mode the forest layers are replaced by:
  * **LNEG mineral occurrences** — the *"Depósitos de Matérias-Primas Críticas em Portugal Continental"* map (CRM2023, built from the SIORMINP database) by the *Laboratório Nacional de Energia e Geologia (LNEG)*: 1,171 occurrences of EU critical and strategic raw materials (tungsten, manganese, copper, feldspar, antimony, titanium, lithium, niobium/tantalum, etc.), CC BY 4.0. Filter by substance (colour-coded chips) and EU class (critical / strategic / both), search, and sort (name, substance, class, north→south, site type).
  * **Caves (333), mines and adits with unknown status (86) and abandoned mines (49)** from OpenStreetMap (© OpenStreetMap contributors, ODbL). Popups for caves and mines carry a safety warning.
  * Note: CRM2023 covers critical/strategic raw materials only, not every mineral, and OpenStreetMap is incomplete.
* Orchard filter: COS 2.2.2.x does not distinguish crops, so "orchards" includes almond and other orchards, plus carob woodland.
* Data sources: DGT COS, ICNF IFN6, Flora-On, iNaturalist, LNEG CRM2023 / SIORMINP (CC BY 4.0) and OpenStreetMap (ODbL).
* Zero-server static architecture (`index.html`, `styles.css`, `data.js`, `geo-data.js`, `app.js`) powered by Leaflet 1.9.4.

### Updating the minerals data

The minerals data is a static snapshot in `geo-data.js`, regenerated with `node scripts/fetch-geodata.mjs` (use `--osm-only` to refresh only OpenStreetMap). The LNEG and Overpass servers are often slow, which is why the snapshot exists; it also keeps the site working from `file:///`.

* See [AGENTS.md](./AGENTS.md) for developer documentation and data integrity guidelines.
