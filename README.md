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
  * Миндальные, черешневые и рожковые сады (*Prunus dulcis*, *Prunus avium*, *Ceratonia siliqua*)
* **Фенология и Машина времени сезона**: просмотр по любому месяцу и декаде года — что сейчас цветёт (миндаль, черешня, земляничное дерево и др.), что плодоносит (каштаны, медронхо, пиньоны, жёлуди, рожковое дерево, боярышник) и где в горах желтеет или уже опала осенняя листва.
* **Инспектор участков по клику**: клик в любую точку Португалии возвращает официальный кадастровый контур и перевод типа землепользования DGT COS (101 класс уровня N4).
* **Живые наблюдения iNaturalist (2016–2026)**: геопривязанные фотографии исследовательского уровня (*Research Grade*) с территории Португалии.

---

## 🇵🇹 Sobre o Projeto (PT-PT)

Aplicação cartográfica interativa trilingue (`RU` / `PT-PT` / `EN`) dedicada à distribuição florestal de Portugal Continental, fenologia sazonal (floração e frutificação) e monitorização da folhagem de outono.

* **Fontes Oficiais (2016–2026)**:
  * **DGT (Direção-Geral do Território)** — Carta de Uso e Ocupação do Solo `COS 2025v1 Série 2` (`COS-S2:cos2025v1-s2`).
  * **ICNF** — *6.º Inventário Florestal Nacional (IFN6)*.
  * **Flora-On / Sociedade Portuguesa de Botânica** — Calendários fenológicos de floração e frutificação.
  * **iNaturalist API** — Observações georreferenciadas em Portugal Continental (`place_id=7122`).

---

## 🇬🇧 About the Project (EN)

Interactive trilingual (`RU` / `PT-PT` / `EN`) web map exploring mainland Portugal's forests, tree and shrub phenology (blooming and fruiting seasons), and elevation-stratified autumn foliage dynamics.

* Zero-server static architecture (`index.html`, `styles.css`, `data.js`, `app.js`) powered by Leaflet 1.9.4.
* See [AGENTS.md](./AGENTS.md) for developer documentation and data integrity guidelines.
