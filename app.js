/**
 * FLORESTAS DE PORTUGAL — Main Application Logic
 * Integrates DGT COS 2025 WMS with exact CQL polygon filtering,
 * Esri Dark Gray Canvas base map (free, no API key),
 * Active phenomena breakdown (what is blooming, fruiting, yellowing right now),
 * Informative map marker badges, and trilingual UI (ru, pt, en).
 */

(function () {
  'use strict';

  if (typeof window.FLORESTAS_DATA === 'undefined') {
    console.error('FLORESTAS_DATA not found. Make sure data.js is loaded prior to app.js');
    return;
  }

  const DATA = window.FLORESTAS_DATA;

  // =========================================================================
  // Application State
  // =========================================================================
  const state = {
    lang: 'ru', // Default to Russian as requested
    month: 10,  // October default
    decade: 'mid', // 'early' (1-10), 'mid' (11-20), 'late' (21-31)
    mode: 'all', // 'all', 'autumn_walk', 'blooming_fruiting'
    forestType: 'all', // 'all', 'eucalyptus', 'pine', 'deciduous', 'montado', 'orchard_shrub'
    specificSpecies: 'all', // 'all' or speciesId (e.g. 'castanea_sativa')
    phenoState: 'all', // 'all', 'flowering', 'fruiting', 'foliage_yellowing', 'foliage_fallen', 'foliage_green'
    searchQuery: '',
    activeTab: 'locations', // 'locations', 'species', 'stats'
    wmsEnabled: true,
    wmsOpacity: 0.85, // High clarity default
    inatLiveEnabled: true,
    markersVisible: true,
    baseMapIndex: 0, // 0: Esri Dark Gray, 1: OSM, 2: Esri Satellite
    selectedLocation: null,
    selectedSpecies: null,
    inspectedParcel: null,
    mapMode: 'forests', // 'forests' or 'minerals'
    minerals: {
      layers: { minerals: true, cave: true, cave_mce: true, mine: true, mine_abandoned: true },
      areaGroups: null, // null = all LNEG potential-area groups visible; otherwise a Set of group keys
      group: 'all',
      substance: 'all',
      sort: 'name',
      query: ''
    }
  };

  // Map and layer references
  let map = null;
  let baseTileLayers = [];
  let wmsLayer = null;
  let locationsLayerGroup = null;
  let inatLayerGroup = null;
  let highlightParcelLayer = null;

  // Marker cache for quick lookup
  const locationMarkers = {};

  // =========================================================================
  // UI Translations Dictionary
  // =========================================================================
  const UI_STRINGS = {
    ru: {
      appTitle: 'Леса Португалии',
      appSubtitle: 'Официальная карта DGT COS 2025 • Фенология цветения & урожая • Осенний трекер листвы',
      dataSourcesBadge: 'Официальные данные DGT (2016–2026)',
      dateSelectorLabel: 'Машина времени: Эпоха & Фенология',
      btnResetToday: 'Сегодня (16 окт)',
      labelMonth: 'Месяц года',
      labelDecade: 'Период / Декада',
      decadeEarly: 'Начало (1–10)',
      decadeMid: 'Середина (11–20)',
      decadeLate: 'Конец (21–31)',
      modeAll: 'Все леса & фенология',
      modeAutumn: 'Осенние прогулки 🍂',
      modeBlooming: 'Цветение & Плоды 🌸🌰',
      titleForestType: 'Тип леса (DGT / ICNF)',
      forestAll: 'Все типы лесов',
      forestEucalyptus: 'Эвкалипты (845 тыс. га)',
      forestPine: 'Сосновые (890 тыс. га)',
      forestDeciduous: 'Листопадные дубравы & каштаны',
      forestMontado: 'Монтадо (пробковый и каменный дуб)',
      forestOrchard: 'Сады (в т.ч. миндаль) & рожковое дерево',
      titlePhenoFilter: 'Фенология & Листва',
      phenoAll: 'Все состояния',
      phenoFlowering: 'Активное цветение',
      phenoFruiting: 'Спелые плоды (каштан, земляничник, желуди)',
      phenoYellowing: 'Желтые / Золотые листья (Пик для прогулок)',
      phenoFallen: 'Опавшая листва (Оголенные ветви)',
      phenoGreen: 'Зеленая / Вечнозеленая крона',
      titleSpeciesFilter: 'Фильтр по конкретным деревьям (DGT COS 2025)',
      labelSpecificSpecies: 'Конкретный вид (Изолировать полигоны WMS)',
      allSpeciesOption: 'Все виды (согласно выбранному типу леса)',
      titleActivePheno: 'Что сейчас происходит в природе (кликните для фильтра на карте):',
      sectionFruiting: '🌰 Плодоносят / Созревают сейчас:',
      sectionFlowering: '🌸 Цветут сейчас:',
      sectionFoliage: '🍂 Осенняя листва & Листопад:',
      labelToggleCos: 'Полигоны DGT COS 2025',
      descWmsCos: 'Синхронизация фильтра CQL в реальном времени',
      labelToggleInat: 'Живые наблюдения iNaturalist',
      descInatLive: 'Проверенные фотонаблюдения (2016–2026)',
      searchPlaceholder: 'Поиск лесов, видов, горных хребтов, троп...',
      tabLocations: 'Леса & Тропы',
      tabSpecies: 'Гид по породам',
      tabStats: 'Статистика ICNF',
      mapHint: 'Кликните на карту, чтобы узнать категорию участка DGT COS 2025',
      btnMarkersOn: 'Метки: ВКЛ',
      btnMarkersOff: 'Метки: ВЫКЛ (только лес)',
      legendTitle: 'Картографическая легенда & Фенология',
      legendMarkers: 'Лесные массивы и горные хребты',
      legendPheno: 'Состояние листвы и плодов в выбранный период',
      legendCos: 'Официальные цвета WMS DGT COS 2025 v1',
      legEuc: 'Эвкалипты',
      legPine: 'Сосновые',
      legDeciduous: 'Листопадные дубы и каштаны',
      legMontado: 'Монтадо (пробка / каменный дуб)',
      legOrchard: 'Сады и рожковые рощи',
      legFolYellow: 'Золотая / Желтая листва (Идеально для прогулок)',
      legFolFallen: 'Опавшая листва / Ковер на земле',
      legFlowering: 'Идет цветение',
      legFruiting: 'Созревание плодов / Сбор урожая',
      inspectorTitle: 'Сведения об участке земли DGT',
      lblPropName: 'Тип покрова (N4):',
      lblPropCode: 'Код COS 2025:',
      lblPropArea: 'Площадь полигона:',
      lblPropCoords: 'Координаты:',
      lblPropRegion: 'Регион / Муниципалитет:',
      btnZoomParcel: 'Приблизить к участку',
      sourcesKicker: 'Прозрачность данных и методология',
      sourcesTitle: 'Официальные источники и фенологическая модель (2016–2026)',
      btnUnderstand: 'Понятно / Исследовать карту',
      detailNowHeading: 'Состояние в выбранный период',
      lblBoxFoliage: 'Осенняя листва',
      lblBoxFlowering: 'Цветение',
      lblBoxFruiting: 'Плоды & Семена',
      detailPhenoChart: 'Годовой фенологический календарь (12 месяцев)',
      chartLegend: '🌸 Цветение • 🌰 Плоды • 🍂 Золотая листва • 🪵 Голые ветви',
      detailTrailsHeading: 'Рекомендуемые пешеходные маршруты',
      detailInatPhotos: 'Полевые фотонаблюдения (iNaturalist)',
      btnRefreshInat: 'Обновить фото',
      inatLoading: 'Загрузка фотонаблюдений iNaturalist...',
      btnClose: 'Закрыть',
      btnLocateMap: 'Показать на карте',
      loadingLocations: 'Загрузка лесов и пешеходных маршрутов...',
      noResults: 'По вашему запросу ничего не найдено',
      walkScore: 'Оценка для осенних прогулок',
      elevation: 'Высота',
      routePR: 'Пешеходный маршрут',
      statNationalTitle: '6-я Национальная лесная инвентаризация (IFN6)',
      statNationalDesc: 'Леса покрывают 3,2 млн га (36% территории материковой Португалии), еще 2,6 млн га занимают кустарники и пастбища.'
    },

    pt: {
      appTitle: 'Florestas de Portugal',
      appSubtitle: 'Distribuição Oficial DGT COS 2025 • Fenologia Sazonal • Rastreador de Folhagem Outonal',
      dataSourcesBadge: 'Fontes Oficiais DGT (2016–2026)',
      dateSelectorLabel: 'Máquina do Tempo: Época & Fenologia',
      btnResetToday: 'Hoje (16 Out)',
      labelMonth: 'Mês do Ano',
      labelDecade: 'Período / Década',
      decadeEarly: 'Início (dias 1–10)',
      decadeMid: 'Meio (dias 11–20)',
      decadeLate: 'Fim (dias 21–31)',
      modeAll: 'Visão Geral & Fenologia',
      modeAutumn: 'Trilhos de Outono 🍂',
      modeBlooming: 'Flor & Fruto 🌸🌰',
      titleForestType: 'Tipos de Floresta em Portugal',
      forestAll: 'Todas as Florestas',
      forestEucalyptus: 'Eucaliptais (845 mil ha)',
      forestPine: 'Pinhais & Resinosas (890 mil ha)',
      forestDeciduous: 'Folhosas Caducifólias (Carvalhos/Castanheiros)',
      forestMontado: 'Montado (Sobreiro & Azinheira - 1M ha)',
      forestOrchard: 'Pomares (incl. amendoal) & Alfarrobais',
      titlePhenoFilter: 'Fenologia & Estado das Folhas',
      phenoAll: 'Todos os Estados',
      phenoFlowering: 'Floração Ativa',
      phenoFruiting: 'Fruto Maduro (Castanha/Medronho/Bolota)',
      phenoYellowing: 'Folhas Amarelas / Douradas (Pico de Passeio)',
      phenoFallen: 'Folhas Caídas (Inverno / Ramos Despidos)',
      phenoGreen: 'Copa Verde / Perenifólia',
      titleSpeciesFilter: 'Filtrar por Espécie Arbórea (DGT COS 2025)',
      labelSpecificSpecies: 'Espécie Específica (Isolar Polígonos WMS)',
      allSpeciesOption: 'Todas as espécies (conforme o tipo florestal selecionado)',
      titleActivePheno: 'O Que Está a Acontecer Agora (Clique para Isolar no Mapa):',
      sectionFruiting: '🌰 Fruto / Maturação Neste Período:',
      sectionFlowering: '🌸 Floração Ativa:',
      sectionFoliage: '🍂 Folhagem de Outono & Queda de Folha:',
      labelToggleCos: 'Polígonos Oficiais DGT COS 2025',
      descWmsCos: 'Filtro CQL sincronizado em tempo real',
      labelToggleInat: 'iNaturalist Observações Vivas',
      descInatLive: 'Registos de campo validados (2016–2026)',
      searchPlaceholder: 'Pesquisar serras, matas, castanheiros, medronho...',
      tabLocations: 'Florestas & Trilhos',
      tabSpecies: 'Guia de Espécies',
      tabStats: 'Estatísticas ICNF',
      mapHint: 'Clique no mapa para consultar a parcela DGT COS 2025',
      btnMarkersOn: 'Marcadores: LIGADOS',
      btnMarkersOff: 'Marcadores: DESLIGADOS (só floresta)',
      legendTitle: 'Legenda Cartográfica & Fenologia',
      legendMarkers: 'Marcadores Florestais & Serras',
      legendPheno: 'Estado das Folhas & Frutos no Período Selecionado',
      legendCos: 'Cores Oficiais WMS DGT COS 2025 v1',
      legEuc: 'Eucaliptais',
      legPine: 'Pinhais & Resinosas',
      legDeciduous: 'Folhosas Caducifólias (Carvalho/Castanheiro)',
      legMontado: 'Montado (Sobreiro/Azinheira)',
      legOrchard: 'Pomares & Alfarrobais',
      legFolYellow: 'Folhas Douradas / Amarelas (Ideal para Passear)',
      legFolFallen: 'Folhas já caídas no solo',
      legFlowering: 'Floração em curso',
      legFruiting: 'Fruto maduro / Colheita',
      inspectorTitle: 'Informação da Parcela de Solo',
      lblPropName: 'Uso do Solo (N4):',
      lblPropCode: 'Código COS 2025:',
      lblPropArea: 'Área do Polígono:',
      lblPropCoords: 'Coordenadas:',
      lblPropRegion: 'Concelho / Região:',
      btnZoomParcel: 'Aproximar Parcela',
      sourcesKicker: 'Transparência & Dados Oficiais',
      sourcesTitle: 'Fontes Oficiais & Metodologia Fenológica (2016–2026)',
      btnUnderstand: 'Entendido / Explorar Mapa',
      detailNowHeading: 'Estado no Período Selecionado',
      lblBoxFoliage: 'Folhagem de Outono',
      lblBoxFlowering: 'Floração',
      lblBoxFruiting: 'Fruto & Semente',
      detailPhenoChart: 'Calendário Fenológico Anual (12 Meses)',
      chartLegend: '🌸 Flor • 🌰 Fruto • 🍂 Folha Dourada • 🪵 Ramo Despido',
      detailTrailsHeading: 'Trilhos Pedonais Recomendados para Outono',
      detailInatPhotos: 'Observações & Fotografias de Campo (iNaturalist)',
      btnRefreshInat: 'Atualizar Fotografias',
      inatLoading: 'A carregar registos fotográficos do iNaturalist...',
      btnClose: 'Fechar',
      btnLocateMap: 'Centrar no Mapa',
      loadingLocations: 'A carregar florestas e percursos de outono...',
      noResults: 'Nenhum local ou espécie encontrada para estes filtros',
      walkScore: 'Classificação para passeios de outono',
      elevation: 'Altitude',
      routePR: 'Percurso Pedestre',
      statNationalTitle: 'Inventário Florestal Nacional (IFN6)',
      statNationalDesc: 'Portugal possui 3,2 milhões de hectares de floresta (36% do território continental), complementados por 2,6 milhões de ha de matos e pastagens.'
    },

    en: {
      appTitle: 'Forests of Portugal',
      appSubtitle: 'Official DGT COS 2025 Distribution • Seasonal Phenology • Autumn Foliage Tracker',
      dataSourcesBadge: 'Official DGT Data (2016–2026)',
      dateSelectorLabel: 'Time Machine: Season & Phenology',
      btnResetToday: 'Today (16 Oct)',
      labelMonth: 'Month of the Year',
      labelDecade: 'Period / Ten-day Period',
      decadeEarly: 'Early (days 1–10)',
      decadeMid: 'Mid (days 11–20)',
      decadeLate: 'Late (days 21–31)',
      modeAll: 'Overview & Phenology',
      modeAutumn: 'Autumn Foliage Walks 🍂',
      modeBlooming: 'Bloom & Fruit 🌸🌰',
      titleForestType: 'Forest Types of Portugal',
      forestAll: 'All Forest Types',
      forestEucalyptus: 'Eucalyptus (845k ha)',
      forestPine: 'Pine & Conifers (890k ha)',
      forestDeciduous: 'Deciduous Broadleaf (Oaks/Chestnut)',
      forestMontado: 'Montado (Cork & Holm Oak - 1M ha)',
      forestOrchard: 'Orchards (incl. almond) & Carob',
      titlePhenoFilter: 'Phenology & Foliage State',
      phenoAll: 'All States',
      phenoFlowering: 'Active Blooming',
      phenoFruiting: 'Ripe Fruit (Chestnuts/Medronho/Acorns)',
      phenoYellowing: 'Yellow / Golden Foliage (Peak Walk Season)',
      phenoFallen: 'Fallen Leaves (Winter / Bare Branches)',
      phenoGreen: 'Green / Evergreen Canopy',
      titleSpeciesFilter: 'Filter by Specific Tree & Shrub Species (DGT COS 2025)',
      labelSpecificSpecies: 'Specific Tree / Shrub Species (Isolate WMS Polygons)',
      allSpeciesOption: 'All species (matching active forest filter)',
      titleActivePheno: 'What is Happening in Nature Right Now (Click to Filter Map):',
      sectionFruiting: '🌰 Fruiting / Ripe Harvest in this Period:',
      sectionFlowering: '🌸 Active Flowering:',
      sectionFoliage: '🍂 Autumn Foliage & Leaf Drop:',
      labelToggleCos: 'DGT COS 2025 Polygons',
      descWmsCos: 'Real-time synchronized CQL filter',
      labelToggleInat: 'Live iNaturalist Observations',
      descInatLive: 'Research-grade verified photos (2016–2026)',
      searchPlaceholder: 'Search forests, species, mountains, trails...',
      tabLocations: 'Forests & Trails',
      tabSpecies: 'Species Guide',
      tabStats: 'ICNF Statistics',
      mapHint: 'Click anywhere on the map to query official DGT COS 2025 parcel data',
      btnMarkersOn: 'Markers: ON',
      btnMarkersOff: 'Markers: OFF (forest only)',
      legendTitle: 'Cartographic Legend & Phenology',
      legendMarkers: 'Forest Locations & Mountains',
      legendPheno: 'Foliage & Fruiting State in Selected Period',
      legendCos: 'Official WMS DGT COS 2025 v1 Colors',
      legEuc: 'Eucalyptus',
      legPine: 'Pine & Conifers',
      legDeciduous: 'Deciduous Broadleaf (Oaks/Chestnut)',
      legMontado: 'Montado (Cork & Holm Oak)',
      legOrchard: 'Orchards & Carob',
      legFolYellow: 'Golden / Amber Foliage (Ideal for Walking)',
      legFolFallen: 'Fallen Leaves / Forest Floor Carpet',
      legFlowering: 'Active Blooming',
      legFruiting: 'Ripe Fruit / Harvest Season',
      inspectorTitle: 'DGT Land Parcel Information',
      lblPropName: 'Land Cover (N4):',
      lblPropCode: 'COS 2025 Code:',
      lblPropArea: 'Polygon Area:',
      lblPropCoords: 'Coordinates:',
      lblPropRegion: 'Municipality / Region:',
      btnZoomParcel: 'Zoom to Parcel',
      sourcesKicker: 'Transparency & Official Data',
      sourcesTitle: 'Official Data Sources & Phenological Methodology (2016–2026)',
      btnUnderstand: 'Understood / Explore Map',
      detailNowHeading: 'Status in Selected Period',
      lblBoxFoliage: 'Autumn Foliage',
      lblBoxFlowering: 'Flowering',
      lblBoxFruiting: 'Fruit & Seeds',
      detailPhenoChart: 'Annual Phenology Calendar (12 Months)',
      chartLegend: '🌸 Bloom • 🌰 Fruit • 🍂 Golden Foliage • 🪵 Bare Branches',
      detailTrailsHeading: 'Recommended Autumn Walking Trails',
      detailInatPhotos: 'Field Observations & Photos (iNaturalist)',
      btnRefreshInat: 'Refresh Photos',
      inatLoading: 'Loading iNaturalist observations...',
      btnClose: 'Close',
      btnLocateMap: 'Center on Map',
      loadingLocations: 'Loading forests and autumn routes...',
      noResults: 'No locations or species found for these filters',
      walkScore: 'Autumn walk rating',
      elevation: 'Elevation',
      routePR: 'Walking Trail',
      statNationalTitle: '6th National Forest Inventory (IFN6)',
      statNationalDesc: 'Portugal features 3.2 million hectares of forest (36% of the mainland), complemented by 2.6 million ha of shrublands and pastures.'
    }
  };

  const MONTH_NAMES = {
    ru: ['01 • Январь', '02 • Февраль', '03 • Март', '04 • Апрель', '05 • Май', '06 • Июнь', '07 • Июль', '08 • Август', '09 • Сентябрь', '10 • Октябрь', '11 • Ноябрь', '12 • Декабрь'],
    pt: ['01 • Janeiro', '02 • Fevereiro', '03 • Março', '04 • Abril', '05 • Maio', '06 • Junho', '07 • Julho', '08 • Agosto', '09 • Setembro', '10 • Outubro', '11 • Novembro', '12 • Dezembro'],
    en: ['01 • January', '02 • February', '03 • March', '04 • April', '05 • May', '06 • June', '07 • July', '08 • August', '09 • September', '10 • October', '11 • November', '12 • December']
  };

  const ZONE_NAMES = {
    ru: { high_mountain: 'высокогорье', mid_mountain: 'среднегорье', lowland_coastal: 'равнины и побережье', south: 'юг' },
    pt: { high_mountain: 'alta montanha', mid_mountain: 'média montanha', lowland_coastal: 'planície e litoral', south: 'sul' },
    en: { high_mountain: 'high mountains', mid_mountain: 'mid-elevations', lowland_coastal: 'lowlands & coast', south: 'south' }
  };

  // =========================================================================
  // DGT COS Level 4 Exact CQL Code Mapping (Clean forest codes, excludes 6.1.1.1 Matos)
  // Note: COS 2.2.2.x classes are orchard *density/form* classes (low density, high density,
  // hedge), not crop types — COS cannot isolate almond or chestnut orchards. Only traditional
  // low-density orchards (2.2.2.1, flagged isForest in cosN4Translations) join the forest view.
  // =========================================================================
  const FOREST_TYPE_CQL = {
    all: "cos25v1_n1_c = '5' OR cos25v1_n1_c = '4' OR cos25v1_n4_c = '2.2.2.1'",
    eucalyptus: "cos25v1_n4_c = '5.1.1.6'",
    pine: "cos25v1_n4_c IN ('5.1.2.1', '5.1.2.2', '5.1.2.3', '4.1.2.1', '4.1.2.2', '4.2.2.1', '4.2.2.2')",
    deciduous: "cos25v1_n4_c IN ('5.1.1.3', '5.1.1.4', '5.1.1.8', '4.1.1.3', '4.1.1.4', '4.2.1.3', '4.2.1.4')",
    montado: "cos25v1_n4_c IN ('5.1.1.1', '5.1.1.2', '4.1.1.1', '4.1.1.2', '4.2.1.1', '4.2.1.2')",
    orchard_shrub: "cos25v1_n4_c IN ('5.1.1.5', '2.2.2.1', '2.2.2.2', '2.2.2.3')"
  };

  // =========================================================================
  // Seasonal Summary Generator
  // =========================================================================
  function getSeasonalSummary(month, decade, lang) {
    const period = `${month}.${decade === 'early' ? 1 : decade === 'mid' ? 2 : 3}`;
    const titles = {
      ru: {
        '10.2': 'Середина октября в Португалии',
        '10.1': 'Начало октября в Португалии',
        '10.3': 'Конец октября в Португалии',
        '11.1': 'Начало ноября в Португалии',
        '11.2': 'Середина ноября (Сан-Мартинью)',
        '11.3': 'Конец ноября в Португалии'
      },
      pt: {
        '10.2': 'Meados de Outubro em Portugal',
        '10.1': 'Início de Outubro em Portugal',
        '10.3': 'Finais de Outubro em Portugal',
        '11.1': 'Início de Novembro em Portugal',
        '11.2': 'Meados de Novembro (São Martinho)',
        '11.3': 'Finais de Novembro em Portugal'
      },
      en: {
        '10.2': 'Mid-October in Portugal',
        '10.1': 'Early October in Portugal',
        '10.3': 'Late October in Portugal',
        '11.1': 'Early November in Portugal',
        '11.2': 'Mid-November (Saint Martin)',
        '11.3': 'Late November in Portugal'
      }
    };

    const descriptions = {
      ru: {
        '10.2': 'Пожелтение каштанов, буков и берёз набирает силу в высокогорьях Серра-да-Эштрела и Монтезинью (пик — в конце октября); одновременное цветение и созревание ягод земляничного дерева в Моншике; осыпание желудей в монтадо.',
        '10.1': 'Первые золотистые штрихи на высоких склонах Жереша и Монтезинью; сбор каштанов в Траз-уж-Монтиш; сбор шишек и зрелые смолистые сосняки.',
        '10.3': 'Максимальный багряно-медный навес на Rota das Faias в Мантейгаше; каштановые ярмарки; зрелые алые ягоды земляничника в Алгарве.',
        '11.1': 'Золотая листва спускается в предгорья (Бусаку, Сан-Мамеде); традиционный праздник жареных каштанов Магушту.',
        '11.2': 'Огненный ковер из опавших листьев на горных тропах; праздник Сан-Мартинью; активный откорм свиней желудями (montanheira) в Алентежу.',
        '11.3': 'Листопад завершается на севере; зеленое великолепие вечнозеленых лесов монтадо и сосновых боров.'
      },
      pt: {
        '10.2': 'Amarelecimento em curso nos soutos, faiais e bidoeirais de altitude da Serra da Estrela e Montesinho (pico no final de outubro); floração e medronhos maduros em simultâneo em Monchique; queda da bolota nos montados.',
        '10.1': 'Primeiras tonalidades douradas nas encostas altas do Gerês e Montesinho; arranque da apanha da castanha em Trás-os-Montes; pinhais costeiros viçosos.',
        '10.3': 'Abóbada de cobre e âmbar na Rota das Faias de Manteigas; soutos transmontanos radiantes; medronhos vermelhos maduros nas encostas de Monchique.',
        '11.1': 'Cores de outono atingem as cotas médias e vales (Buçaco, Serra de São Mamede); aroma a castanhas assadas e festas tradicionais de Magusto.',
        '11.2': 'Época de São Martinho: tapetes dourados estendidos pelos trilhos; época de montanheira no Alentejo com abundância de bolota doce de sobreiro e azinheira.',
        '11.3': 'Conclusão da queda da folha nas serras nortenhas; contraste majestoso com a verdura perene dos montados e pinhais do litoral.'
      },
      en: {
        '10.2': 'Yellowing under way in high-elevation chestnut, beech and birch stands of Serra da Estrela & Montesinho (peak in late October); simultaneous flowering and red berries on strawberry trees in Monchique; acorn drop in the montado.',
        '10.1': 'First golden hues on the high ridges of Gerês and Montesinho; beginning of the sweet chestnut harvest in Trás-os-Montes; vibrant coastal pine woods.',
        '10.3': 'Fiery copper-amber canopy along the Rota das Faias in Manteigas; glowing chestnut groves; brilliant red ripe medronho berries in the Algarve hills.',
        '11.1': 'Autumn coloration descends to mid-elevations (Buçaco, Serra de São Mamede); traditional Magusto chestnut roasting festivals across the country.',
        '11.2': 'Saint Martin season: golden carpets spread across mountain footpaths; traditional montanheira grazing in Alentejo under abundant acorn fall.',
        '11.3': 'Leaf fall winds down in northern peaks; evergreen montados and maritime pines remain deep emerald.'
      }
    };

    if (!descriptions[lang][period]) {
      const monthObj = DATA.getPhenologyByMonth(month);
      const flCount = monthObj.flowering.length;
      const frCount = monthObj.fruiting.length;
      const monthName = MONTH_NAMES[lang][month - 1];

      return {
        title: `${monthName} • ${decade === 'early' ? '1–10' : decade === 'mid' ? '11–20' : '21–31'}`,
        desc: lang === 'ru'
          ? `В этом периоде цветут ${flCount} видов и плодоносят ${frCount} видов деревьев и кустарников Португалии.`
          : lang === 'pt'
          ? `Neste período encontram-se ${flCount} espécies em floração e ${frCount} espécies florestais em fase de frutificação em Portugal.`
          : `During this period, ${flCount} key species are blooming and ${frCount} are bearing ripe fruit across mainland Portugal.`
      };
    }

    return {
      title: titles[lang][period] || titles['pt'][period],
      desc: descriptions[lang][period] || descriptions['pt'][period]
    };
  }

  // =========================================================================
  // Helper: Compute Phenology & Autumn State for a Location
  // =========================================================================
  function computeLocationStatus(loc, month, decade) {
    const decadeNum = decade === 'early' ? 1 : decade === 'mid' ? 2 : 3;
    const periodKey = `${month}.${decadeNum}`;

    const locSpecies = (loc.speciesIds || [])
      .map(id => DATA.getSpeciesById(id))
      .filter(Boolean);

    const floweringSpecies = locSpecies.filter(s => s.phenology && s.phenology.floweringMonths.indexOf(month) !== -1);
    const fruitingSpecies = locSpecies.filter(s => s.phenology && s.phenology.fruitingMonths.indexOf(month) !== -1);

    const isFlowering = floweringSpecies.length > 0;
    const isFruiting = fruitingSpecies.length > 0;

    const deciduousSpecies = locSpecies.filter(s => s.leafType === 'deciduous' || s.category === 'deciduous');

    let dominantFoliage = {
      status: 'evergreen',
      color: '#2d6a4f',
      label: { ru: 'Вечнозеленый', pt: 'Perenifólio', en: 'Evergreen' }
    };

    if (deciduousSpecies.length > 0) {
      let highestRank = 0;
      let chosenStatus = null;
      // Every state present at the site, so e.g. "fallen" still matches a forest whose
      // birches are bare while its chestnuts are at peak colour
      const statuses = [];

      deciduousSpecies.forEach(sp => {
        const st = DATA.getAutumnStatus(sp, loc, periodKey);
        if (st) {
          if (statuses.indexOf(st.status) === -1) statuses.push(st.status);
          const rank = DATA.FOLIAGE_RANK[st.status] || 0;
          if (rank >= highestRank) {
            highestRank = rank;
            chosenStatus = st;
          }
        }
      });

      if (chosenStatus) {
        dominantFoliage = Object.assign({}, chosenStatus, { statuses });
      }
    }

    return {
      isFlowering,
      isFruiting,
      floweringSpecies,
      fruitingSpecies,
      foliage: dominantFoliage,
      periodKey
    };
  }

  // =========================================================================
  // Dynamic CQL Filter Generator (Calculates exact COS level 4 codes)
  // =========================================================================
  function calculateActiveCql() {
    // 1. If a specific species is chosen, that takes strict priority
    if (state.specificSpecies !== 'all') {
      const sp = DATA.getSpeciesById(state.specificSpecies);
      if (sp && sp.dgtCosCodes && sp.dgtCosCodes.length > 0) {
        if (sp.dgtCosCodes.length === 1) {
          return `cos25v1_n4_c = '${sp.dgtCosCodes[0]}'`;
        }
        return `cos25v1_n4_c IN ('${sp.dgtCosCodes.join("', '")}')`;
      }
    }

    // 2. If a phenology state is chosen
    if (state.phenoState !== 'all') {
      const decadeNum = state.decade === 'early' ? 1 : state.decade === 'mid' ? 2 : 3;
      const periodKey = `${state.month}.${decadeNum}`;
      const matchingCodes = new Set();

      getMappedPhenoSpecies(state.phenoState, periodKey).mapped.forEach(sp => {
        sp.dgtCosCodes.forEach(code => matchingCodes.add(code));
      });

      if (matchingCodes.size > 0) {
        return `cos25v1_n4_c IN ('${Array.from(matchingCodes).join("', '")}')`;
      } else {
        return "cos25v1_n4_c = 'NONE'";
      }
    }

    // 3. If quick mode is active
    if (state.mode === 'autumn_walk') {
      return FOREST_TYPE_CQL.deciduous;
    } else if (state.mode === 'blooming_fruiting') {
      const activeCodes = new Set();
      DATA.species.forEach(sp => {
        const isFl = sp.phenology.floweringMonths.indexOf(state.month) !== -1;
        const isFr = sp.phenology.fruitingMonths.indexOf(state.month) !== -1;
        if ((isFl || isFr) && DATA.isCosMappable(sp)) {
          sp.dgtCosCodes.forEach(c => activeCodes.add(c));
        }
      });
      if (activeCodes.size > 0) {
        return `cos25v1_n4_c IN ('${Array.from(activeCodes).join("', '")}')`;
      }
      return "cos25v1_n4_c = 'NONE'";
    }

    // 4. Forest type filter
    if (state.forestType !== 'all') {
      return FOREST_TYPE_CQL[state.forestType] || FOREST_TYPE_CQL.all;
    }

    // 5. Default "all": Show ALL forests, montados and orchards (hide cities/roads)
    return FOREST_TYPE_CQL.all;
  }

  // =========================================================================
  // Filtering Logic (Locations & Species)
  // =========================================================================
  function matchForestType(itemCategories, dominantCat, filterType) {
    if (filterType === 'all') return true;

    const cats = Array.isArray(itemCategories) ? itemCategories.slice() : [itemCategories];
    if (dominantCat) cats.push(dominantCat);

    if (filterType === 'eucalyptus') return cats.indexOf('eucalyptus') !== -1;
    if (filterType === 'pine') return cats.indexOf('pine') !== -1;
    if (filterType === 'deciduous') return cats.indexOf('deciduous') !== -1;
    if (filterType === 'montado') return cats.indexOf('montado') !== -1 || cats.indexOf('evergreen_broadleaf') !== -1;
    if (filterType === 'orchard_shrub') return cats.indexOf('orchard_shrub') !== -1 || cats.indexOf('bloom_orchard') !== -1;

    return cats.indexOf(filterType) !== -1;
  }

  // Foliage states accepted by each phenology pill
  const PHENO_FOLIAGE_STATES = {
    foliage_yellowing: ['yellowing', 'peak_yellow'],
    foliage_fallen: ['fallen', 'falling'],
    foliage_green: ['green', 'evergreen']
  };

  function speciesMatchesPheno(sp, phenoState, periodKey) {
    if (phenoState === 'flowering') return sp.phenology.floweringMonths.indexOf(state.month) !== -1;
    if (phenoState === 'fruiting') return sp.phenology.fruitingMonths.indexOf(state.month) !== -1;
    const wanted = PHENO_FOLIAGE_STATES[phenoState];
    if (!wanted) return true;
    const nat = DATA.getNationalAutumnStatus(sp, periodKey);
    return nat.statuses.some(st => wanted.indexOf(st) !== -1);
  }

  // Species matching a phenology pill, split into those that can drive WMS polygons and
  // those without a COS class of their own (shown via markers/species list only).
  function getMappedPhenoSpecies(phenoState, periodKey) {
    const matching = DATA.species.filter(sp => speciesMatchesPheno(sp, phenoState, periodKey));
    return {
      all: matching,
      mapped: matching.filter(sp => DATA.isCosMappable(sp)),
      unmapped: matching.filter(sp => !DATA.isCosMappable(sp))
    };
  }

  function matchPhenology(statusObj, filterPheno) {
    if (filterPheno === 'all') return true;
    if (filterPheno === 'flowering') return statusObj.isFlowering;
    if (filterPheno === 'fruiting') return statusObj.isFruiting;

    const wanted = PHENO_FOLIAGE_STATES[filterPheno];
    if (!wanted) return true;
    const statuses = statusObj.foliage
      ? (statusObj.foliage.statuses || [statusObj.foliage.status])
      : ['green'];
    return statuses.some(st => wanted.indexOf(st) !== -1);
  }

  function getFilteredLocations() {
    const q = state.searchQuery.trim().toLowerCase();

    return DATA.locations.filter(loc => {
      // Specific species filter
      if (state.specificSpecies !== 'all') {
        if (!loc.speciesIds || loc.speciesIds.indexOf(state.specificSpecies) === -1) {
          return false;
        }
      }

      // Forest type filter
      if (!matchForestType(loc.categories, loc.dominantCategory, state.forestType)) {
        return false;
      }

      // Phenology filter
      const status = computeLocationStatus(loc, state.month, state.decade);
      if (!matchPhenology(status, state.phenoState)) {
        return false;
      }

      // Quick mode
      if (state.mode === 'autumn_walk') {
        const isDeciduous = (loc.categories || []).indexOf('deciduous') !== -1 || loc.dominantCategory === 'deciduous';
        const hasGoodRating = loc.autumnWalkRating && loc.autumnWalkRating >= 3;
        if (!isDeciduous && !hasGoodRating) return false;
      } else if (state.mode === 'blooming_fruiting') {
        if (!status.isFlowering && !status.isFruiting) return false;
      }

      // Search query
      if (q) {
        const namePt = (loc.names.pt || '').toLowerCase();
        const nameEn = (loc.names.en || '').toLowerCase();
        const nameRu = (loc.names.ru || '').toLowerCase();
        const reg = (loc.region || '').toLowerCase();
        const summary = (loc.summary[state.lang] || '').toLowerCase();
        const trails = (loc.trails[state.lang] || '').toLowerCase();

        const matchesSpecies = (loc.speciesIds || []).some(id => {
          const sp = DATA.getSpeciesById(id);
          if (!sp) return false;
          return (
            sp.scientificName.toLowerCase().indexOf(q) !== -1 ||
            (sp.names[state.lang] || '').toLowerCase().indexOf(q) !== -1
          );
        });

        if (
          namePt.indexOf(q) === -1 &&
          nameEn.indexOf(q) === -1 &&
          nameRu.indexOf(q) === -1 &&
          reg.indexOf(q) === -1 &&
          summary.indexOf(q) === -1 &&
          trails.indexOf(q) === -1 &&
          !matchesSpecies
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (state.mode === 'autumn_walk') {
        const stA = computeLocationStatus(a, state.month, state.decade).foliage.status;
        const stB = computeLocationStatus(b, state.month, state.decade).foliage.status;
        const priority = { peak_yellow: 3, yellowing: 2, falling: 1, fallen: 0, green: -1, evergreen: -2 };
        const scoreDiff = (priority[stB] || 0) - (priority[stA] || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.autumnWalkRating || 0) - (a.autumnWalkRating || 0);
      }
      return 0;
    });
  }

  function getFilteredSpecies() {
    const q = state.searchQuery.trim().toLowerCase();
    const decadeNum = state.decade === 'early' ? 1 : state.decade === 'mid' ? 2 : 3;
    const periodKey = `${state.month}.${decadeNum}`;

    return DATA.species.filter(sp => {
      if (state.specificSpecies !== 'all' && sp.id !== state.specificSpecies) {
        return false;
      }

      if (state.forestType !== 'all') {
        if (!matchForestType(sp.category, null, state.forestType)) {
          return false;
        }
      }

      const isFlowering = sp.phenology.floweringMonths.indexOf(state.month) !== -1;
      const isFruiting = sp.phenology.fruitingMonths.indexOf(state.month) !== -1;

      const phenoObj = { isFlowering, isFruiting, foliage: DATA.getNationalAutumnStatus(sp, periodKey) };
      if (!matchPhenology(phenoObj, state.phenoState)) {
        return false;
      }

      if (state.mode === 'autumn_walk') {
        if (sp.leafType !== 'deciduous') return false;
      } else if (state.mode === 'blooming_fruiting') {
        if (!isFlowering && !isFruiting) return false;
      }

      if (q) {
        const scName = sp.scientificName.toLowerCase();
        const commonName = (sp.names[state.lang] || '').toLowerCase();
        const desc = (sp.descriptions[state.lang] || '').toLowerCase();
        if (scName.indexOf(q) === -1 && commonName.indexOf(q) === -1 && desc.indexOf(q) === -1) {
          return false;
        }
      }

      return true;
    });
  }

  // =========================================================================
  // Leaflet Map Initialization with Esri Dark Gray (Free, No API Key)
  // =========================================================================
  function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    map = L.map('map', {
      center: [39.65, -8.0],
      zoom: 7,
      zoomControl: true,
      attributionControl: true
    });

    // 1. Esri World Dark Gray Canvas (Default: 100% Free, No Watermark, No API Key)
    const esriDarkBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
      }
    );

    const esriDarkRef = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        pane: 'overlayPane',
        opacity: 0.7,
        maxZoom: 16
      }
    );

    // 2. Esri World Topographic Map (Works on file:// without Referer 403 block, unlike tile.openstreetmap.org)
    const esriTopoBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, METI',
        maxZoom: 19
      }
    );

    // 3. Esri World Imagery (Satellite) + Reference Labels
    const esriSatBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      }
    );

    baseTileLayers = [
      { name: '🗺️ Esri Dark Gray', layers: [esriDarkBase, esriDarkRef] },
      { name: '⛰️ Esri Topo Map', layers: [esriTopoBase] },
      { name: '🛰️ Esri Satellite', layers: [esriSatBase, esriDarkRef] }
    ];

    // Add default Esri Dark Base & Reference
    esriDarkBase.addTo(map);
    esriDarkRef.addTo(map);

    // DGT COS 2025 WMS Layer
    updateWmsLayer();

    // Layer groups for markers
    locationsLayerGroup = L.layerGroup().addTo(map);
    inatLayerGroup = L.layerGroup().addTo(map);

    // Click on map to inspect official DGT COS 2025 polygon
    map.on('click', onMapClick);

    // Responsive zoom style for clean markers at distance
    map.on('zoomend', updateMarkerZoomStyle);
    updateMarkerZoomStyle();

    // Render location markers & live iNaturalist
    renderLocationMarkers();

    if (state.inatLiveEnabled) {
      loadInatObservations();
    }
  }

  function updateMarkerZoomStyle() {
    if (!map) return;
    const zoom = map.getZoom();
    const mapEl = map.getContainer();
    mapEl.classList.remove('map-zoom-far', 'map-zoom-mid', 'map-zoom-close');
    if (zoom <= 7) {
      mapEl.classList.add('map-zoom-far');
    } else if (zoom <= 9) {
      mapEl.classList.add('map-zoom-mid');
    } else {
      mapEl.classList.add('map-zoom-close');
    }
  }

  function cycleBaseMap() {
    if (!map || baseTileLayers.length === 0) return;

    // Remove current base layers
    const current = baseTileLayers[state.baseMapIndex];
    current.layers.forEach(l => map.removeLayer(l));

    // Next base map
    state.baseMapIndex = (state.baseMapIndex + 1) % baseTileLayers.length;
    const next = baseTileLayers[state.baseMapIndex];
    next.layers.forEach(l => l.addTo(map));

    // Keep WMS on top
    if (wmsLayer) {
      wmsLayer.bringToFront();
    }

    const btnText = document.getElementById('txt-btn-basemap');
    if (btnText) btnText.textContent = next.name;
  }

  // =========================================================================
  // Official DGT WMS Layer Management with Exact CQL Filtering
  // =========================================================================
  function updateWmsLayer() {
    if (!map) return;
    if (state.mapMode === 'minerals') return;

    const cql = calculateActiveCql();

    if (!wmsLayer) {
      if (!state.wmsEnabled) return;

      wmsLayer = L.tileLayer.wms(DATA.wmsConfig.url, {
        layers: 'COS-S2:cos2025v1-s2',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        opacity: state.wmsOpacity,
        maxZoom: 19,
        CQL_FILTER: cql,
        _t: Date.now(),
        attribution: 'Oficial DGT (Direção-Geral do Território COS 2025v1)'
      }).addTo(map);
    } else {
      if (!state.wmsEnabled) {
        map.removeLayer(wmsLayer);
        wmsLayer = null;
        updateActiveLayerExplainer();
        return;
      }
      wmsLayer.setParams({ CQL_FILTER: cql, _t: Date.now() });
    }

    const statusText = document.getElementById('txt-active-wms');
    if (statusText) {
      statusText.textContent = 'DGT COS 2025 v1';
    }

    updateActiveLayerExplainer();
  }

  // =========================================================================
  // DGT COS Level 4 Parcel Translation & Inspector Formatting
  // =========================================================================
  // Official Google Maps URL scheme; opens the Maps app on phones
  function googleMapsUrl(lat, lng) {
    return `https://www.google.com/maps/search/?api=1&query=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
  }

  function googleMapsLabel() {
    return state.lang === 'ru' ? 'Открыть в Google Maps' : state.lang === 'pt' ? 'Abrir no Google Maps' : 'Open in Google Maps';
  }

  function setInspectorMapsLink(latlng) {
    const link = document.getElementById('btn-gmaps-parcel');
    const label = document.getElementById('txt-btn-gmaps-parcel');
    if (link && latlng) link.href = googleMapsUrl(latlng.lat, latlng.lng);
    if (label) label.textContent = googleMapsLabel();
  }

  function getParcelTranslation(code, rawLabel) {
    if (!code) return { name: rawLabel || 'N/A', isForest: true, code: 'N/A' };
    const dict = DATA.cosN4Translations && DATA.cosN4Translations[code];
    if (dict) {
      const translated = dict[state.lang] || dict.pt || rawLabel;
      return {
        name: translated,
        isForest: dict.isForest,
        code: code,
        pt: dict.pt,
        en: dict.en,
        ru: dict.ru
      };
    }
    const isForest = code.startsWith('5.') || code.startsWith('4.');
    return { name: rawLabel || code, isForest: isForest, code: code };
  }

  function renderInspectedParcel(p, latlng) {
    const inspector = document.getElementById('parcel-inspector');
    const nameEl = document.getElementById('val-parcel-name');
    const codeEl = document.getElementById('val-parcel-code');
    const areaEl = document.getElementById('val-parcel-area');
    const coordsEl = document.getElementById('val-parcel-coords');
    const regionEl = document.getElementById('val-parcel-region');
    const statusBadge = document.getElementById('inspector-status-badge');

    if (!inspector) return;
    inspector.classList.remove('hidden');

    const code = p.cos25v1_n4_c || p.cos25v1_n3_c || '';
    const rawLabel = p.cos25v1_n4_l || p.cos25v1_n3_l || '';
    const info = getParcelTranslation(code, rawLabel);

    if (nameEl) {
      if (!info.isForest) {
        const prefix = state.lang === 'ru'
          ? 'Нелесной участок: '
          : state.lang === 'pt'
          ? 'Parcela não florestal: '
          : 'Non-forest parcel: ';
        nameEl.innerHTML = `<span style="color:#fbbf24; font-weight:700;">${prefix}</span>${info.name}`;
      } else {
        nameEl.textContent = info.name;
      }
    }

    if (codeEl) codeEl.textContent = info.code;

    if (areaEl) {
      const ha = p.Area_ha ? Number(p.Area_ha).toFixed(2) + ' ha' : 'N/A';
      areaEl.textContent = ha;
    }

    if (coordsEl && latlng) {
      coordsEl.textContent = `${latlng.lat.toFixed(4)}° N, ${Math.abs(latlng.lng).toFixed(4)}° W`;
    }

    if (statusBadge) {
      statusBadge.classList.remove('badge-forest', 'badge-nonforest');
      if (info.isForest) {
        statusBadge.classList.add('badge-forest');
        statusBadge.textContent = state.lang === 'ru' ? 'Лесной фонд DGT' : state.lang === 'pt' ? 'Floresta DGT' : 'DGT Forest Land';
      } else {
        statusBadge.classList.add('badge-nonforest');
        statusBadge.textContent = state.lang === 'ru' ? 'Нелесной участок' : state.lang === 'pt' ? 'Solo Não Florestal' : 'Non-Forest Parcel';
      }
    }

    let nearestLocName = 'Portugal Continental';
    if (latlng) {
      let minDist = Infinity;
      DATA.locations.forEach(loc => {
        const d = Math.hypot(loc.lat - latlng.lat, loc.lng - latlng.lng);
        if (d < minDist) {
          minDist = d;
          nearestLocName = loc.region ? `${loc.names[state.lang] || loc.names.pt} (${loc.region})` : loc.names[state.lang];
        }
      });
    }
    if (regionEl) regionEl.textContent = nearestLocName;
  }

  // =========================================================================
  // Click-to-Inspect DGT COS 2025 Polygon (GetFeatureInfo)
  // =========================================================================
  function onMapClick(e) {
    if (!map) return;
    collapseSheetOnMobile();
    // COS land-cover parcels are a forests-mode feature
    if (state.mapMode === 'minerals') return;

    // Query a small window centred on the click. Leaflet draws in Web Mercator while the request
    // is EPSG:4326; with a whole-viewport bbox the linear pixel→latitude mapping drifts by
    // several km at national zoom levels and returns the wrong parcel.
    const R = 5;
    const point = map.latLngToContainerPoint(e.latlng);
    const sw = map.containerPointToLatLng([point.x - R, point.y + R]);
    const ne = map.containerPointToLatLng([point.x + R, point.y - R]);

    const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
    const width = 2 * R + 1;
    const height = 2 * R + 1;
    const x = R;
    const y = R;

    const getFeatureInfoUrl =
      `${DATA.wmsConfig.url}?` +
      `SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&` +
      `LAYERS=COS-S2:cos2025v1-s2&QUERY_LAYERS=COS-S2:cos2025v1-s2&` +
      `SRS=EPSG:4326&BBOX=${bbox}&WIDTH=${width}&HEIGHT=${height}&` +
      `X=${x}&Y=${y}&INFO_FORMAT=application/json`;

    const inspector = document.getElementById('parcel-inspector');
    const nameEl = document.getElementById('val-parcel-name');
    const coordsEl = document.getElementById('val-parcel-coords');

    if (inspector) inspector.classList.remove('hidden');
    if (nameEl) nameEl.textContent = state.lang === 'ru' ? 'Запрос к серверу DGT...' : 'A consultar DGT...';
    if (coordsEl) coordsEl.textContent = `${e.latlng.lat.toFixed(4)}° N, ${Math.abs(e.latlng.lng).toFixed(4)}° W`;
    setInspectorMapsLink(e.latlng);

    fetch(getFeatureInfoUrl)
      .then(res => res.json())
      .then(json => {
        if (json && json.features && json.features.length > 0) {
          const feat = json.features[0];
          const p = feat.properties || {};

          state.inspectedParcel = { feature: feat, latlng: e.latlng };
          renderInspectedParcel(p, e.latlng);

          if (highlightParcelLayer) {
            map.removeLayer(highlightParcelLayer);
          }
          highlightParcelLayer = L.geoJSON(feat, {
            style: {
              color: '#f59e0b',
              weight: 2.5,
              fillColor: '#fbbf24',
              fillOpacity: 0.35,
              dashArray: '3, 4'
            }
          }).addTo(map);
        } else {
          state.inspectedParcel = null;
          const statusBadge = document.getElementById('inspector-status-badge');
          if (statusBadge) {
            statusBadge.classList.remove('badge-forest', 'badge-nonforest');
            statusBadge.textContent = 'DGT COS 2025v1';
          }
          if (nameEl) {
            nameEl.textContent =
              state.lang === 'ru'
                ? 'Вне классификации DGT / Водная поверхность'
                : state.lang === 'pt'
                ? 'Sem polígono DGT COS neste ponto / Água'
                : 'No DGT COS polygon at this point / Water';
          }
          const codeEl = document.getElementById('val-parcel-code');
          const areaEl = document.getElementById('val-parcel-area');
          const regionEl = document.getElementById('val-parcel-region');
          if (codeEl) codeEl.textContent = '—';
          if (areaEl) areaEl.textContent = '—';
          if (regionEl) regionEl.textContent = 'Portugal Continental';

          if (highlightParcelLayer) {
            map.removeLayer(highlightParcelLayer);
            highlightParcelLayer = null;
          }
        }
      })
      .catch(err => {
        // Never invent a parcel class or area when the DGT server cannot be reached
        console.warn('GetFeatureInfo issue:', err);
        state.inspectedParcel = null;
        if (nameEl) {
          nameEl.textContent = state.lang === 'ru'
            ? 'Сервер DGT недоступен — данные участка не получены'
            : state.lang === 'pt'
            ? 'Servidor DGT indisponível — sem dados da parcela'
            : 'DGT server unavailable — no parcel data received';
        }
        const statusBadge = document.getElementById('inspector-status-badge');
        if (statusBadge) {
          statusBadge.classList.remove('badge-forest', 'badge-nonforest');
          statusBadge.textContent = 'DGT COS 2025v1';
        }
        ['val-parcel-code', 'val-parcel-area', 'val-parcel-region'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = '—';
        });
        if (highlightParcelLayer) {
          map.removeLayer(highlightParcelLayer);
          highlightParcelLayer = null;
        }
      });
  }

  // =========================================================================
  // Informative Map Markers Rendering
  // =========================================================================
  function renderLocationMarkers() {
    if (!map || !locationsLayerGroup) return;

    locationsLayerGroup.clearLayers();

    if (!state.markersVisible) {
      renderLocationsList(getFilteredLocations());
      return;
    }

    const filtered = getFilteredLocations();

    filtered.forEach(loc => {
      const status = computeLocationStatus(loc, state.month, state.decade);

      let badgeClass = '';
      let emoji = '🌲';
      let eventText = '';

      if (status.foliage && (status.foliage.status === 'yellowing' || status.foliage.status === 'peak_yellow')) {
        badgeClass = 'pill-yellowing';
        emoji = '🍂';
        eventText = status.foliage.status === 'peak_yellow'
          ? (state.lang === 'ru' ? 'Золотой пик' : 'Pico de ouro')
          : (state.lang === 'ru' ? 'Желтеет' : 'A amarelar');
      } else if (status.foliage && status.foliage.status === 'fallen') {
        emoji = '🪵';
        eventText = state.lang === 'ru' ? 'Листья опали' : 'Folhas no solo';
      } else if (status.isFlowering) {
        badgeClass = 'pill-blooming';
        emoji = '🌸';
        const flSpecies = status.floweringSpecies.map(s => s.names[state.lang] || s.names.pt).slice(0, 2).join(', ');
        eventText = `${state.lang === 'ru' ? 'Цветёт' : 'Floração'}: ${flSpecies}`;
      } else if (status.isFruiting) {
        badgeClass = 'pill-fruiting';
        emoji = '🌰';
        const frSpecies = status.fruitingSpecies.map(s => s.names[state.lang] || s.names.pt).slice(0, 2).join(', ');
        eventText = `${state.lang === 'ru' ? 'Плоды' : 'Fruto'}: ${frSpecies}`;
      } else {
        eventText = loc.elevationM ? `${loc.elevationM}m` : loc.region;
      }

      const shortName = (loc.names[state.lang] || loc.names.pt).split('(')[0].trim();

      const pillHtml = `
        <div class="custom-marker-pill ${badgeClass}">
          <span>${emoji}</span>
          <span class="marker-pill-name">${shortName}</span>
          ${eventText ? `<span class="marker-pill-event">(${eventText})</span>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        html: pillHtml,
        className: 'leaflet-custom-pill-wrapper',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: icon });

      const fullTitle = loc.names[state.lang] || loc.names.pt;
      const walkScore = loc.autumnWalkRating ? `⭐ ${loc.autumnWalkRating}/5` : '';
      const foliageLbl = status.foliage ? status.foliage.label[state.lang] : '';

      const tooltipContent = `${fullTitle}${eventText ? ' • ' + eventText : ''}`;
      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -14],
        opacity: 0.95,
        className: 'custom-leaflet-tooltip'
      });

      const popupContent = `
        <div class="custom-popup-content">
          <h4 class="custom-popup-title">${fullTitle}</h4>
          <p class="custom-popup-sub">${loc.region} • ${loc.elevationM}m ${walkScore ? '• ' + walkScore : ''}</p>
          <div style="margin: 6px 0; font-size: 0.76rem; color: #d8f3dc;">
            <strong>${status.foliage.status !== 'evergreen' ? '🍂 ' : '🌿 '}${foliageLbl}</strong>
            ${status.isFlowering ? '<br>🌸 ' + (state.lang === 'ru' ? 'Идет цветение: ' : 'Floração: ') + status.floweringSpecies.map(s => s.names[state.lang] || s.names.pt).join(', ') : ''}
            ${status.isFruiting ? '<br>🌰 ' + (state.lang === 'ru' ? 'Спелые плоды: ' : 'Fruto: ') + status.fruitingSpecies.map(s => s.names[state.lang] || s.names.pt).join(', ') : ''}
          </div>
          <button class="custom-popup-btn" onclick="window.florestasApp.openLocationModal('${loc.id}')">
            ${state.lang === 'ru' ? 'Подробно & Маршруты' : state.lang === 'pt' ? 'Ver Detalhes & Trilhos' : 'View Details & Trails'}
          </button>
          <a class="popup-gmaps-link" href="${googleMapsUrl(loc.lat, loc.lng)}" target="_blank" rel="noopener">📍 ${googleMapsLabel()} ↗</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(locationsLayerGroup);

      locationMarkers[loc.id] = marker;
    });

    renderLocationsList(filtered);
  }

  // =========================================================================
  // Active Phenomenon Breakdown Generator (What is Blooming/Fruiting/Yellowing)
  // =========================================================================
  function renderActivePhenomenonCard() {
    const container = document.getElementById('container-active-phenomenon');
    const periodTag = document.getElementById('tag-active-period');

    if (!container) return;

    const decadeNum = state.decade === 'early' ? 1 : state.decade === 'mid' ? 2 : 3;
    const periodKey = `${state.month}.${decadeNum}`;

    if (periodTag) {
      periodTag.textContent = `${MONTH_NAMES[state.lang][state.month - 1].split('•')[1].trim()} (${decadeNum === 1 ? '1–10' : decadeNum === 2 ? '11–20' : '21–31'})`;
    }

    const fruitingSpecies = DATA.species.filter(s => s.phenology.fruitingMonths.indexOf(state.month) !== -1);
    const floweringSpecies = DATA.species.filter(s => s.phenology.floweringMonths.indexOf(state.month) !== -1);
    const deciduousSpecies = DATA.species.filter(s => s.leafType === 'deciduous');

    const s = UI_STRINGS[state.lang];

    let html = '';

    // 1. Fruiting section
    if (fruitingSpecies.length > 0) {
      html += `
        <div class="active-pheno-section">
          <div class="active-pheno-section-title">${s.sectionFruiting}</div>
          <div class="active-pheno-pills-row">
            ${fruitingSpecies.map(sp => {
              const common = sp.names[state.lang] || sp.names.pt;
              const detail = sp.phenomenonDetails && sp.phenomenonDetails.fruiting ? sp.phenomenonDetails.fruiting[state.lang] : '';
              const isSelected = state.specificSpecies === sp.id;
              return `
                <button class="active-species-pill ${isSelected ? 'selected' : ''}" onclick="window.florestasApp.filterBySpecies('${sp.id}')" title="${detail}">
                  <span>${sp.icon || '🌰'}</span>
                  <span><strong>${common}</strong>${detail ? ' — ' + detail : ''}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 2. Flowering section
    if (floweringSpecies.length > 0) {
      html += `
        <div class="active-pheno-section">
          <div class="active-pheno-section-title" style="color: #f472b6;">${s.sectionFlowering}</div>
          <div class="active-pheno-pills-row">
            ${floweringSpecies.map(sp => {
              const common = sp.names[state.lang] || sp.names.pt;
              const detail = sp.phenomenonDetails && sp.phenomenonDetails.flowering ? sp.phenomenonDetails.flowering[state.lang] : '';
              const isSelected = state.specificSpecies === sp.id;
              return `
                <button class="active-species-pill pill-blooming ${isSelected ? 'selected' : ''}" onclick="window.florestasApp.filterBySpecies('${sp.id}')" title="${detail}">
                  <span>🌸</span>
                  <span><strong>${common}</strong>${detail ? ' — ' + detail : ''}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 3. Foliage section (Autumn)
    if (deciduousSpecies.length > 0) {
      html += `
        <div class="active-pheno-section">
          <div class="active-pheno-section-title" style="color: #fbbf24;">${s.sectionFoliage}</div>
          <div class="active-pheno-pills-row">
            ${deciduousSpecies.map(sp => {
              const common = sp.names[state.lang] || sp.names.pt;
              const fol = DATA.getNationalAutumnStatus(sp, periodKey);
              const folLbl = fol ? fol.label[state.lang] : '';
              const zoneHint = fol && fol.statuses.length > 1 ? ` (${ZONE_NAMES[state.lang][fol.zone]})` : '';
              const zoneDetail = fol ? fol.byZone.map(z => `${ZONE_NAMES[state.lang][z.zone]}: ${z.label[state.lang]}`).join('\n') : '';
              const isSelected = state.specificSpecies === sp.id;
              return `
                <button class="active-species-pill ${isSelected ? 'selected' : ''}" onclick="window.florestasApp.filterBySpecies('${sp.id}')" title="${zoneDetail}">
                  <span>🍂</span>
                  <span><strong>${common}</strong>: ${folLbl}${zoneHint}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // =========================================================================
  // Live iNaturalist Observations
  // =========================================================================
  function loadInatObservations() {
    if (!map || !inatLayerGroup) return;

    inatLayerGroup.clearLayers();

    const inatStatusText = document.getElementById('txt-inat-status');
    if (inatStatusText) {
      inatStatusText.textContent = state.lang === 'ru' ? 'iNaturalist: Загрузка...' : 'iNaturalist: A carregar...';
    }

    let taxonParam = '50868,121763,82689,82723,54227,1520309,56037,56038';
    if (state.specificSpecies !== 'all') {
      const selectedSp = DATA.getSpeciesById(state.specificSpecies);
      if (selectedSp && selectedSp.inatTaxonId) {
        taxonParam = selectedSp.inatTaxonId;
      }
    }

    const inatUrl =
      `https://api.inaturalist.org/v1/observations?place_id=7122&` +
      `taxon_id=${taxonParam}&quality_grade=research&photos=true&per_page=45&order_by=observed_on`;

    fetch(inatUrl)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.results) return;

        data.results.forEach(obs => {
          if (!obs.geojson || !obs.geojson.coordinates) return;

          const lng = obs.geojson.coordinates[0];
          const lat = obs.geojson.coordinates[1];
          const photoUrl = obs.photos && obs.photos[0] ? obs.photos[0].url.replace('square', 'medium') : null;
          const spName = obs.taxon ? obs.taxon.name : 'Plantae';
          const commonName = obs.taxon && obs.taxon.preferred_common_name ? obs.taxon.preferred_common_name : spName;
          const observer = obs.user ? obs.user.login : 'iNaturalist';
          const obsDate = obs.observed_on || '2025/2026';

          const inatIcon = L.divIcon({
            html: `
              <div class="inat-pin-dot">
                <span>📷</span>
              </div>
            `,
            className: 'inat-div-marker',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            popupAnchor: [0, -12]
          });

          const inatMarker = L.marker([lat, lng], { icon: inatIcon });

          const popupHtml = `
            <div style="width: 220px; font-size: 0.78rem;">
              ${photoUrl ? `<img src="${photoUrl}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" alt="${spName}">` : ''}
              <div style="font-weight: 700; color: #f4ede4; font-size: 0.88rem;">${commonName}</div>
              <div style="font-style: italic; color: #9eb5aa; font-size: 0.72rem; margin-bottom: 4px;">${spName}</div>
              <div style="color: #d8f3dc; font-size: 0.72rem;">📍 ${obs.place_guess || 'Portugal'}</div>
              <div style="color: #6b8277; font-size: 0.68rem; margin-top: 4px;">👤 @${observer} • 🗓️ ${obsDate}</div>
              <a href="${obs.uri}" target="_blank" rel="noopener" style="display: inline-block; margin-top: 6px; font-size: 0.72rem; color: #f59e0b; font-weight: 600;">
                ${state.lang === 'ru' ? 'Открыть в iNaturalist ↗' : state.lang === 'pt' ? 'Ver no iNaturalist ↗' : 'View on iNaturalist ↗'}
              </a>
            </div>
          `;

          inatMarker.bindPopup(popupHtml);
          inatMarker.addTo(inatLayerGroup);
        });

        if (inatStatusText) {
          inatStatusText.textContent =
            state.lang === 'ru'
              ? `iNaturalist: ${data.results.length} фото`
              : `iNaturalist: ${data.results.length} obs.`;
        }
      })
      .catch(err => {
        console.warn('Failed to load iNaturalist live stream:', err);
        if (inatStatusText) {
          inatStatusText.textContent = 'iNaturalist: Offline';
        }
      });
  }

  // =========================================================================
  // Sidebar Lists: Locations, Species & Stats
  // =========================================================================
  function renderLocationsList(locations) {
    const container = document.getElementById('list-locations');
    const countBadge = document.getElementById('count-locations');

    if (countBadge) countBadge.textContent = locations.length;
    if (!container) return;

    if (locations.length === 0) {
      container.innerHTML = `
        <div class="list-placeholder">
          <p>${UI_STRINGS[state.lang].noResults}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = locations.map(loc => {
      const status = computeLocationStatus(loc, state.month, state.decade);
      const title = loc.names[state.lang] || loc.names.pt;
      const walkScore = loc.autumnWalkRating ? `⭐ ${loc.autumnWalkRating}/5` : '';

      let foliageClass = '';
      if (status.foliage && (status.foliage.status === 'yellowing' || status.foliage.status === 'peak_yellow')) {
        foliageClass = 'badge-yellowing';
      }

      return `
        <div class="location-item-card" onclick="window.florestasApp.openLocationModal('${loc.id}')">
          <div class="location-header-row">
            <div>
              <div class="location-name">${title}</div>
              <div class="location-region">${loc.region} • ${loc.elevationM}m</div>
            </div>
            ${walkScore ? `<span class="tag-badge badge-yellowing" title="${UI_STRINGS[state.lang].walkScore}">${walkScore}</span>` : ''}
          </div>
          <div class="location-tags-row">
            <span class="tag-badge ${foliageClass}">${status.foliage.status !== 'evergreen' ? '🍂 ' : '🌿 '}${status.foliage.label[state.lang]}</span>
            ${status.isFlowering ? `<span class="tag-badge badge-flowering">🌸 ${state.lang === 'ru' ? 'Цветет' : 'Floração'}</span>` : ''}
            ${status.isFruiting ? `<span class="tag-badge badge-fruiting">🌰 ${state.lang === 'ru' ? 'Плодоносит' : 'Frutificação'}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSpeciesList(speciesList) {
    const container = document.getElementById('list-species');
    const countBadge = document.getElementById('count-species');

    if (countBadge) countBadge.textContent = speciesList.length;
    if (!container) return;

    if (speciesList.length === 0) {
      container.innerHTML = `
        <div class="list-placeholder">
          <p>${UI_STRINGS[state.lang].noResults}</p>
        </div>
      `;
      return;
    }

    const decadeNum = state.decade === 'early' ? 1 : state.decade === 'mid' ? 2 : 3;
    const periodKey = `${state.month}.${decadeNum}`;

    container.innerHTML = speciesList.map(sp => {
      const isFlowering = sp.phenology.floweringMonths.indexOf(state.month) !== -1;
      const isFruiting = sp.phenology.fruitingMonths.indexOf(state.month) !== -1;
      const commonName = sp.names[state.lang] || sp.names.pt;

      let foliageStatus = null;
      if (sp.leafType === 'deciduous') {
        foliageStatus = DATA.getNationalAutumnStatus(sp, periodKey);
      }

      return `
        <div class="species-item-card" onclick="window.florestasApp.openSpeciesModal('${sp.id}')">
          <div class="species-card-top">
            <div>
              <div class="species-common-name">${sp.icon || '🌳'} ${commonName}</div>
              <div class="species-latin-name">${sp.scientificName}</div>
            </div>
            ${sp.sharePct ? `<span class="mono-badge">${sp.sharePct}% IFN6</span>` : ''}
          </div>
          <div class="location-tags-row">
            ${foliageStatus && foliageStatus.status !== 'green' ? `<span class="tag-badge badge-yellowing">🍂 ${foliageStatus.label[state.lang]}</span>` : `<span class="tag-badge">🌿 ${sp.leafType === 'evergreen' ? (state.lang === 'ru' ? 'Вечнозеленый' : 'Perene') : (state.lang === 'ru' ? 'Листопадный' : 'Caducifólio')}</span>`}
            ${isFlowering ? `<span class="tag-badge badge-flowering">🌸 ${state.lang === 'ru' ? 'Цветет' : 'Floração'}</span>` : ''}
            ${isFruiting ? `<span class="tag-badge badge-fruiting">🌰 ${state.lang === 'ru' ? 'Созревание' : 'Fruto'}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderStatsPanel() {
    const container = document.getElementById('stats-content');
    if (!container) return;

    const stats = DATA.regionalStats;
    const s = UI_STRINGS[state.lang];

    container.innerHTML = `
      <div class="stats-card">
        <div class="stats-card-header">
          <span class="stats-card-title">${s.statNationalTitle}</span>
          <span class="stats-badge">ICNF 2019 / DGT 2025</span>
        </div>
        <p class="stats-card-desc">${s.statNationalDesc}</p>
        <div class="stats-metrics-grid">
          <div class="stat-metric-box">
            <span class="metric-val">35.8%</span>
            <span class="metric-lbl">${state.lang === 'ru' ? 'Площадь лесов Португалии' : state.lang === 'pt' ? 'Área Florestal Nacional' : 'National Forest Cover'}</span>
          </div>
          <div class="stat-metric-box">
            <span class="metric-val">845k ha</span>
            <span class="metric-lbl">${state.lang === 'ru' ? 'Эвкалипт (26.2%)' : 'Eucalipto (26.2%)'}</span>
          </div>
          <div class="stat-metric-box">
            <span class="metric-val">720k ha</span>
            <span class="metric-lbl">${state.lang === 'ru' ? 'Пробковый дуб (22.3%)' : 'Sobreiro / Montado (22.3%)'}</span>
          </div>
          <div class="stat-metric-box">
            <span class="metric-val">713k ha</span>
            <span class="metric-lbl">${state.lang === 'ru' ? 'Приморская сосна (22.1%)' : 'Pinheiro-bravo (22.1%)'}</span>
          </div>
        </div>
      </div>

      <div class="stats-card" style="margin-top: 10px;">
        <div class="stats-card-header">
          <span class="stats-card-title">${state.lang === 'ru' ? 'Лесистость по регионам NUTS II' : state.lang === 'pt' ? 'Distribuição Regional NUTS II' : 'Regional NUTS II Distribution'}</span>
        </div>
        <div class="pills-grid" style="margin-top: 8px;">
          ${stats.nutsII.map(r => `
            <div style="background: var(--bg-dark-inset); padding: 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.82rem; color: #f4ede4;">
                <span>${r.names[state.lang] || r.names.pt}</span>
                <span class="mono" style="color: #74c69d;">${r.forestCoveragePct}%</span>
              </div>
              <div style="font-size: 0.72rem; color: #9eb5aa; margin-top: 2px;">
                ${(r.totalForestHa / 1000).toFixed(0)}k ha • ${r.dominantSpecies.map(d => {
                  const sp = DATA.getSpeciesById(d.id);
                  return (sp ? (sp.names[state.lang] || sp.names.pt) : d.id) + ' (' + d.sharePct + '%)';
                }).slice(0, 2).join(', ')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Quick Species Pills & Specific Species Filtering
  // =========================================================================
  function renderQuickSpeciesPills() {
    const container = document.getElementById('quick-species-pills');
    if (!container) return;

    const featuredIds = [
      'castanea_sativa', 'arbutus_unedo', 'quercus_suber', 'quercus_rotundifolia',
      'quercus_robur', 'fagus_sylvatica', 'pinus_pinaster', 'pinus_pinea',
      'eucalyptus_globulus', 'ceratonia_siliqua', 'crataegus_monogyna', 'prunus_dulcis'
    ];

    container.innerHTML = `
      <button class="species-pill-chip ${state.specificSpecies === 'all' ? 'active' : ''}" onclick="window.florestasApp.filterBySpecies('all')">
        🌐 ${UI_STRINGS[state.lang].forestAll}
      </button>
      ${featuredIds.map(id => {
        const sp = DATA.getSpeciesById(id);
        if (!sp) return '';
        const name = sp.names[state.lang] || sp.names.pt;
        return `
          <button class="species-pill-chip ${state.specificSpecies === sp.id ? 'active' : ''}" onclick="window.florestasApp.filterBySpecies('${sp.id}')">
            <span>${sp.icon || '🌲'}</span>
            <span>${name.split('(')[0].trim()}</span>
          </button>
        `;
      }).join('')}
    `;
  }

  function filterBySpecies(spId) {
    state.specificSpecies = spId;

    if (spId !== 'all') {
      state.forestType = 'all';
      document.querySelectorAll('.forest-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'all'));
      state.phenoState = 'all';
      document.querySelectorAll('.pheno-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-pheno') === 'all'));
      state.mode = 'all';
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'all'));
    }

    // Update select dropdown value
    const sel = document.getElementById('select-specific-species');
    if (sel) sel.value = spId;

    // Sychronize WMS polygon CQL immediately
    updateWmsLayer();

    // Re-render markers, active phenomena and sidebar
    renderLocationMarkers();
    renderSpeciesList(getFilteredSpecies());
    renderQuickSpeciesPills();
    renderActivePhenomenonCard();
  }

  function resetAllFilters() {
    state.forestType = 'all';
    state.phenoState = 'all';
    state.specificSpecies = 'all';
    state.mode = 'all';

    document.querySelectorAll('.forest-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'all'));
    document.querySelectorAll('.pheno-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-pheno') === 'all'));
    document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'all'));

    const sel = document.getElementById('select-specific-species');
    if (sel) sel.value = 'all';

    updateWmsLayer();
    renderLocationMarkers();
    renderSpeciesList(getFilteredSpecies());
    renderQuickSpeciesPills();
    renderActivePhenomenonCard();
  }

  // =========================================================================
  // Modals Management
  // =========================================================================
  function openLocationModal(locId) {
    const loc = DATA.getLocationById(locId);
    if (!loc) return;

    state.selectedLocation = loc;
    const status = computeLocationStatus(loc, state.month, state.decade);

    const modal = document.getElementById('modal-detail');
    if (!modal) return;

    document.getElementById('detail-title').textContent = loc.names[state.lang] || loc.names.pt;
    document.getElementById('detail-subtitle').textContent =
      `${loc.region} • ${UI_STRINGS[state.lang].elevation}: ${loc.elevationM}m • ${loc.autumnWalkRating ? '⭐ ' + loc.autumnWalkRating + '/5' : ''}`;
    document.getElementById('detail-description').textContent = loc.summary[state.lang] || loc.summary.pt;

    document.getElementById('detail-category').textContent =
      UI_STRINGS[state.lang]['forest' + (loc.dominantCategory.charAt(0).toUpperCase() + loc.dominantCategory.slice(1))] || loc.dominantCategory;
    document.getElementById('detail-foliage-status').textContent =
      `${status.foliage.status !== 'evergreen' ? '🍂 ' : '🌿 '}${status.foliage.label[state.lang]}`;

    document.getElementById('detail-box-foliage').textContent = status.foliage.label[state.lang];
    document.getElementById('detail-box-flowering').textContent =
      status.isFlowering
        ? status.floweringSpecies.map(s => s.names[state.lang] || s.names.pt).join(', ')
        : (state.lang === 'ru' ? 'Нет активного цветения' : 'Sem floração nesta época');
    document.getElementById('detail-box-fruiting').textContent =
      status.isFruiting
        ? status.fruitingSpecies.map(s => s.names[state.lang] || s.names.pt).join(', ')
        : (state.lang === 'ru' ? 'Период покоя семян' : 'Sem maturação nesta época');

    renderPhenologyCalendar(loc, null);

    const trailsContainer = document.getElementById('detail-trails-list');
    if (trailsContainer) {
      const trailName = loc.trails[state.lang] || loc.trails.pt;
      trailsContainer.innerHTML = `
        <div class="trail-item">
          <div class="trail-info">
            <span class="trail-title">🥾 ${trailName}</span>
            <span class="trail-meta">${UI_STRINGS[state.lang].routePR} • ${loc.elevationM}m • ${loc.region}</span>
          </div>
          <span class="trail-badge-autumn">⭐ ${loc.autumnWalkRating || 5}/5</span>
        </div>
      `;
    }

    loadLocalInatPhotos(loc.lat, loc.lng, loc.speciesIds);

    modal.classList.remove('hidden');
  }

  function openSpeciesModal(spId) {
    const sp = DATA.getSpeciesById(spId);
    if (!sp) return;

    state.selectedSpecies = sp;
    const decadeNum = state.decade === 'early' ? 1 : state.decade === 'mid' ? 2 : 3;
    const periodKey = `${state.month}.${decadeNum}`;

    const modal = document.getElementById('modal-detail');
    if (!modal) return;

    const commonName = sp.names[state.lang] || sp.names.pt;
    document.getElementById('detail-title').textContent = `${sp.icon || '🌳'} ${commonName}`;
    document.getElementById('detail-subtitle').textContent =
      `${sp.scientificName} • ${sp.sharePct ? 'IFN6: ' + sp.areaHa.toLocaleString() + ' ha (' + sp.sharePct + '%)' : 'Flora de Portugal'}`;
    document.getElementById('detail-description').textContent =
      (sp.descriptions[state.lang] || sp.descriptions.pt) +
      '\n\n' +
      (sp.phenology.phenologyNotes[state.lang] || sp.phenology.phenologyNotes.pt);

    let folStatus = { status: 'evergreen', label: { ru: 'Вечнозеленый', pt: 'Perenifólio', en: 'Evergreen' } };
    if (sp.leafType === 'deciduous') {
      folStatus = DATA.getNationalAutumnStatus(sp, periodKey);
    }

    document.getElementById('detail-category').textContent = sp.scientificName;
    document.getElementById('detail-foliage-status').textContent =
      `${folStatus.status !== 'evergreen' ? '🍂 ' : '🌿 '}${folStatus.label[state.lang]}`;

    document.getElementById('detail-box-foliage').textContent = folStatus.label[state.lang];
    document.getElementById('detail-box-flowering').textContent =
      sp.phenology.floweringMonths.indexOf(state.month) !== -1
        ? (state.lang === 'ru' ? 'В полном цвету' : state.lang === 'pt' ? 'Floração ativa' : 'In bloom')
        : (state.lang === 'ru' ? 'Цветение не наблюдается' : state.lang === 'pt' ? 'Sem floração' : 'Not flowering');
    document.getElementById('detail-box-fruiting').textContent =
      sp.phenology.fruitingMonths.indexOf(state.month) !== -1
        ? (state.lang === 'ru' ? 'Созревание плодов / семян' : state.lang === 'pt' ? 'Maturação de fruto' : 'Fruit / seed ripening')
        : (state.lang === 'ru' ? 'Вне периода сбора' : state.lang === 'pt' ? 'Fora da época' : 'Out of season');

    renderPhenologyCalendar(null, sp);

    const trailsContainer = document.getElementById('detail-trails-list');
    if (trailsContainer) {
      const bestLocations = DATA.locations.filter(l => (l.speciesIds || []).indexOf(sp.id) !== -1);
      trailsContainer.innerHTML = bestLocations.map(l => `
        <div class="trail-item" style="cursor: pointer;" onclick="window.florestasApp.openLocationModal('${l.id}')">
          <div class="trail-info">
            <span class="trail-title">🌲 ${l.names[state.lang] || l.names.pt}</span>
            <span class="trail-meta">${l.region} • ${l.elevationM}m</span>
          </div>
          <span class="btn-sm btn-outline-forest">Ver</span>
        </div>
      `).join('') || '<p style="color: #9eb5aa; font-size: 0.78rem;">Distribuição ampla em Portugal.</p>';
    }

    loadSpeciesInatPhotos(sp.inatTaxonId);

    modal.classList.remove('hidden');
  }

  function renderPhenologyCalendar(loc, sp) {
    const container = document.getElementById('detail-phenology-calendar');
    if (!container) return;

    const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = state.month;

    let calendarHtml = '<div class="pheno-grid">';

    for (let m = 1; m <= 12; m++) {
      let isFl = false;
      let isFr = false;
      let folSymbol = '🌿';

      if (sp) {
        isFl = sp.phenology.floweringMonths.indexOf(m) !== -1;
        isFr = sp.phenology.fruitingMonths.indexOf(m) !== -1;
        if (sp.leafType === 'deciduous') {
          const st = DATA.getNationalAutumnStatus(sp, `${m}.2`);
          if (st.status === 'yellowing' || st.status === 'peak_yellow') folSymbol = '🍂';
          else if (st.status === 'fallen') folSymbol = '🪵';
        }
      } else if (loc) {
        const st = computeLocationStatus(loc, m, 'mid');
        isFl = st.isFlowering;
        isFr = st.isFruiting;
        if (st.foliage && (st.foliage.status === 'yellowing' || st.foliage.status === 'peak_yellow')) folSymbol = '🍂';
        else if (st.foliage && st.foliage.status === 'fallen') folSymbol = '🪵';
      }

      calendarHtml += `
        <div class="pheno-month-col ${m === currentMonth ? 'current-month' : ''}">
          <span class="pheno-month-header">${monthsShort[m - 1]}</span>
          <div class="pheno-cell" title="Folhagem">${folSymbol}</div>
          <div class="pheno-cell" title="Floração">${isFl ? '🌸' : '—'}</div>
          <div class="pheno-cell" title="Frutificação">${isFr ? '🌰' : '—'}</div>
        </div>
      `;
    }

    calendarHtml += '</div>';
    container.innerHTML = calendarHtml;
  }

  function loadLocalInatPhotos(lat, lng, speciesIds) {
    const container = document.getElementById('detail-inat-photos');
    if (!container) return;

    container.innerHTML = `
      <div class="inat-loading-placeholder">
        <span class="spinner-sm"></span>
        <span>${UI_STRINGS[state.lang].inatLoading}</span>
      </div>
    `;

    const url = `https://api.inaturalist.org/v1/observations?lat=${lat}&lng=${lng}&radius=25&quality_grade=research&photos=true&per_page=6&order_by=observed_on`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.results || data.results.length === 0) {
          container.innerHTML = '<p style="color: #9eb5aa; font-size: 0.78rem;">Sem fotografias recentes nas imediações.</p>';
          return;
        }

        container.innerHTML = data.results.map(obs => {
          const photo = obs.photos && obs.photos[0] ? obs.photos[0].url.replace('square', 'medium') : '';
          const name = obs.taxon ? (obs.taxon.preferred_common_name || obs.taxon.name) : 'Planta';
          return `
            <a href="${obs.uri}" target="_blank" rel="noopener" class="inat-photo-card" title="${name}">
              <img src="${photo}" alt="${name}">
              <div class="inat-photo-caption">${name}</div>
            </a>
          `;
        }).join('');
      })
      .catch(() => {
        container.innerHTML = '<p style="color: #9eb5aa; font-size: 0.78rem;">iNaturalist offline ou sem ligação.</p>';
      });
  }

  function loadSpeciesInatPhotos(taxonId) {
    const container = document.getElementById('detail-inat-photos');
    if (!container || !taxonId) return;

    container.innerHTML = `
      <div class="inat-loading-placeholder">
        <span class="spinner-sm"></span>
        <span>${UI_STRINGS[state.lang].inatLoading}</span>
      </div>
    `;

    const url = `https://api.inaturalist.org/v1/observations?place_id=7122&taxon_id=${taxonId}&quality_grade=research&photos=true&per_page=6&order_by=observed_on`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.results || data.results.length === 0) {
          container.innerHTML = '<p style="color: #9eb5aa; font-size: 0.78rem;">Sem observações fotográficas.</p>';
          return;
        }

        container.innerHTML = data.results.map(obs => {
          const photo = obs.photos && obs.photos[0] ? obs.photos[0].url.replace('square', 'medium') : '';
          const place = obs.place_guess || 'Portugal';
          return `
            <a href="${obs.uri}" target="_blank" rel="noopener" class="inat-photo-card" title="${place}">
              <img src="${photo}" alt="iNaturalist">
              <div class="inat-photo-caption">📍 ${place}</div>
            </a>
          `;
        }).join('');
      })
      .catch(() => {
        container.innerHTML = '<p style="color: #9eb5aa; font-size: 0.78rem;">iNaturalist offline.</p>';
      });
  }

  // =========================================================================
  // Active Layer & Phenomenon Explainer Dynamic Banner
  // =========================================================================
  function updateActiveLayerExplainer() {
    const banner = document.getElementById('active-layer-explainer');
    const iconEl = document.getElementById('explainer-icon');
    const titleEl = document.getElementById('explainer-title');
    const badgeEl = document.getElementById('explainer-badge');
    const descEl = document.getElementById('explainer-desc');
    const resetBtn = document.getElementById('btn-reset-filters');

    if (!banner || !iconEl || !titleEl || !badgeEl || !descEl) return;
    if (state.mapMode === 'minerals') {
      updateMineralsExplainer();
      return;
    }

    banner.classList.remove('warning-mode');

    let icon = '🌲';
    let title = '';
    let badge = 'DGT COS 2025';
    let desc = '';
    let hasFilter = false;

    const lang = state.lang || 'ru';
    const decadeNum = state.decade === 'early' ? 1 : state.decade === 'mid' ? 2 : 3;
    const periodKey = `${state.month}.${decadeNum}`;

    if (state.specificSpecies !== 'all') {
      hasFilter = true;
      const sp = DATA.getSpeciesById(state.specificSpecies);
      if (sp) {
        icon = sp.icon || '🌲';
        const spName = sp.names[lang] || sp.names.pt;
        const codesStr = (sp.dgtCosCodes || []).join(', ');
        badge = `COS ${codesStr}`;
        const isProxy = !DATA.isCosMappable(sp);
        if (isProxy) banner.classList.add('warning-mode');
        if (lang === 'ru') {
          title = `Вид: ${spName}`;
          desc = isProxy
            ? `В DGT COS нет отдельного класса для этого вида. Показаны классы-местообитания, где он обычно встречается (коды: ${codesStr}) — сам вид присутствует не на каждом участке.`
            : `Отображаются только участки произрастания данного вида по DGT COS (коды: ${codesStr}).`;
        } else if (lang === 'pt') {
          title = `Espécie: ${spName}`;
          desc = isProxy
            ? `A COS da DGT não tem classe própria para esta espécie. Mostram-se as classes de habitat onde ocorre habitualmente (${codesStr}) — nem todos os polígonos a contêm.`
            : `Apresenta apenas os polígonos DGT COS específicos (${codesStr}) desta espécie.`;
        } else {
          title = `Species: ${spName}`;
          desc = isProxy
            ? `DGT COS has no class of its own for this species. Showing the habitat classes where it typically grows (${codesStr}) — not every polygon contains it.`
            : `Displaying only official DGT COS parcels (${codesStr}) for this tree species.`;
        }
      }
    } else if (state.phenoState !== 'all') {
      hasFilter = true;
      const ph = getMappedPhenoSpecies(state.phenoState, periodKey);
      const names = list => list.map(s => s.names[lang] || s.names.pt).join(', ');
      const spNames = names(ph.mapped);
      const count = ph.all.length;
      // Species without their own COS class cannot be drawn as polygons; say so explicitly
      const unmappedNote = ph.unmapped.length === 0 ? '' : lang === 'ru'
        ? ` Без отдельного класса COS (только маркеры): ${names(ph.unmapped)}.`
        : lang === 'pt'
        ? ` Sem classe COS própria (apenas marcadores): ${names(ph.unmapped)}.`
        : ` No COS class of their own (markers only): ${names(ph.unmapped)}.`;
      const zoneNote = lang === 'ru'
        ? ' В слое COS нет высот: участок подсвечен, если фаза наступила хотя бы в одной высотной зоне — местные сроки смотрите на маркерах.'
        : lang === 'pt'
        ? ' A COS não inclui altitude: o polígono é destacado se a fase ocorre em pelo menos uma faixa altitudinal — veja os marcadores para datas locais.'
        : ' COS has no elevation data: a polygon is highlighted if the phase occurs in at least one altitude band — check markers for local timing.';
      const hiddenNote = lang === 'ru' ? ' Полигоны WMS скрыты.' : lang === 'pt' ? ' Polígonos WMS ocultados.' : ' WMS polygons are hidden.';
      if (ph.mapped.length === 0) banner.classList.add('warning-mode');

      if (state.phenoState === 'foliage_yellowing') {
        icon = '🍂';
        badge = lang === 'ru' ? 'Золотая осень' : lang === 'pt' ? 'Pico Dourado' : 'Golden Peak';
        if (lang === 'ru') {
          title = `Золотая листва: ${count} вид(ов)`;
          desc = ph.mapped.length > 0
            ? `Подсвечены лиственные леса (${spNames}).${zoneNote}`
            : `В текущий период ни в одной высотной зоне нет картируемых видов с желтеющей листвой.${hiddenNote}`;
        } else if (lang === 'pt') {
          title = `Folhagem dourada: ${count} espécie(s)`;
          desc = ph.mapped.length > 0
            ? `Destacadas as folhosas caducifólias (${spNames}).${zoneNote}`
            : `Neste período nenhuma espécie cartografável está em amarelecimento foliar em qualquer faixa altitudinal.${hiddenNote}`;
        } else {
          title = `Golden foliage: ${count} species`;
          desc = ph.mapped.length > 0
            ? `Highlighting deciduous forests (${spNames}).${zoneNote}`
            : `No mappable species is yellowing in any altitude band during this period.${hiddenNote}`;
        }
        desc += unmappedNote;
      } else if (state.phenoState === 'foliage_fallen') {
        icon = '🪵';
        badge = lang === 'ru' ? 'Зимний покой' : lang === 'pt' ? 'Folhas Caídas' : 'Fallen Leaves';
        if (ph.mapped.length === 0) {
          if (lang === 'ru') {
            title = `Опавшая листва: ${count} вид(ов)`;
            desc = `В выбранный период ни в одной высотной зоне листопад ещё не начался: дубравы и каштаны стоят в зелёном или золотом уборе.${hiddenNote}`;
          } else if (lang === 'pt') {
            title = `Folhas caídas: ${count} espécie(s)`;
            desc = `No período escolhido a queda da folha ainda não começou em nenhuma faixa altitudinal: soutos e carvalhais mantêm copa verde ou dourada.${hiddenNote}`;
          } else {
            title = `Fallen leaves: ${count} species`;
            desc = `In the selected period leaf fall has not started in any altitude band: canopies are still green or golden.${hiddenNote}`;
          }
        } else if (lang === 'ru') {
          title = `Опавшая листва (${count} вид(ов))`;
          desc = `Подсвечены массивы с идущим или завершённым листопадом либо голыми ветвями: ${spNames}.${zoneNote}`;
        } else if (lang === 'pt') {
          title = `Folhas no solo (${count} espécies)`;
          desc = `Destacados povoamentos em desfolhação, desfolhados ou de ramos nus: ${spNames}.${zoneNote}`;
        } else {
          title = `Fallen leaves (${count} species)`;
          desc = `Highlighting stands with active leaf drop or bare branches: ${spNames}.${zoneNote}`;
        }
        desc += unmappedNote;
      } else if (state.phenoState === 'flowering') {
        icon = '🌸';
        badge = lang === 'ru' ? 'Цветение' : lang === 'pt' ? 'Floração' : 'Blooming';
        if (lang === 'ru') {
          title = `Активное цветение: ${count} вид(ов)`;
          desc = ph.mapped.length > 0 ? `Подсвечены участки цветущих видов (${spNames}).` : `Нет картируемых цветущих видов.${hiddenNote}`;
        } else if (lang === 'pt') {
          title = `Floração ativa: ${count} espécie(s)`;
          desc = ph.mapped.length > 0 ? `Destacadas as manchas com espécies em floração (${spNames}).` : `Sem espécies cartografáveis em floração.${hiddenNote}`;
        } else {
          title = `Active blooming: ${count} species`;
          desc = ph.mapped.length > 0 ? `Highlighting stands with actively blooming species (${spNames}).` : `No mappable species in bloom.${hiddenNote}`;
        }
        desc += unmappedNote;
      } else if (state.phenoState === 'fruiting') {
        icon = '🌰';
        badge = lang === 'ru' ? 'Спелые плоды' : lang === 'pt' ? 'Frutificação' : 'Fruiting';
        if (lang === 'ru') {
          title = `Спелые плоды и сбор урожая: ${count} вид(ов)`;
          desc = ph.mapped.length > 0 ? `Подсвечены леса со спелыми плодами (${spNames}).` : `Нет картируемых видов со спелыми плодами.${hiddenNote}`;
        } else if (lang === 'pt') {
          title = `Fruto maduro & Colheita: ${count} espécie(s)`;
          desc = ph.mapped.length > 0 ? `Destacadas florestas com frutos maduros (${spNames}).` : `Sem espécies cartografáveis com fruto maduro.${hiddenNote}`;
        } else {
          title = `Ripe fruit & harvest: ${count} species`;
          desc = ph.mapped.length > 0 ? `Highlighting forests with ripe fruit (${spNames}).` : `No mappable species with ripe fruit.${hiddenNote}`;
        }
        desc += unmappedNote;
      } else if (state.phenoState === 'foliage_green') {
        icon = '🌿';
        badge = lang === 'ru' ? 'Зелёная крона' : lang === 'pt' ? 'Copa Verde' : 'Green Canopy';
        if (lang === 'ru') {
          title = 'Зелёная и вечнозелёная крона';
          desc = `Подсвечены хвойные, эвкалипты, вечнозелёные дубы и лиственные леса, ещё зелёные хотя бы в одной высотной зоне (${spNames}).`;
        } else if (lang === 'pt') {
          title = 'Copa verde e perenifólia';
          desc = `Destacados pinhais, eucaliptais, montados perenes e folhosas ainda verdes em pelo menos uma faixa altitudinal (${spNames}).`;
        } else {
          title = 'Green and evergreen canopy';
          desc = `Highlighting pines, eucalyptus, evergreen oaks and deciduous stands still green in at least one altitude band (${spNames}).`;
        }
      }
    } else if (state.mode === 'autumn_walk') {
      hasFilter = true;
      icon = '🍂';
      badge = lang === 'ru' ? 'Осенний маршрут' : lang === 'pt' ? 'Trilho de Outono' : 'Autumn Trail';
      if (lang === 'ru') {
        title = 'Листопадные широколиственные леса';
        desc = 'Подсвечены дубравы и каштановые рощи с высшим рейтингом пеших прогулок.';
      } else if (lang === 'pt') {
        title = 'Folhosas caducifólias para passeios';
        desc = 'Destacados carvalhais e soutos com melhor classificação para trilhos pedestres de outono.';
      } else {
        title = 'Deciduous broadleaf forests for walking';
        desc = 'Highlighting sweet chestnut and oak groves with top ratings for autumn hikes.';
      }
    } else if (state.forestType !== 'all') {
      hasFilter = true;
      if (state.forestType === 'eucalyptus') {
        icon = '🍃';
        badge = 'COS 5.1.1.6';
        if (lang === 'ru') {
          title = 'Эвкалиптовые леса (Eucaliptais)';
          desc = '845 000 га лесного покрова Португалии (код DGT 5.1.1.6). Монокультура Eucalyptus globulus.';
        } else if (lang === 'pt') {
          title = 'Florestas de eucalipto (845 mil ha)';
          desc = 'Cobertura florestal de Eucalyptus globulus classificada no código DGT COS 5.1.1.6.';
        } else {
          title = 'Eucalyptus forests (845k ha)';
          desc = 'Mainland Portugal Eucalyptus globulus cover under official DGT COS code 5.1.1.6.';
        }
      } else if (state.forestType === 'pine') {
        icon = '🌲';
        badge = 'COS 5.1.2.x / 4.x';
        if (lang === 'ru') {
          title = 'Хвойные и сосновые леса (Pinhais)';
          desc = '890 000 га. Приморская сосна (Pinus pinaster) и средиземноморская пиния (Pinus pinea).';
        } else if (lang === 'pt') {
          title = 'Pinhais e outras resinosas (890 mil ha)';
          desc = 'Povoamentos de pinheiro-bravo e pinheiro-manso (códigos DGT 5.1.2.1–5.1.2.3, 4.x).';
        } else {
          title = 'Pine and coniferous forests (890k ha)';
          desc = 'Maritime pine and stone pine stands (DGT codes 5.1.2.1–5.1.2.3, 4.x).';
        }
      } else if (state.forestType === 'deciduous') {
        icon = '🍂';
        badge = 'COS 5.1.1.3 / 5.1.1.4';
        if (lang === 'ru') {
          title = 'Листопадные широколиственные леса';
          desc = 'Дубравы (Quercus pyrenaica, robur) и каштановые рощи (Castanea sativa). Главные локации осенней листвы.';
        } else if (lang === 'pt') {
          title = 'Folhosas caducifólias (Carvalhais e Soutos)';
          desc = 'Povoamentos de carvalho-negral, alvarinho e castanheiro (códigos DGT 5.1.1.3, 5.1.1.4).';
        } else {
          title = 'Deciduous broadleaved forests';
          desc = 'Pyrenean oak, pedunculate oak, and sweet chestnut stands (DGT 5.1.1.3, 5.1.1.4).';
        }
      } else if (state.forestType === 'montado') {
        icon = '🌳';
        badge = 'COS 5.1.1.1 / 5.1.1.2';
        if (lang === 'ru') {
          title = 'Монтаду (Пробковый и каменный дуб)';
          desc = 'Более 1 млн га традиционной агролесоводческой экосистемы Алентежу и Алгарве (sobreirais и azinhais).';
        } else if (lang === 'pt') {
          title = 'Montados de sobreiro e azinheira (>1M ha)';
          desc = 'Sistema agroflorestal emblemático do sul e centro do país (códigos DGT 5.1.1.1, 5.1.1.2).';
        } else {
          title = 'Cork & holm oak montado (>1M ha)';
          desc = 'Iconic Iberian agroforestry system of Alentejo and Algarve (DGT 5.1.1.1, 5.1.1.2).';
        }
      } else if (state.forestType === 'orchard_shrub') {
        icon = '🌸';
        badge = 'COS 2.2.2.x / 5.1.1.5';
        if (lang === 'ru') {
          title = 'Плодовые сады и рожковые рощи';
          desc = 'Все сады COS 2.2.2.x (низкой и высокой плотности, шпалерные) и рощи рожкового дерева (5.1.1.5). COS не различает культуры: миндаль здесь вместе с яблонями, грушами, цитрусовыми и др. Сплошные пустоши (6.1.1.1) исключены.';
        } else if (lang === 'pt') {
          title = 'Pomares e alfarrobais';
          desc = 'Todos os pomares COS 2.2.2.x (baixa e alta densidade, em sebe) e florestas de alfarrobeira (5.1.1.5). A COS não distingue culturas: amendoais surgem a par de macieiras, pereiras, citrinos, etc. Excluída a classe de matos 6.1.1.1.';
        } else {
          title = 'Orchards & carob woodland';
          desc = 'All COS 2.2.2.x orchards (low-density, high-density, hedge) plus carob woodland (5.1.1.5). COS does not distinguish crops: almonds appear alongside apple, pear, citrus, etc. General scrubland 6.1.1.1 excluded.';
        }
      }
    } else {
      // Default: All forests
      hasFilter = false;
      icon = '🌲';
      badge = 'DGT COS 2025v1';
      if (lang === 'ru') {
        title = 'Все леса Португалии (DGT COS 2025)';
        desc = 'Отображается полный лесной фонд континентальной Португалии (~3,2 млн га). Кликните в любую точку карты для анализа участка.';
      } else if (lang === 'pt') {
        title = 'Todas as Florestas de Portugal (DGT COS 2025)';
        desc = 'Apresenta o coberto florestal oficial de Portugal Continental (~3,2M ha). Clique em qualquer ponto para consultar a parcela.';
      } else {
        title = 'All Portugal Forests (DGT COS 2025)';
        desc = 'Displaying mainland Portugal official forest cover (~3.2M ha). Click anywhere on the map to query land parcels.';
      }
    }

    iconEl.textContent = icon;
    titleEl.textContent = title;
    badgeEl.textContent = badge;
    descEl.textContent = desc;

    if (resetBtn) {
      if (hasFilter) {
        resetBtn.classList.remove('hidden');
      } else {
        resetBtn.classList.add('hidden');
      }
    }
  }

  // =========================================================================
  // Trilingual Updates Across Static & Dynamic UI Elements
  // =========================================================================
  function updateLanguage(newLang) {
    if (!UI_STRINGS[newLang]) return;

    state.lang = newLang;
    const s = UI_STRINGS[newLang];

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === newLang);
    });

    const titleEl = document.getElementById('app-title');
    const subEl = document.getElementById('app-subtitle');
    const dataBadgeEl = document.getElementById('txt-data-sources');

    if (titleEl) titleEl.textContent = s.appTitle;
    if (subEl) subEl.textContent = s.appSubtitle;
    if (dataBadgeEl) dataBadgeEl.textContent = s.dataSourcesBadge;

    const dateLabel = document.getElementById('txt-date-label');
    const todayBtnText = document.getElementById('txt-btn-today');
    const lblMonth = document.getElementById('label-month');
    const lblDecade = document.getElementById('label-decade');

    if (dateLabel) dateLabel.textContent = s.dateSelectorLabel;
    if (todayBtnText) todayBtnText.textContent = s.btnResetToday;
    if (lblMonth) lblMonth.textContent = s.labelMonth;
    if (lblDecade) lblDecade.textContent = s.labelDecade;

    const selectMonth = document.getElementById('select-month');
    if (selectMonth) {
      const currentMonthVal = selectMonth.value;
      selectMonth.innerHTML = MONTH_NAMES[newLang].map((mName, i) => `
        <option value="${i + 1}" ${Number(currentMonthVal) === i + 1 ? 'selected' : ''}>${mName}</option>
      `).join('');
    }

    const selectDecade = document.getElementById('select-decade');
    if (selectDecade) {
      const currentDecadeVal = selectDecade.value;
      selectDecade.innerHTML = `
        <option value="early" ${currentDecadeVal === 'early' ? 'selected' : ''}>${s.decadeEarly}</option>
        <option value="mid" ${currentDecadeVal === 'mid' ? 'selected' : ''}>${s.decadeMid}</option>
        <option value="late" ${currentDecadeVal === 'late' ? 'selected' : ''}>${s.decadeLate}</option>
      `;
    }

    const txtModeAll = document.getElementById('txt-mode-all');
    const txtModeAutumn = document.getElementById('txt-mode-autumn');
    const txtModeBlooming = document.getElementById('txt-mode-blooming');

    if (txtModeAll) txtModeAll.textContent = s.modeAll;
    if (txtModeAutumn) txtModeAutumn.textContent = s.modeAutumn;
    if (txtModeBlooming) txtModeBlooming.textContent = s.modeBlooming;

    const titleForestType = document.getElementById('txt-title-forest-type');
    if (titleForestType) titleForestType.textContent = s.titleForestType;

    const forestBtnMap = {
      'txt-forest-all': s.forestAll,
      'txt-forest-eucalyptus': s.forestEucalyptus,
      'txt-forest-pine': s.forestPine,
      'txt-forest-deciduous': s.forestDeciduous,
      'txt-forest-montado': s.forestMontado,
      'txt-forest-orchard': s.forestOrchard
    };
    Object.keys(forestBtnMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = forestBtnMap[id];
    });

    const titlePheno = document.getElementById('txt-title-pheno-filter');
    if (titlePheno) titlePheno.textContent = s.titlePhenoFilter;

    const phenoBtnMap = {
      'txt-pheno-all': s.phenoAll,
      'txt-pheno-flowering': s.phenoFlowering,
      'txt-pheno-fruiting': s.phenoFruiting,
      'txt-pheno-yellowing': s.phenoYellowing,
      'txt-pheno-fallen': s.phenoFallen,
      'txt-pheno-green': s.phenoGreen
    };
    Object.keys(phenoBtnMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = phenoBtnMap[id];
    });

    // Species panel
    const titleSp = document.getElementById('txt-title-species-filter');
    const lblSp = document.getElementById('label-specific-species');
    const titleActive = document.getElementById('txt-title-active-pheno');

    if (titleSp) titleSp.textContent = s.titleSpeciesFilter;
    if (lblSp) lblSp.textContent = s.labelSpecificSpecies;
    if (titleActive) titleActive.textContent = s.titleActivePheno;

    const lblToggleCos = document.getElementById('label-toggle-cos');
    const descWmsCos = document.getElementById('desc-wms-cos');
    const lblToggleInat = document.getElementById('label-toggle-inat');
    const descInatLive = document.getElementById('desc-inat-live');

    if (lblToggleCos) lblToggleCos.textContent = s.labelToggleCos;
    if (descWmsCos) descWmsCos.textContent = s.descWmsCos;
    if (lblToggleInat) lblToggleInat.textContent = s.labelToggleInat;
    if (descInatLive) descInatLive.textContent = s.descInatLive;

    // Search placeholder & tabs
    const searchInput = document.getElementById('input-search');
    if (searchInput) searchInput.placeholder = s.searchPlaceholder;

    const txtTabLoc = document.getElementById('txt-tab-locations');
    const txtTabSp = document.getElementById('txt-tab-species');
    const txtTabStats = document.getElementById('txt-tab-stats');

    if (txtTabLoc) txtTabLoc.textContent = s.tabLocations;
    if (txtTabSp) txtTabSp.textContent = s.tabSpecies;
    if (txtTabStats) txtTabStats.textContent = s.tabStats;

    // Map controls & hint
    const hintText = document.getElementById('txt-map-hint');
    if (hintText) hintText.textContent = s.mapHint;

    const btnMarkersText = document.getElementById('txt-btn-markers');
    if (btnMarkersText) btnMarkersText.textContent = state.markersVisible ? s.btnMarkersOn : s.btnMarkersOff;

    // Legend
    const legTitle = document.getElementById('txt-legend-title');
    const legMarkers = document.getElementById('txt-legend-markers');
    const legPheno = document.getElementById('txt-legend-pheno');
    const legCos = document.getElementById('txt-legend-cos');

    if (legTitle) legTitle.textContent = s.legendTitle;
    if (legMarkers) legMarkers.textContent = s.legendMarkers;
    if (legPheno) legPheno.textContent = s.legendPheno;
    if (legCos) legCos.textContent = s.legendCos;

    const legMap = {
      'leg-euc': s.legEuc,
      'leg-pine': s.legPine,
      'leg-deciduous': s.legDeciduous,
      'leg-montado': s.legMontado,
      'leg-orchard': s.legOrchard,
      'leg-fol-yellow': s.legFolYellow,
      'leg-fol-fallen': s.legFolFallen,
      'leg-flowering': s.legFlowering,
      'leg-fruiting': s.legFruiting
    };
    Object.keys(legMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = legMap[id];
    });

    // Inspector
    const inspTitle = document.getElementById('txt-inspector-title');
    const lblPropName = document.getElementById('lbl-prop-name');
    const lblPropCode = document.getElementById('lbl-prop-code');
    const lblPropArea = document.getElementById('lbl-prop-area');
    const lblPropCoords = document.getElementById('lbl-prop-coords');
    const lblPropReg = document.getElementById('lbl-prop-concelho');
    const btnZoomP = document.getElementById('txt-btn-zoom-parcel');

    if (inspTitle) inspTitle.textContent = s.inspectorTitle;
    if (lblPropName) lblPropName.textContent = s.lblPropName;
    if (lblPropCode) lblPropCode.textContent = s.lblPropCode;
    if (lblPropArea) lblPropArea.textContent = s.lblPropArea;
    if (lblPropCoords) lblPropCoords.textContent = s.lblPropCoords;
    if (lblPropReg) lblPropReg.textContent = s.lblPropRegion;
    if (btnZoomP) btnZoomP.textContent = s.btnZoomParcel;

    // Modals
    const srcKicker = document.getElementById('txt-sources-kicker');
    const srcTitle = document.getElementById('modal-sources-title');
    const btnUnder = document.getElementById('txt-btn-understand');

    if (srcKicker) srcKicker.textContent = s.sourcesKicker;
    if (srcTitle) srcTitle.textContent = s.sourcesTitle;
    if (btnUnder) btnUnder.textContent = s.btnUnderstand;

    const descCos = document.getElementById('desc-dgt-cos');
    const descIfn = document.getElementById('desc-icnf-ifn6');
    const descInat = document.getElementById('desc-inat-api');
    const descPheno = document.getElementById('desc-pheno-model');

    if (descCos && DATA.sources[0]) descCos.textContent = DATA.sources[0].description[newLang] || descCos.textContent;
    if (descIfn && DATA.sources[2]) descIfn.textContent = DATA.sources[2].description[newLang] || descIfn.textContent;
    if (descInat && DATA.sources[4]) descInat.textContent = DATA.sources[4].description[newLang] || descInat.textContent;
    if (descPheno) descPheno.textContent = DATA.metadata.phenologyNote[newLang] || descPheno.textContent;

    // Populate species select dropdown
    populateSpecificSpeciesSelect();

    // Update Season Banner, Active Phenomenon Card & Quick Pills
    updateSeasonBanner();
    renderActivePhenomenonCard();
    renderQuickSpeciesPills();

    // Re-render markers & lists
    renderLocationMarkers();
    renderSpeciesList(getFilteredSpecies());
    renderStatsPanel();

    // Re-render inspected parcel in the newly selected language if active
    if (state.inspectedParcel && state.inspectedParcel.feature) {
      renderInspectedParcel(state.inspectedParcel.feature.properties, state.inspectedParcel.latlng);
    }

    // Update active layer explainer
    updateActiveLayerExplainer();
  }

  function populateSpecificSpeciesSelect() {
    const sel = document.getElementById('select-specific-species');
    if (!sel) return;

    const currentVal = sel.value || state.specificSpecies;
    let optionsHtml = `<option value="all" ${currentVal === 'all' ? 'selected' : ''}>${UI_STRINGS[state.lang].allSpeciesOption}</option>`;

    DATA.species.forEach(sp => {
      const common = sp.names[state.lang] || sp.names.pt;
      optionsHtml += `
        <option value="${sp.id}" ${currentVal === sp.id ? 'selected' : ''}>${sp.icon || '🌳'} ${common} (${sp.scientificName})</option>
      `;
    });

    sel.innerHTML = optionsHtml;
  }

  function updateSeasonBanner() {
    const summary = getSeasonalSummary(state.month, state.decade, state.lang);
    const titleEl = document.getElementById('banner-season-title');
    const descEl = document.getElementById('banner-season-desc');

    if (titleEl) titleEl.textContent = summary.title;
    if (descEl) descEl.textContent = summary.desc;
  }

  // =========================================================================
  // Minerals, Caves & Mines Mode
  // Data: geo-data.js snapshot (scripts/fetch-geodata.mjs) of LNEG SIORMINP mineral
  // occurrences (CC BY 4.0) and OpenStreetMap caves / mines (ODbL).
  // =========================================================================
  const GEO = window.FLORESTAS_GEO || { minerals: [], sites: [] };
  // LNEG shapefile import (scripts/import-lneg-shapefiles.mjs): potential-area polygons + MCE caves
  const GEO_AREAS = window.FLORESTAS_GEO_AREAS || { areas: { type: 'FeatureCollection', features: [] }, mceCaves: [] };
  const ALL_SITES = GEO.sites.concat(GEO_AREAS.mceCaves || []);

  // LNEG 2022 "Áreas potenciais de recursos minerais", one layer per commodity group
  const AREA_GROUPS = {
    "Au_Ag_Sb": {
      "color": "#facc15",
      "ru": "Золото, серебро, сурьма",
      "pt": "Ouro, prata e antimónio",
      "en": "Gold, silver and antimony"
    },
    "Caul_AreiaSilic": {
      "color": "#fef3c7",
      "ru": "Специальные глины (каолин) и кварцевые пески",
      "pt": "Argilas especiais e areias siliciosas",
      "en": "Special clays (kaolin) and silica sands"
    },
    "Cr_Ni_Va_Talc": {
      "color": "#4ade80",
      "ru": "Хром, никель, ванадий, тальк",
      "pt": "Crómio, níquel, vanádio e talco",
      "en": "Chromium, nickel, vanadium and talc"
    },
    "Cu_Pb_Zn": {
      "color": "#f97316",
      "ru": "Медь, свинец, цинк",
      "pt": "Cobre, chumbo e zinco",
      "en": "Copper, lead and zinc"
    },
    "Fe": {
      "color": "#ef4444",
      "ru": "Железо",
      "pt": "Ferro",
      "en": "Iron"
    },
    "Qz_Feldp_Li_Be": {
      "color": "#2dd4bf",
      "ru": "Кварц, полевой шпат, литий, берилл",
      "pt": "Quartzo, feldspato, lítio e berilo",
      "en": "Quartz, feldspar, lithium and beryl"
    },
    "Salgema_Gesso": {
      "color": "#e5e7eb",
      "ru": "Каменная соль и гипс",
      "pt": "Sal-gema e gesso",
      "en": "Rock salt and gypsum"
    },
    "Uranio": {
      "color": "#a3e635",
      "ru": "Уран",
      "pt": "Urânio",
      "en": "Uranium"
    },
    "W_Sn_Ta_Nb": {
      "color": "#38bdf8",
      "ru": "Вольфрам, олово, тантал, ниобий",
      "pt": "Tungsténio, estanho, tântalo e nióbio",
      "en": "Tungsten, tin, tantalum and niobium"
    }
  };

  const AREA_I18N = {
    "substance": {
      "Ouro (Ag, Sb)": {
        "ru": "Золото (Ag, Sb)",
        "pt": "Ouro (Ag, Sb)",
        "en": "Gold (Ag, Sb)"
      },
      "Caulino e Areia Especial": {
        "ru": "Каолин и специальные пески",
        "pt": "Caulino e Areia Especial",
        "en": "Kaolin and special sand"
      },
      "Caulino": {
        "ru": "Каолин",
        "pt": "Caulino",
        "en": "Kaolin"
      },
      "Crómio, níquel e vanádio": {
        "ru": "Хром, никель и ванадий",
        "pt": "Crómio, níquel e vanádio",
        "en": "Chromium, nickel and vanadium"
      },
      "Crómio, níquel, vanádio e Talco": {
        "ru": "Хром, никель, ванадий и тальк",
        "pt": "Crómio, níquel, vanádio e Talco",
        "en": "Chromium, nickel, vanadium and talc"
      },
      "Zinco e Chumbo": {
        "ru": "Цинк и свинец",
        "pt": "Zinco e Chumbo",
        "en": "Zinc and lead"
      },
      "Ferro": {
        "ru": "Железо",
        "pt": "Ferro",
        "en": "Iron"
      },
      "Quartzo, feldspato e lítio": {
        "ru": "Кварц, полевой шпат и литий",
        "pt": "Quartzo, feldspato e lítio",
        "en": "Quartz, feldspar and lithium"
      },
      "Salgema e Gesso": {
        "ru": "Каменная соль и гипс",
        "pt": "Salgema e Gesso",
        "en": "Rock salt and gypsum"
      },
      "Urânio": {
        "ru": "Уран",
        "pt": "Urânio",
        "en": "Uranium"
      },
      "Tungsténio, estanho, tântalo e nióbio": {
        "ru": "Вольфрам, олово, тантал и ниобий",
        "pt": "Tungsténio, estanho, tântalo e nióbio",
        "en": "Tungsten, tin, tantalum and niobium"
      }
    },
    "ui": {
      "areasLayer": {
        "ru": "Потенциальные зоны полезных ископаемых (LNEG 2022)",
        "pt": "Áreas potenciais de recursos minerais (LNEG 2022)",
        "en": "Mineral potential areas (LNEG 2022)"
      },
      "areasShort": {
        "ru": "Зона минерального потенциала",
        "pt": "Área de potencial mineral",
        "en": "Mineral potential area"
      },
      "areasNote": {
        "ru": "Зоны, благоприятные для формирования месторождений полезных ископаемых (LNEG, 2022). Показывают геологический потенциал, а не действующие рудники или подтверждённые запасы.",
        "pt": "Áreas favoráveis à ocorrência de depósitos minerais (LNEG, 2022). Indicam potencial geológico, não minas em exploração nem reservas confirmadas.",
        "en": "Areas favourable to the occurrence of mineral deposits (LNEG, 2022). They show geological potential, not active mines or confirmed reserves."
      },
      "mceCavesLayer": {
        "ru": "Пещеры и карстовые шахты Эштремадурского известнякового массива (LNEG)",
        "pt": "Grutas e algares do Maciço Calcário Estremenho (LNEG)",
        "en": "Caves & sinkholes of the Estremadura Limestone Massif (LNEG)"
      },
      "mceCaveShort": {
        "ru": "Пещера / карстовая шахта (LNEG, Serras de Aire e Candeeiros)",
        "pt": "Gruta / algar (LNEG, Serras de Aire e Candeeiros)",
        "en": "Cave / karst shaft (LNEG, Serras de Aire e Candeeiros)"
      },
      "unvalidated": {
        "ru": "Координаты не проверены в полевых условиях (по бумажной инвентаризации парка)",
        "pt": "Coordenadas não validadas no terreno (do inventário em papel do parque)",
        "en": "Coordinates not field-validated (from the park's paper inventory)"
      },
      "inventoryCode": {
        "ru": "Код инвентаризации",
        "pt": "Código de inventário",
        "en": "Inventory code"
      },
      "coordSource": {
        "ru": "Источник координат",
        "pt": "Fonte das coordenadas",
        "en": "Coordinate source"
      },
      "areaName": {
        "ru": "Зона",
        "pt": "Área",
        "en": "Area"
      },
      "substances": {
        "ru": "Полезные ископаемые",
        "pt": "Substâncias",
        "en": "Substances"
      },
      "unnamedArea": {
        "ru": "Безымянная зона",
        "pt": "Área sem nome",
        "en": "Unnamed area"
      }
    }
  };

  function au(key) {
    const t = AREA_I18N.ui[key];
    return t ? t[state.lang] || t.pt : key;
  }

  // EU raw-material class of each LNEG CRM2023 occurrence (2023 EU critical / strategic lists)
  const MINERAL_GROUPS = {
    critical: { color: '#f97316', ru: 'Критическое сырьё ЕС', pt: 'Matéria-prima crítica (UE)', en: 'EU critical raw material' },
    critical_strategic: { color: '#e11d48', ru: 'Критическое и стратегическое сырьё ЕС', pt: 'Crítica e estratégica (UE)', en: 'EU critical & strategic' },
    strategic: { color: '#a855f7', ru: 'Стратегическое сырьё ЕС', pt: 'Matéria-prima estratégica (UE)', en: 'EU strategic raw material' }
  };

  // Marker colour by main substance; anything not listed is grey
  const SUBSTANCE_COLORS = {
    'W': '#38bdf8',
    'Mn': '#f472b6',
    'Cu': '#f97316',
    'Feldspato': '#fde68a',
    'Sb': '#a3e635',
    'Ti': '#e2e8f0',
    'Ba': '#fbbf24',
    'Nb/Ta': '#c084fc',
    'Li': '#2dd4bf',
    'Fosfato': '#86efac',
    'As': '#ef4444',
    'Be': '#67e8f9',
    'REE': '#facc15'
  };
  const SUBSTANCE_OTHER_COLOR = '#94a3b8';

  const GEO_LAYERS = {
    minerals: { icon: '💎', color: '#2dd4bf', ru: 'Рудопроявления (LNEG)', pt: 'Ocorrências minerais (LNEG)', en: 'Mineral occurrences (LNEG)' },
    cave: { icon: '🦇', color: '#c084fc', ru: 'Пещеры (OSM)', pt: 'Grutas (OSM)', en: 'Caves (OSM)' },
    cave_mce: { icon: '🕳️', color: '#e879f9', ru: 'Пещеры и карстовые шахты (LNEG)', pt: 'Grutas e algares (LNEG)', en: 'Caves & karst shafts (LNEG)' },
    mine: { icon: '⛏️', color: '#fbbf24', ru: 'Шахты и штольни (статус не указан)', pt: 'Minas e galerias (estado desconhecido)', en: 'Mines & adits (status unknown)' },
    mine_abandoned: { icon: '🏚️', color: '#a8a29e', ru: 'Заброшенные шахты', pt: 'Minas abandonadas', en: 'Abandoned mines' }
  };

  const MIN_STRINGS = {
    ru: {
      forests: 'Леса', minerals: 'Минералы', areasAll: 'Все', areasNone: 'Скрыть', layers: 'Слои', groups: 'Вещества', classTitle: 'Класс сырья ЕС', genesis: 'Генезис', substance: 'Вещество',
      sort: 'Сортировка', allSubstances: 'Все вещества', allGroups: 'Все группы', results: 'Результаты',
      search: 'Название, вещество, муниципалитет…', sortName: 'По названию', sortSubstance: 'По веществу',
      sortNorth: 'С севера на юг', sortGroup: 'По группе', sortType: 'По типу объекта',
      showing: (n, total) => `Показаны первые ${n} из ${total}. Уточните фильтр, чтобы увидеть остальные.`,
      none: 'Ничего не найдено для выбранных фильтров.',
      appliesNote: 'Фильтры по веществу и классу относятся к рудопроявлениям LNEG; шахты из OSM учитываются по тегу ресурса, пещеры при выборе вещества скрываются. Набор LNEG CRM2023 охватывает критическое и стратегическое сырьё ЕС (вольфрам, литий, медь и др.), а не все полезные ископаемые.',
      main: 'Основное вещество', all: 'Все вещества', category: 'Категория', size: 'Размер', place: 'Муниципалитет',
      lnegSheet: 'Карточка LNEG', mindat: 'Искать на Mindat', osm: 'Объект в OpenStreetMap', unnamed: 'Без названия',
      resource: 'Ресурс', access: 'Доступ',
      safety: 'Заброшенные шахты и пещеры опасны: обвалы, вертикальные стволы, газы. Не входите без снаряжения и разрешения.',
      explTitle: n => `Минералы, пещеры и шахты: ${n} объектов`,
      explDesc: (m, c, mi, ab, d1, d2) => `${m} рудопроявлений критического сырья (LNEG CRM2023 / SIORMINP, снимок ${d1}) и ${c} пещер, ${mi} шахт, ${ab} заброшенных выработок из OpenStreetMap (снимок ${d2}). Лесные полигоны DGT скрыты.`,
      source: (d1, d2) => `Источники: LNEG — CRM2023 / SIORMINP (CC BY 4.0, ${d1}); © участники OpenStreetMap (ODbL, ${d2}). OSM неполон: отсутствие точки не означает отсутствие объекта.`
    },
    pt: {
      forests: 'Florestas', minerals: 'Minerais', areasAll: 'Todas', areasNone: 'Ocultar', layers: 'Camadas', groups: 'Substâncias', classTitle: 'Classe UE', genesis: 'Génese', substance: 'Substância',
      sort: 'Ordenar', allSubstances: 'Todas as substâncias', allGroups: 'Todos os grupos', results: 'Resultados',
      search: 'Nome, substância, concelho…', sortName: 'Por nome', sortSubstance: 'Por substância',
      sortNorth: 'De norte a sul', sortGroup: 'Por grupo', sortType: 'Por tipo de local',
      showing: (n, total) => `A mostrar os primeiros ${n} de ${total}. Refine o filtro para ver os restantes.`,
      none: 'Sem resultados para os filtros escolhidos.',
      appliesNote: 'Os filtros de substância e classe aplicam-se às ocorrências LNEG; minas do OSM entram pelo recurso indicado; grutas ficam ocultas quando se escolhe uma substância. O mapa LNEG CRM2023 abrange as matérias-primas críticas e estratégicas da UE (tungsténio, lítio, cobre, etc.), não todos os recursos minerais.',
      main: 'Substância principal', all: 'Substâncias', category: 'Categoria', size: 'Dimensão', place: 'Concelho',
      lnegSheet: 'Ficha LNEG', mindat: 'Pesquisar no Mindat', osm: 'Ver no OpenStreetMap', unnamed: 'Sem nome',
      resource: 'Recurso', access: 'Acesso',
      safety: 'Minas abandonadas e grutas são perigosas: derrocadas, poços verticais, gases. Não entre sem equipamento e autorização.',
      explTitle: n => `Minerais, grutas e minas: ${n} locais`,
      explDesc: (m, c, mi, ab, d1, d2) => `${m} ocorrências minerais de matérias-primas críticas (LNEG CRM2023 / SIORMINP, recolha ${d1}) e ${c} grutas, ${mi} minas e ${ab} minas abandonadas do OpenStreetMap (recolha ${d2}). Polígonos florestais DGT ocultos.`,
      source: (d1, d2) => `Fontes: LNEG — CRM2023 / SIORMINP (CC BY 4.0, ${d1}); © contribuidores OpenStreetMap (ODbL, ${d2}). O OSM é incompleto: a ausência de um ponto não significa ausência do local.`
    },
    en: {
      forests: 'Forests', minerals: 'Minerals', areasAll: 'All', areasNone: 'Hide', layers: 'Layers', groups: 'Substances', classTitle: 'EU raw-material class', genesis: 'Genesis', substance: 'Substance',
      sort: 'Sort by', allSubstances: 'All substances', allGroups: 'All groups', results: 'Results',
      search: 'Name, substance, municipality…', sortName: 'Name', sortSubstance: 'Substance',
      sortNorth: 'North to south', sortGroup: 'Group', sortType: 'Site type',
      showing: (n, total) => `Showing the first ${n} of ${total}. Narrow the filter to see the rest.`,
      none: 'Nothing matches the selected filters.',
      appliesNote: 'Substance and class filters apply to LNEG occurrences; OSM mines match through their resource tag; caves are hidden while a substance is selected. The LNEG CRM2023 map covers EU critical and strategic raw materials (tungsten, lithium, copper, etc.), not every mineral resource.',
      main: 'Main substance', all: 'Substances', category: 'Category', size: 'Size', place: 'Municipality',
      lnegSheet: 'LNEG record', mindat: 'Search on Mindat', osm: 'View on OpenStreetMap', unnamed: 'Unnamed',
      resource: 'Resource', access: 'Access',
      safety: 'Abandoned mines and caves are dangerous: collapses, vertical shafts, bad air. Do not enter without equipment and permission.',
      explTitle: n => `Minerals, caves & mines: ${n} sites`,
      explDesc: (m, c, mi, ab, d1, d2) => `${m} mineral occurrences of critical raw materials (LNEG CRM2023 / SIORMINP, snapshot ${d1}) plus ${c} caves, ${mi} mines and ${ab} abandoned mines from OpenStreetMap (snapshot ${d2}). DGT forest polygons hidden.`,
      source: (d1, d2) => `Sources: LNEG — CRM2023 / SIORMINP (CC BY 4.0, ${d1}); © OpenStreetMap contributors (ODbL, ${d2}). OSM is incomplete: a missing point does not mean a missing site.`
    }
  };

  // Trilingual labels for raw LNEG / OSM attribute values (pt = LNEG original wording)
  const MIN_VALUE_I18N = {
    "size": {
      "Ocorrência": {
        "ru": "Проявление",
        "pt": "Ocorrência",
        "en": "Occurrence"
      },
      "Pequena": {
        "ru": "Малое",
        "pt": "Pequena",
        "en": "Small"
      },
      "Média": {
        "ru": "Среднее",
        "pt": "Média",
        "en": "Medium"
      },
      "Grande": {
        "ru": "Крупное",
        "pt": "Grande",
        "en": "Large"
      }
    },
    "genesis": {
      "Magmática/Hidrotermal - Aplo-Pegmatítica": {
        "ru": "Магматический/гидротермальный – аплитово-пегматитовый",
        "pt": "Magmática/Hidrotermal - Aplo-Pegmatítica",
        "en": "Magmatic/hydrothermal – aplite-pegmatite"
      },
      "Hidrotermal - Hidrotermal": {
        "ru": "Гидротермальный – гидротермальный",
        "pt": "Hidrotermal - Hidrotermal",
        "en": "Hydrothermal – hydrothermal"
      },
      "Magmática/Hidrotermal - Epigenética": {
        "ru": "Магматический/гидротермальный – эпигенетический",
        "pt": "Magmática/Hidrotermal - Epigenética",
        "en": "Magmatic/hydrothermal – epigenetic"
      },
      "Hidrotermal - Outros Depósitos Vulcanogénicos": {
        "ru": "Гидротермальный – прочие вулканогенные месторождения",
        "pt": "Hidrotermal - Outros Depósitos Vulcanogénicos",
        "en": "Hydrothermal – other volcanogenic deposits"
      },
      "Processos Superficiais - Depósitos Aluvionares": {
        "ru": "Поверхностные процессы – аллювиальные россыпи",
        "pt": "Processos Superficiais - Depósitos Aluvionares",
        "en": "Surface processes – alluvial deposits"
      },
      "Processos Superficiais - Enriquecimento Supergénico": {
        "ru": "Поверхностные процессы – супергенное обогащение",
        "pt": "Processos Superficiais - Enriquecimento Supergénico",
        "en": "Surface processes – supergene enrichment"
      },
      "Metamórfica/Hidrotermal - Associada a Corredores de Deformação": {
        "ru": "Метаморфический/гидротермальный – связанный с зонами деформации",
        "pt": "Metamórfica/Hidrotermal - Associada a Corredores de Deformação",
        "en": "Metamorphic/hydrothermal – associated with shear zones"
      },
      "Hidrotermal - Sulfuretos Maciços Vulcanogénicos": {
        "ru": "Гидротермальный – массивные вулканогенные сульфидные руды",
        "pt": "Hidrotermal - Sulfuretos Maciços Vulcanogénicos",
        "en": "Hydrothermal – volcanogenic massive sulphides"
      },
      "Magmática/Hidrotermal - Hidrotermal Ba": {
        "ru": "Магматический/гидротермальный – гидротермальный барит (Ba)",
        "pt": "Magmática/Hidrotermal - Hidrotermal Ba",
        "en": "Magmatic/hydrothermal – hydrothermal barite (Ba)"
      },
      "Magmática/Hidrotermal - Skarns": {
        "ru": "Магматический/гидротермальный – скарны",
        "pt": "Magmática/Hidrotermal - Skarns",
        "en": "Magmatic/hydrothermal – skarns"
      },
      "Processos Superficiais - Precipitados Químicos": {
        "ru": "Поверхностные процессы – химические осадки",
        "pt": "Processos Superficiais - Precipitados Químicos",
        "en": "Surface processes – chemical precipitates"
      },
      "Magmática - Ortomagmática": {
        "ru": "Магматический – ортомагматический",
        "pt": "Magmática - Ortomagmática",
        "en": "Magmatic – orthomagmatic"
      },
      "Metamórfica/Hidrotermal - Metamorfismo": {
        "ru": "Метаморфический/гидротермальный – метаморфизм",
        "pt": "Metamórfica/Hidrotermal - Metamorfismo",
        "en": "Metamorphic/hydrothermal – metamorphism"
      },
      "Magmática/Hidrotermal, Epigenética": {
        "ru": "Магматический/гидротермальный, эпигенетический",
        "pt": "Magmática/Hidrotermal, Epigenética",
        "en": "Magmatic/hydrothermal, epigenetic"
      },
      "Metamórfica/Hidrotermal - Greissen": {
        "ru": "Метаморфический/гидротермальный – грейзен",
        "pt": "Metamórfica/Hidrotermal - Greissen",
        "en": "Metamorphic/hydrothermal – greisen"
      },
      "Processos Superficiais - Detrítica": {
        "ru": "Поверхностные процессы – обломочные россыпи",
        "pt": "Processos Superficiais - Detrítica",
        "en": "Surface processes – detrital"
      },
      "Processos Superficiais - Depósito aluvionar/eluvionar": {
        "ru": "Поверхностные процессы – аллювиальные/элювиальные россыпи",
        "pt": "Processos Superficiais - Depósito aluvionar/eluvionar",
        "en": "Surface processes – alluvial/eluvial deposit"
      },
      "Processos Superficiais - Meteorização": {
        "ru": "Поверхностные процессы – выветривание",
        "pt": "Processos Superficiais - Meteorização",
        "en": "Surface processes – weathering"
      },
      "Metamórfica/Hidrotermal - Processos Metassomáticos": {
        "ru": "Метаморфический/гидротермальный – метасоматические процессы",
        "pt": "Metamórfica/Hidrotermal - Processos Metassomáticos",
        "en": "Metamorphic/hydrothermal – metasomatic processes"
      }
    },
    "substance": {
      "W": {
        "ru": "Вольфрам (W)",
        "pt": "Tungsténio (W)",
        "en": "Tungsten (W)"
      },
      "Mn": {
        "ru": "Марганец (Mn)",
        "pt": "Manganês (Mn)",
        "en": "Manganese (Mn)"
      },
      "Feldspato": {
        "ru": "Полевой шпат",
        "pt": "Feldspato",
        "en": "Feldspar"
      },
      "Cu": {
        "ru": "Медь (Cu)",
        "pt": "Cobre (Cu)",
        "en": "Copper (Cu)"
      },
      "Ti": {
        "ru": "Титан (Ti)",
        "pt": "Titânio (Ti)",
        "en": "Titanium (Ti)"
      },
      "Sb": {
        "ru": "Сурьма (Sb)",
        "pt": "Antimónio (Sb)",
        "en": "Antimony (Sb)"
      },
      "Ba": {
        "ru": "Барий (Ba), барит",
        "pt": "Bário (Ba), baritina",
        "en": "Barium (Ba), barite"
      },
      "Nb/Ta": {
        "ru": "Ниобий/тантал (Nb/Ta)",
        "pt": "Nióbio/Tântalo (Nb/Ta)",
        "en": "Niobium/tantalum (Nb/Ta)"
      },
      "Fosfato": {
        "ru": "Фосфат",
        "pt": "Fosfato",
        "en": "Phosphate"
      },
      "Li": {
        "ru": "Литий (Li)",
        "pt": "Lítio (Li)",
        "en": "Lithium (Li)"
      },
      "As": {
        "ru": "Мышьяк (As)",
        "pt": "Arsénio (As)",
        "en": "Arsenic (As)"
      },
      "REE": {
        "ru": "Редкоземельные элементы (REE)",
        "pt": "Elementos de terras raras (REE)",
        "en": "Rare-earth elements (REE)"
      },
      "Feldspato + Be": {
        "ru": "Полевой шпат + бериллий (Be)",
        "pt": "Feldspato + Berílio (Be)",
        "en": "Feldspar + beryllium (Be)"
      },
      "Be": {
        "ru": "Бериллий (Be)",
        "pt": "Berílio (Be)",
        "en": "Beryllium (Be)"
      },
      "Grafite": {
        "ru": "Графит",
        "pt": "Grafite",
        "en": "Graphite"
      },
      "Ni": {
        "ru": "Никель (Ni)",
        "pt": "Níquel (Ni)",
        "en": "Nickel (Ni)"
      },
      "Co": {
        "ru": "Кобальт (Co)",
        "pt": "Cobalto (Co)",
        "en": "Cobalt (Co)"
      },
      "V": {
        "ru": "Ванадий (V)",
        "pt": "Vanádio (V)",
        "en": "Vanadium (V)"
      },
      "Bi": {
        "ru": "Висмут (Bi)",
        "pt": "Bismuto (Bi)",
        "en": "Bismuth (Bi)"
      },
      "Ge": {
        "ru": "Германий (Ge)",
        "pt": "Germânio (Ge)",
        "en": "Germanium (Ge)"
      },
      "An": {
        "ru": "An (неизвестно)",
        "pt": "An (desconhecido)",
        "en": "An (unknown)"
      }
    },
    "resource": {
      "limestone": {
        "ru": "Известняк",
        "pt": "Calcário",
        "en": "Limestone"
      },
      "iron_ore": {
        "ru": "Железная руда",
        "pt": "Minério de ferro",
        "en": "Iron ore"
      },
      "water": {
        "ru": "Вода",
        "pt": "Água",
        "en": "Water"
      },
      "etain": {
        "ru": "Олово",
        "pt": "Estanho",
        "en": "Tin"
      },
      "copper": {
        "ru": "Медь",
        "pt": "Cobre",
        "en": "Copper"
      },
      "copper;silver;gold": {
        "ru": "Медь, серебро, золото",
        "pt": "Cobre, prata, ouro",
        "en": "Copper, silver, gold"
      },
      "coal": {
        "ru": "Уголь",
        "pt": "Carvão",
        "en": "Coal"
      },
      "gold": {
        "ru": "Золото",
        "pt": "Ouro",
        "en": "Gold"
      },
      "water;limestone": {
        "ru": "Вода, известняк",
        "pt": "Água, calcário",
        "en": "Water, limestone"
      },
      "cuprite": {
        "ru": "Куприт",
        "pt": "Cuprite",
        "en": "Cuprite"
      },
      "gold;antimony": {
        "ru": "Золото, сурьма",
        "pt": "Ouro, antimónio",
        "en": "Gold, antimony"
      },
      "lead;tin": {
        "ru": "Свинец, олово",
        "pt": "Chumbo, estanho",
        "en": "Lead, tin"
      },
      "pyrite": {
        "ru": "Пирит",
        "pt": "Pirite",
        "en": "Pyrite"
      },
      "tungsten": {
        "ru": "Вольфрам",
        "pt": "Tungsténio",
        "en": "Tungsten"
      },
      "água": {
        "ru": "Вода",
        "pt": "Água",
        "en": "Water"
      },
      "coper;iron;gold;silver": {
        "ru": "Медь, железо, золото, серебро",
        "pt": "Cobre, ferro, ouro, prata",
        "en": "Copper, iron, gold, silver"
      }
    },
    "access": {
      "no": {
        "ru": "Нет доступа",
        "pt": "Sem acesso",
        "en": "No access"
      },
      "yes": {
        "ru": "Доступ открыт",
        "pt": "Acesso livre",
        "en": "Public access"
      },
      "customers": {
        "ru": "Только для клиентов",
        "pt": "Apenas clientes",
        "en": "Customers only"
      },
      "permissive": {
        "ru": "Допускается (с разрешения владельца)",
        "pt": "Permitido (revogável)",
        "en": "Permissive (revocable)"
      },
      "private": {
        "ru": "Частный доступ",
        "pt": "Privado",
        "en": "Private"
      },
      "permit": {
        "ru": "По пропуску",
        "pt": "Mediante autorização",
        "en": "Permit required"
      }
    }
  };

  function tv(section, raw) {
    const t = MIN_VALUE_I18N[section] && MIN_VALUE_I18N[section][raw];
    return t ? t[state.lang] || t.pt : raw;
  }

  const MIN_LIST_LIMIT = 300;
  let geoLayerGroup = null;
  let geoRenderer = null;

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // "Cu, Zn; Pb" → ['Cu', 'Zn', 'Pb']
  function splitSubstances(m) {
    return (m.substances || m.main || '')
      .split(/\s*,\s*/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  // English element / mineral word used to match OSM resource tags, e.g. 'Cu' → 'copper'
  function substanceKeyword(sub) {
    const t = MIN_VALUE_I18N.substance[sub];
    return t ? t.en.replace(/\s*\(.*\)\s*/g, '').split(/[,/+]/)[0].trim().toLowerCase() : sub.toLowerCase();
  }

  function geoKindOf(item) {
    return item.kind || 'minerals';
  }

  function getFilteredGeo() {
    const f = state.minerals;
    const q = f.query.trim().toLowerCase();
    const matchesQuery = item => !q || [item.name, item.substances, item.main && tv('substance', item.main), item.municipality, item.district, item.resource, item.resource && tv('resource', item.resource)]
      .some(v => v && v.toLowerCase().indexOf(q) !== -1);

    const minerals = !f.layers.minerals ? [] : GEO.minerals.filter(m => {
      if (f.group !== 'all' && m.group !== f.group) return false;
      if (f.substance !== 'all' && splitSubstances(m).indexOf(f.substance) === -1) return false;
      return matchesQuery(m);
    });
    const subWord = f.substance === 'all' ? null : substanceKeyword(f.substance);
    const sites = ALL_SITES.filter(s => {
      if (!f.layers[s.kind] || !matchesQuery(s)) return false;
      if (!subWord) return true;
      return !!s.resource && tv('resource', s.resource) !== s.resource
        ? MIN_VALUE_I18N.resource[s.resource].en.toLowerCase().indexOf(subWord) !== -1
        : false;
    });
    return minerals.concat(sites);
  }

  function sortGeo(items) {
    const lang = state.lang;
    if (state.minerals.sort === 'north') return items.slice().sort((a, b) => b.lat - a.lat);
    const key = {
      name: it => it.name || '￿',
      substance: it => (it.main ? tv('substance', it.main) : it.resource ? tv('resource', it.resource) : '￿'),
      group: it => (it.group ? MINERAL_GROUPS[it.group][lang] : '￿'),
      type: it => GEO_LAYERS[geoKindOf(it)][lang]
    }[state.minerals.sort] || (it => it.name);
    return items.slice().sort((a, b) => key(a).localeCompare(key(b), lang) || (a.name || '').localeCompare(b.name || '', lang));
  }

  function substanceColor(sub) {
    return SUBSTANCE_COLORS[sub] || SUBSTANCE_OTHER_COLOR;
  }

  function geoColor(item) {
    return item.kind ? GEO_LAYERS[item.kind].color : substanceColor(item.main);
  }

  function geoPopupHtml(item) {
    const s = MIN_STRINGS[state.lang];
    const kind = geoKindOf(item);
    const name = item.name || s.unnamed;
    const row = (label, val) => (val ? `<div class="geo-pop-row"><span>${label}</span><strong>${escapeHtml(val)}</strong></div>` : '');
    const typeLabel = item.group ? MINERAL_GROUPS[item.group][state.lang] : kind === 'cave_mce' ? au('mceCaveShort') : GEO_LAYERS[kind][state.lang];
    const typeColor = item.group ? MINERAL_GROUPS[item.group].color : GEO_LAYERS[kind].color;
    const links = [`<a href="${googleMapsUrl(item.lat, item.lng)}" target="_blank" rel="noopener">📍 ${googleMapsLabel()} ↗</a>`];
    if (item.link && /^https?:\/\//.test(item.link)) {
      links.push(`<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${s.lnegSheet} ↗</a>`);
    }
    if (item.osm) {
      links.push(`<a href="https://www.openstreetmap.org/${escapeHtml(item.osm)}" target="_blank" rel="noopener">${s.osm} ↗</a>`);
    }
    if (item.name && kind !== 'cave' && kind !== 'cave_mce') {
      links.push(`<a href="https://www.mindat.org/search.php?search=${encodeURIComponent(item.name)}" target="_blank" rel="noopener">${s.mindat} ↗</a>`);
    }
    return `
      <div class="geo-popup">
        <div class="geo-pop-type" style="color:${typeColor}">${GEO_LAYERS[kind].icon} ${escapeHtml(typeLabel)}</div>
        <div class="geo-pop-name">${escapeHtml(name)}</div>
        ${row(s.main, item.main && tv('substance', item.main))}
        ${item.substances && item.substances !== item.main ? row(s.all, splitSubstances(item).map(x => tv('substance', x)).join(', ')) : ''}
        ${row(s.size, item.size && tv('size', item.size))}
        ${row(s.genesis, item.genesis && tv('genesis', item.genesis))}
        ${row(s.resource, item.resource && tv('resource', item.resource))}
        ${row(s.access, item.access && tv('access', item.access))}
        ${kind === 'cave_mce' ? row(au('inventoryCode'), item.code) + row(au('areaName'), item.area) + row(au('coordSource'), item.coordSource) : ''}
        ${kind === 'cave_mce' && item.validated === false ? `<div class="geo-pop-note">ℹ️ ${au('unvalidated')}</div>` : ''}
        ${row(s.place, [item.municipality, item.district].filter(Boolean).join(', '))}
        <div class="geo-pop-coords">${item.lat.toFixed(4)}° N, ${Math.abs(item.lng).toFixed(4)}° W</div>
        ${kind !== 'minerals' ? `<div class="geo-pop-warning">⚠️ ${s.safety}</div>` : ''}
        <div class="geo-pop-links">${links.join('')}</div>
      </div>`;
  }

  const geoMarkerById = new Map();

  let areasLayer = null;

  function areaGroupVisible(g) {
    return state.minerals.areaGroups === null || state.minerals.areaGroups.has(g);
  }

  function areaPopupHtml(p) {
    const g = AREA_GROUPS[p.group];
    const sub = AREA_I18N.substance[p.substance];
    return `
      <div class="geo-popup">
        <div class="geo-pop-type" style="color:${g.color}">🗺️ ${escapeHtml(au('areasShort'))}</div>
        <div class="geo-pop-name">${escapeHtml(p.name || au('unnamedArea'))}</div>
        <div class="geo-pop-row"><span>${escapeHtml(au('substances'))}</span><strong>${escapeHtml(sub ? sub[state.lang] || p.substance : p.substance || g[state.lang])}</strong></div>
        <div class="geo-pop-note">${escapeHtml(au('areasNote'))}</div>
      </div>`;
  }

  function renderAreasLayer() {
    if (!map) return;
    if (!map.getPane('mineralAreas')) {
      // Below the point markers (overlayPane = 400) so dots stay clickable inside areas
      map.createPane('mineralAreas').style.zIndex = 350;
    }
    if (areasLayer) map.removeLayer(areasLayer);
    const feats = GEO_AREAS.areas.features.filter(f => areaGroupVisible(f.properties.group));
    areasLayer = L.geoJSON({ type: 'FeatureCollection', features: feats }, {
      pane: 'mineralAreas',
      style: f => {
        const c = AREA_GROUPS[f.properties.group].color;
        return { color: c, weight: 1.5, opacity: 0.9, fillColor: c, fillOpacity: 0.22 };
      },
      onEachFeature: (f, layer) => layer.bindPopup(() => areaPopupHtml(f.properties), { maxWidth: 300, className: 'geo-leaflet-popup' })
    });
    if (state.mapMode === 'minerals') areasLayer.addTo(map);
  }

  function renderGeoLayer() {
    if (!map) return;
    if (!geoLayerGroup) {
      geoRenderer = L.canvas({ padding: 0.3 });
      geoLayerGroup = L.layerGroup();
    }
    geoLayerGroup.clearLayers();
    geoMarkerById.clear();

    getFilteredGeo().forEach(item => {
      const isSite = !!item.kind;
      const marker = L.circleMarker([item.lat, item.lng], {
        renderer: geoRenderer,
        radius: isSite ? 6 : 4.5,
        color: isSite ? '#0b1410' : 'rgba(0,0,0,0.55)',
        weight: isSite ? 2 : 1,
        fillColor: geoColor(item),
        fillOpacity: 0.9
      });
      marker.bindPopup(() => geoPopupHtml(item), { maxWidth: 300, className: 'geo-leaflet-popup' });
      marker.addTo(geoLayerGroup);
      geoMarkerById.set(item, marker);
    });
  }

  function renderMineralsPanel() {
    const s = MIN_STRINGS[state.lang];
    const f = state.minerals;

    const counts = { minerals: GEO.minerals.length, cave: 0, cave_mce: 0, mine: 0, mine_abandoned: 0 };
    ALL_SITES.forEach(x => { counts[x.kind] = (counts[x.kind] || 0) + 1; });

    const layersEl = document.getElementById('min-layer-toggles');
    if (layersEl) {
      layersEl.innerHTML = Object.keys(GEO_LAYERS).map(k => `
        <button class="forest-filter-btn min-layer-btn ${f.layers[k] ? 'active' : ''}" data-geo-layer="${k}" aria-pressed="${f.layers[k]}">
          <span class="color-dot" style="background:${GEO_LAYERS[k].color}"></span>
          <span class="pill-name">${GEO_LAYERS[k].icon} ${GEO_LAYERS[k][state.lang]}</span>
          <span class="count-badge">${counts[k] || 0}</span>
        </button>`).join('');
    }

    const groupCounts = {};
    GEO.minerals.forEach(m => { groupCounts[m.group] = (groupCounts[m.group] || 0) + 1; });
    const groupsEl = document.getElementById('min-group-filters');
    if (groupsEl) {
      groupsEl.innerHTML = [`
        <button class="forest-filter-btn min-group-btn ${f.group === 'all' ? 'active' : ''}" data-geo-group="all">
          <span class="pill-name">${s.allGroups}</span><span class="count-badge">${GEO.minerals.length}</span>
        </button>`].concat(Object.keys(MINERAL_GROUPS).filter(g => groupCounts[g]).map(g => `
        <button class="forest-filter-btn min-group-btn ${f.group === g ? 'active' : ''}" data-geo-group="${g}">
          <span class="color-dot" style="background:${MINERAL_GROUPS[g].color}"></span>
          <span class="pill-name">${MINERAL_GROUPS[g][state.lang]}</span>
          <span class="count-badge">${groupCounts[g]}</span>
        </button>`)).join('');
    }

    const areasEl = document.getElementById('min-area-filters');
    if (areasEl) {
      const areaCounts = {};
      GEO_AREAS.areas.features.forEach(ft => { areaCounts[ft.properties.group] = (areaCounts[ft.properties.group] || 0) + 1; });
      const allOn = f.areaGroups === null;
      const noneOn = f.areaGroups !== null && f.areaGroups.size === 0;
      areasEl.innerHTML = `
        <div class="min-area-actions">
          <button class="btn-pill-action ${allOn ? 'active' : ''}" data-geo-areas="all">${s.areasAll}</button>
          <button class="btn-pill-action ${noneOn ? 'active' : ''}" data-geo-areas="none">${s.areasNone}</button>
        </div>` + Object.keys(AREA_GROUPS).filter(g => areaCounts[g]).map(g => `
        <button class="forest-filter-btn min-area-btn ${areaGroupVisible(g) ? 'active' : ''}" data-geo-area="${g}" aria-pressed="${areaGroupVisible(g)}">
          <span class="area-swatch" style="background:${AREA_GROUPS[g].color}"></span>
          <span class="pill-name">${escapeHtml(AREA_GROUPS[g][state.lang])}</span>
          <span class="count-badge">${areaCounts[g]}</span>
        </button>`).join('');
    }

    const subsEl = document.getElementById('min-substance-filters');
    if (subsEl) {
      // Substances present in the chosen EU class, most common first
      const inClass = GEO.minerals.filter(m => f.group === 'all' || m.group === f.group);
      const c = {};
      inClass.forEach(m => new Set(splitSubstances(m)).forEach(x => { c[x] = (c[x] || 0) + 1; }));
      const subs = Object.keys(c).sort((x, y) => c[y] - c[x] || x.localeCompare(y));
      if (f.substance !== 'all' && !c[f.substance]) f.substance = 'all';
      subsEl.innerHTML = [`
        <button class="forest-filter-btn min-sub-btn ${f.substance === 'all' ? 'active' : ''}" data-geo-substance="all">
          <span class="pill-name">${s.allSubstances}</span><span class="count-badge">${inClass.length}</span>
        </button>`].concat(subs.map(x => `
        <button class="forest-filter-btn min-sub-btn ${f.substance === x ? 'active' : ''}" data-geo-substance="${escapeHtml(x)}">
          <span class="color-dot" style="background:${substanceColor(x)}"></span>
          <span class="pill-name">${escapeHtml(tv('substance', x))}</span>
          <span class="count-badge">${c[x]}</span>
        </button>`)).join('');
    }

    const sortSel = document.getElementById('select-min-sort');
    if (sortSel) {
      sortSel.innerHTML = [['name', s.sortName], ['substance', s.sortSubstance], ['group', s.sortGroup], ['north', s.sortNorth], ['type', s.sortType]]
        .map(([v, l]) => `<option value="${v}" ${v === f.sort ? 'selected' : ''}>${l}</option>`).join('');
    }

    const searchEl = document.getElementById('input-min-search');
    if (searchEl) searchEl.placeholder = s.search;

    [['txt-min-areas-title', au('areasLayer')], ['txt-min-layers-title', s.layers], ['txt-min-groups-title', s.groups], ['txt-min-class-title', s.classTitle], ['label-min-sort', s.sort], ['txt-min-results', s.results]]
      .forEach(([id, txt]) => { const el = document.getElementById(id); if (el) el.textContent = txt; });
    const noteEl = document.getElementById('txt-min-source-note');
    if (noteEl) noteEl.textContent = `${s.appliesNote} ${s.source(GEO.mineralsFetchedAt || '—', GEO.sitesFetchedAt || '—')}`;

    renderMineralsList();
  }

  function renderMineralsList() {
    const s = MIN_STRINGS[state.lang];
    const listEl = document.getElementById('list-minerals');
    const countEl = document.getElementById('count-min-results');
    const items = sortGeo(getFilteredGeo());
    if (countEl) countEl.textContent = items.length;
    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = `<div class="list-placeholder"><p>${s.none}</p></div>`;
      return;
    }
    const shown = items.slice(0, MIN_LIST_LIMIT);
    listEl.innerHTML = shown.map((it, i) => {
      const kind = geoKindOf(it);
      const sub = it.main ? tv('substance', it.main) : it.resource ? tv('resource', it.resource) : GEO_LAYERS[kind][state.lang];
      const place = [it.municipality, it.district].filter(Boolean).join(', ');
      return `
        <button class="geo-list-item" data-geo-index="${i}">
          <span class="geo-list-dot" style="background:${geoColor(it)}"></span>
          <span class="geo-list-body">
            <span class="geo-list-name">${GEO_LAYERS[kind].icon} ${escapeHtml(it.name || s.unnamed)}</span>
            <span class="geo-list-meta">${escapeHtml(sub)}${place ? ' · ' + escapeHtml(place) : ''}</span>
          </span>
        </button>`;
    }).join('') + (items.length > MIN_LIST_LIMIT ? `<p class="min-list-more">${s.showing(MIN_LIST_LIMIT, items.length)}</p>` : '');
    listEl._geoItems = shown;
  }

  function updateMineralsExplainer() {
    const s = MIN_STRINGS[state.lang];
    const banner = document.getElementById('active-layer-explainer');
    const items = getFilteredGeo();
    const c = { minerals: 0, cave: 0, mine: 0, mine_abandoned: 0 };
    items.forEach(it => { c[geoKindOf(it)]++; });
    banner.classList.toggle('warning-mode', items.length === 0);
    document.getElementById('explainer-icon').textContent = '💎';
    document.getElementById('explainer-title').textContent = s.explTitle(items.length);
    document.getElementById('explainer-badge').textContent = 'LNEG CRM2023 · OSM';
    const nAreas = GEO_AREAS.areas.features.filter(ft => areaGroupVisible(ft.properties.group)).length;
    document.getElementById('explainer-desc').textContent = `${au('areasLayer')}: ${nAreas}. ` +
      s.explDesc(c.minerals, c.cave, c.mine, c.mine_abandoned, GEO.mineralsFetchedAt || '—', GEO.sitesFetchedAt || '—');
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) resetBtn.classList.add('hidden');
  }

  function refreshMinerals() {
    renderGeoLayer();
    renderMineralsList();
    updateMineralsExplainer();
  }

  function setMapMode(mode) {
    if (!map || (mode !== 'forests' && mode !== 'minerals')) return;
    state.mapMode = mode;
    const isMin = mode === 'minerals';
    document.body.classList.toggle('map-mode-minerals', isMin);
    document.querySelectorAll('.map-mode-btn').forEach(btn => {
      const on = btn.getAttribute('data-map-mode') === mode;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    const panel = document.getElementById('minerals-panel');
    if (panel) panel.classList.toggle('hidden', !isMin);

    const forestLayers = [wmsLayer, locationsLayerGroup, inatLayerGroup, highlightParcelLayer].filter(Boolean);
    if (isMin) {
      forestLayers.forEach(l => map.removeLayer(l));
      const inspector = document.getElementById('parcel-inspector');
      if (inspector) inspector.classList.add('hidden');
      renderMineralsPanel();
      renderAreasLayer();
      renderGeoLayer();
      geoLayerGroup.addTo(map);
      updateMineralsExplainer();
    } else {
      if (geoLayerGroup) map.removeLayer(geoLayerGroup);
      if (areasLayer) map.removeLayer(areasLayer);
      forestLayers.forEach(l => l.addTo(map));
      updateWmsLayer();
      updateActiveLayerExplainer();
    }
    measureSheetPeek();
  }

  function bindMineralsEvents() {
    document.querySelectorAll('.map-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setMapMode(btn.getAttribute('data-map-mode')));
    });

    const panel = document.getElementById('minerals-panel');
    if (!panel) return;

    panel.addEventListener('click', e => {
      const layerBtn = e.target.closest('[data-geo-layer]');
      const groupBtn = e.target.closest('[data-geo-group]');
      const subBtn = e.target.closest('[data-geo-substance]');
      const areaBtn = e.target.closest('[data-geo-area]');
      const areasBtn = e.target.closest('[data-geo-areas]');
      const listBtn = e.target.closest('[data-geo-index]');
      if (layerBtn) {
        const k = layerBtn.getAttribute('data-geo-layer');
        state.minerals.layers[k] = !state.minerals.layers[k];
        renderMineralsPanel();
        refreshMinerals();
      } else if (groupBtn) {
        state.minerals.group = groupBtn.getAttribute('data-geo-group');
        renderMineralsPanel();
        refreshMinerals();
        collapseSheetOnMobile();
      } else if (areaBtn || areasBtn) {
        if (areasBtn) {
          state.minerals.areaGroups = areasBtn.getAttribute('data-geo-areas') === 'all' ? null : new Set();
        } else {
          const g = areaBtn.getAttribute('data-geo-area');
          const set = state.minerals.areaGroups === null ? new Set(Object.keys(AREA_GROUPS)) : state.minerals.areaGroups;
          if (set.has(g)) set.delete(g); else set.add(g);
          state.minerals.areaGroups = set.size === Object.keys(AREA_GROUPS).length ? null : set;
        }
        renderMineralsPanel();
        renderAreasLayer();
        updateMineralsExplainer();
      } else if (subBtn) {
        state.minerals.substance = subBtn.getAttribute('data-geo-substance');
        renderMineralsPanel();
        refreshMinerals();
        collapseSheetOnMobile();
      } else if (listBtn) {
        const items = document.getElementById('list-minerals')._geoItems || [];
        const item = items[Number(listBtn.getAttribute('data-geo-index'))];
        const marker = item && geoMarkerById.get(item);
        if (item) {
          collapseSheetOnMobile();
          map.setView([item.lat, item.lng], Math.max(map.getZoom(), 12), { animate: true });
          if (marker) setTimeout(() => marker.openPopup(), 350);
        }
      }
    });

    const sortSel = document.getElementById('select-min-sort');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        state.minerals.sort = sortSel.value;
        renderMineralsList();
      });
    }
    const search = document.getElementById('input-min-search');
    if (search) {
      let t = null;
      search.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.minerals.query = search.value;
          refreshMinerals();
        }, 200);
      });
    }
  }

  function updateMineralsLanguage() {
    const s = MIN_STRINGS[state.lang];
    const f = document.getElementById('txt-map-forests');
    const m = document.getElementById('txt-map-minerals');
    if (f) f.textContent = s.forests;
    if (m) m.textContent = s.minerals;
    if (state.mapMode === 'minerals') {
      renderMineralsPanel();
      if (geoLayerGroup) geoLayerGroup.eachLayer(l => l.isPopupOpen() && l.closePopup());
      updateMineralsExplainer();
    }
  }

  // =========================================================================
  // Mobile Bottom Sheet
  // =========================================================================
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  let sheetState = 'peek';

  function isMobileLayout() {
    return mobileQuery.matches;
  }

  function setSheetState(next) {
    const sidebar = document.getElementById('sidebar');
    const handle = document.getElementById('sheet-handle');
    if (!sidebar) return;
    sheetState = next;
    sidebar.classList.toggle('sheet-half', next === 'half');
    sidebar.classList.toggle('sheet-full', next === 'full');
    if (handle) handle.setAttribute('aria-expanded', next === 'peek' ? 'false' : 'true');
    if (next === 'peek') {
      const scroller = sidebar.querySelector('.sidebar-scrollable');
      if (scroller) scroller.scrollTop = 0;
    }
  }

  function collapseSheetOnMobile() {
    if (isMobileLayout() && sheetState !== 'peek') setSheetState('peek');
  }

  // Collapsed height = grab handle + date pickers, so month/decade stay one tap away
  function measureSheetPeek() {
    const sidebar = document.getElementById('sidebar');
    const pickers = document.querySelector(state.mapMode === 'minerals' ? '#minerals-layers-card' : '#date-card .date-pickers-row');
    if (!sidebar || !pickers || !isMobileLayout()) return;
    const prev = sidebar.style.transform;
    sidebar.style.transform = 'none';
    const peek = Math.ceil(pickers.getBoundingClientRect().bottom - sidebar.getBoundingClientRect().top + 14);
    sidebar.style.transform = prev;
    if (peek > 60 && peek < 320) {
      document.documentElement.style.setProperty('--sheet-peek', `${peek}px`);
    }
  }

  function initMobileSheet() {
    const sidebar = document.getElementById('sidebar');
    const handle = document.getElementById('sheet-handle');
    if (!sidebar || !handle) return;

    measureSheetPeek();
    window.addEventListener('resize', measureSheetPeek);
    mobileQuery.addEventListener('change', () => {
      setSheetState('peek');
      measureSheetPeek();
    });

    // Drag the handle (or the collapsed date card) to resize; a short tap toggles
    let startY = 0;
    let startOffset = 0;
    let dragging = false;
    let moved = false;

    const currentOffset = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(sidebar).transform);
      return m.m42;
    };

    const onDown = e => {
      if (!isMobileLayout()) return;
      // In the collapsed sheet only the handle and header area start a drag
      if (e.currentTarget !== handle && (sheetState !== 'peek' || e.target.closest('select, button, input'))) return;
      dragging = true;
      moved = false;
      startY = e.clientY;
      startOffset = currentOffset();
      sidebar.classList.add('sheet-dragging');
      if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onMove = e => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      if (Math.abs(dy) > 6) moved = true;
      const maxOffset = sidebar.offsetHeight;
      const y = Math.min(Math.max(startOffset + dy, 0), maxOffset);
      sidebar.style.transform = `translateY(${y}px)`;
    };

    const onUp = e => {
      if (!dragging) return;
      dragging = false;
      sidebar.classList.remove('sheet-dragging');
      const endOffset = currentOffset();
      sidebar.style.transform = '';
      if (!moved) {
        if (e.currentTarget === handle) setSheetState(sheetState === 'peek' ? 'half' : 'peek');
        return;
      }
      const h = sidebar.offsetHeight;
      const velocity = e.clientY - startY;
      // Snap to the nearest state, biased by drag direction
      const ratio = endOffset / h;
      let next;
      if (velocity < -40) next = ratio < 0.3 ? 'full' : 'half';
      else if (velocity > 40) next = ratio > 0.55 ? 'peek' : 'half';
      else next = ratio < 0.22 ? 'full' : ratio < 0.7 ? 'half' : 'peek';
      setSheetState(next);
    };

    [handle, sidebar.querySelector('.date-card .card-header-flex')].forEach(el => {
      if (!el) return;
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });

    // Picking a filter on a phone should show its effect on the map right away
    sidebar.addEventListener('click', e => {
      if (e.target.closest('.forest-filter-btn, .pheno-filter-btn, .mode-tab, .active-species-pill, .species-pill-chip') && !e.target.closest('#minerals-panel')) {
        setTimeout(collapseSheetOnMobile, 150);
      }
    });

    handle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSheetState(sheetState === 'peek' ? 'half' : 'peek');
      }
    });
  }

  // =========================================================================
  // Event Listeners Binding
  // =========================================================================
  function bindEvents() {
    // Mobile bottom sheet (the sidebar on narrow screens)
    initMobileSheet();
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    if (btnToggleSidebar) {
      btnToggleSidebar.addEventListener('click', () => {
        setSheetState(sheetState === 'peek' ? 'half' : 'peek');
      });
    }

    // Mobile: explainer collapses to its title; tap to read the full explanation
    const explainer = document.getElementById('active-layer-explainer');
    if (explainer) {
      explainer.addEventListener('click', e => {
        if (e.target.closest('#btn-reset-filters')) return;
        explainer.classList.toggle('expanded');
      });
    }

    // Language Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        updateLanguage(lang);
        updateMineralsLanguage();
        measureSheetPeek();
      });
    });

    // Reset to Today (16 Oct)
    const btnResetToday = document.getElementById('btn-reset-today');
    if (btnResetToday) {
      btnResetToday.addEventListener('click', () => {
        state.month = 10;
        state.decade = 'mid';
        state.specificSpecies = 'all';

        const selMonth = document.getElementById('select-month');
        const selDecade = document.getElementById('select-decade');
        if (selMonth) selMonth.value = '10';
        if (selDecade) selDecade.value = 'mid';

        updateWmsLayer();
        updateSeasonBanner();
        renderActivePhenomenonCard();
        renderQuickSpeciesPills();
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    }

    // Month Selector
    const selectMonth = document.getElementById('select-month');
    if (selectMonth) {
      selectMonth.addEventListener('change', e => {
        state.month = parseInt(e.target.value, 10);
        updateWmsLayer();
        updateSeasonBanner();
        renderActivePhenomenonCard();
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    }

    // Decade Selector
    const selectDecade = document.getElementById('select-decade');
    if (selectDecade) {
      selectDecade.addEventListener('change', e => {
        state.decade = e.target.value;
        updateWmsLayer();
        updateSeasonBanner();
        renderActivePhenomenonCard();
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    }

    // Exploration Mode Tabs
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const mode = tab.getAttribute('data-mode');
        state.mode = mode;
        state.specificSpecies = 'all';
        const sel = document.getElementById('select-specific-species');
        if (sel) sel.value = 'all';

        if (mode === 'all') {
          state.forestType = 'all';
          state.phenoState = 'all';
          document.querySelectorAll('.forest-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'all'));
          document.querySelectorAll('.pheno-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-pheno') === 'all'));
        } else if (mode === 'autumn_walk') {
          state.forestType = 'deciduous';
          state.phenoState = 'all';
          document.querySelectorAll('.forest-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'deciduous'));
          document.querySelectorAll('.pheno-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-pheno') === 'all'));
        } else if (mode === 'blooming_fruiting') {
          state.forestType = 'all';
          state.phenoState = 'all';
          document.querySelectorAll('.forest-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'all'));
          document.querySelectorAll('.pheno-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-pheno') === 'all'));
        }

        updateWmsLayer();
        renderActivePhenomenonCard();
        renderQuickSpeciesPills();
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    });

    // Forest Type Filters (with mutual reset of phenology & species)
    document.querySelectorAll('.forest-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        document.querySelectorAll('.forest-filter-btn').forEach(b => b.classList.toggle('active', b === btn));

        state.forestType = type;

        // Mutual reset: clear phenology, specific species, and mode
        if (type !== 'all') {
          state.phenoState = 'all';
          document.querySelectorAll('.pheno-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-pheno') === 'all'));
          state.specificSpecies = 'all';
          const sel = document.getElementById('select-specific-species');
          if (sel) sel.value = 'all';
          state.mode = 'all';
          document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'all'));
        }

        // Sychronize WMS CQL automatically on map!
        updateWmsLayer();

        renderActivePhenomenonCard();
        renderQuickSpeciesPills();
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    });

    // Phenology Filters (with mutual reset of forest type & species)
    document.querySelectorAll('.pheno-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pheno = btn.getAttribute('data-pheno');
        document.querySelectorAll('.pheno-filter-btn').forEach(b => b.classList.toggle('active', b === btn));

        state.phenoState = pheno;

        // Mutual reset: clear forest type, specific species, and mode
        if (pheno !== 'all') {
          state.forestType = 'all';
          document.querySelectorAll('.forest-filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'all'));
          state.specificSpecies = 'all';
          const sel = document.getElementById('select-specific-species');
          if (sel) sel.value = 'all';
          state.mode = 'all';
          document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === 'all'));
        }

        // Sychronize WMS CQL automatically on map!
        updateWmsLayer();

        renderActivePhenomenonCard();
        renderQuickSpeciesPills();
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    });

    // Specific Species Dropdown
    const selectSpecSpecies = document.getElementById('select-specific-species');
    if (selectSpecSpecies) {
      selectSpecSpecies.addEventListener('change', e => {
        filterBySpecies(e.target.value);
      });
    }

    // Explainer Banner Reset Button
    const btnResetFilters = document.getElementById('btn-reset-filters');
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        resetAllFilters();
      });
    }

    // WMS Layer Toggle
    const toggleWmsCos = document.getElementById('toggle-wms-cos');
    if (toggleWmsCos) {
      toggleWmsCos.addEventListener('change', e => {
        state.wmsEnabled = e.target.checked;
        updateWmsLayer();
      });
    }

    // iNaturalist Live Toggle
    const toggleInatLive = document.getElementById('toggle-inat-live');
    if (toggleInatLive) {
      toggleInatLive.addEventListener('change', e => {
        state.inatLiveEnabled = e.target.checked;
        if (state.inatLiveEnabled) {
          loadInatObservations();
        } else if (inatLayerGroup) {
          inatLayerGroup.clearLayers();
          const inatStatusText = document.getElementById('txt-inat-status');
          if (inatStatusText) inatStatusText.textContent = 'iNaturalist: Inativo';
        }
      });
    }

    // Map Marker Visibility Toggle Button
    const btnToggleMarkers = document.getElementById('btn-toggle-markers');
    if (btnToggleMarkers) {
      btnToggleMarkers.addEventListener('click', () => {
        state.markersVisible = !state.markersVisible;
        btnToggleMarkers.classList.toggle('active', state.markersVisible);
        const lbl = document.getElementById('txt-btn-markers');
        if (lbl) {
          lbl.textContent = state.markersVisible
            ? UI_STRINGS[state.lang].btnMarkersOn
            : UI_STRINGS[state.lang].btnMarkersOff;
        }
        renderLocationMarkers();
      });
    }

    // Base Map Switcher
    const btnCycleBasemap = document.getElementById('btn-cycle-basemap');
    if (btnCycleBasemap) {
      btnCycleBasemap.addEventListener('click', cycleBaseMap);
    }

    // Search Input
    const searchInput = document.getElementById('input-search');
    const btnClearSearch = document.getElementById('btn-clear-search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value;
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    }
    if (btnClearSearch && searchInput) {
      btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        renderLocationMarkers();
        renderSpeciesList(getFilteredSpecies());
      });
    }

    // Results Sub-tabs
    const tabBtnLoc = document.getElementById('tab-btn-locations');
    const tabBtnSp = document.getElementById('tab-btn-species');
    const tabBtnSt = document.getElementById('tab-btn-stats');
    const listLoc = document.getElementById('list-locations');
    const listSp = document.getElementById('list-species');
    const panelSt = document.getElementById('panel-stats');

    function setActiveTab(tabKey) {
      state.activeTab = tabKey;
      [tabBtnLoc, tabBtnSp, tabBtnSt].forEach(b => b && b.classList.remove('active'));
      [listLoc, listSp, panelSt].forEach(p => p && p.classList.add('hidden'));

      if (tabKey === 'locations') {
        if (tabBtnLoc) tabBtnLoc.classList.add('active');
        if (listLoc) listLoc.classList.remove('hidden');
      } else if (tabKey === 'species') {
        if (tabBtnSp) tabBtnSp.classList.add('active');
        if (listSp) listSp.classList.remove('hidden');
        renderSpeciesList(getFilteredSpecies());
      } else if (tabKey === 'stats') {
        if (tabBtnSt) tabBtnSt.classList.add('active');
        if (panelSt) panelSt.classList.remove('hidden');
        renderStatsPanel();
      }
    }

    if (tabBtnLoc) tabBtnLoc.addEventListener('click', () => setActiveTab('locations'));
    if (tabBtnSp) tabBtnSp.addEventListener('click', () => setActiveTab('species'));
    if (tabBtnSt) tabBtnSt.addEventListener('click', () => setActiveTab('stats'));

    // Legend Toggle
    const legendEl = document.getElementById('map-legend');
    const legendHeader = document.getElementById('legend-header');
    if (legendHeader && legendEl) {
      legendHeader.addEventListener('click', () => {
        legendEl.classList.toggle('collapsed');
      });
    }

    // Parcel Inspector Close & Zoom
    const btnCloseInspector = document.getElementById('btn-close-inspector');
    const inspectorEl = document.getElementById('parcel-inspector');
    if (btnCloseInspector && inspectorEl) {
      btnCloseInspector.addEventListener('click', () => {
        inspectorEl.classList.add('hidden');
        if (highlightParcelLayer && map) {
          map.removeLayer(highlightParcelLayer);
          highlightParcelLayer = null;
        }
      });
    }

    const btnZoomParcel = document.getElementById('btn-zoom-parcel');
    if (btnZoomParcel) {
      btnZoomParcel.addEventListener('click', () => {
        if (state.inspectedParcel && state.inspectedParcel.latlng && map) {
          map.setView(state.inspectedParcel.latlng, 14, { animate: true });
        }
      });
    }

    // Sources Modal Triggers
    const btnOpenSources = document.getElementById('btn-open-sources');
    const modalSources = document.getElementById('modal-sources');
    const btnCloseSources = document.getElementById('btn-close-sources');
    const btnDismissSources = document.getElementById('btn-sources-dismiss');

    if (btnOpenSources && modalSources) {
      btnOpenSources.addEventListener('click', () => modalSources.classList.remove('hidden'));
    }
    if (btnCloseSources && modalSources) {
      btnCloseSources.addEventListener('click', () => modalSources.classList.add('hidden'));
    }
    if (btnDismissSources && modalSources) {
      btnDismissSources.addEventListener('click', () => modalSources.classList.add('hidden'));
    }

    // Detail Modal Triggers
    const modalDetail = document.getElementById('modal-detail');
    const btnCloseDetail = document.getElementById('btn-close-detail');
    const btnCloseDetailFooter = document.getElementById('btn-close-detail-footer');
    const btnFocusMap = document.getElementById('btn-focus-on-map');
    const btnRefreshInat = document.getElementById('btn-load-inat-local');

    if (btnCloseDetail && modalDetail) {
      btnCloseDetail.addEventListener('click', () => modalDetail.classList.add('hidden'));
    }
    if (btnCloseDetailFooter && modalDetail) {
      btnCloseDetailFooter.addEventListener('click', () => modalDetail.classList.add('hidden'));
    }

    if (btnFocusMap && modalDetail) {
      btnFocusMap.addEventListener('click', () => {
        modalDetail.classList.add('hidden');
        collapseSheetOnMobile();
        if (state.selectedLocation && map) {
          map.setView([state.selectedLocation.lat, state.selectedLocation.lng], 12, { animate: true });
          const marker = locationMarkers[state.selectedLocation.id];
          if (marker) {
            setTimeout(() => marker.openPopup(), 400);
          }
        }
      });
    }

    if (btnRefreshInat) {
      btnRefreshInat.addEventListener('click', () => {
        if (state.selectedLocation) {
          loadLocalInatPhotos(state.selectedLocation.lat, state.selectedLocation.lng, state.selectedLocation.speciesIds);
        } else if (state.selectedSpecies) {
          loadSpeciesInatPhotos(state.selectedSpecies.inatTaxonId);
        }
      });
    }

    // Escape key modal dismissal
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (modalSources) modalSources.classList.add('hidden');
        if (modalDetail) modalDetail.classList.add('hidden');
      }
    });

    [modalSources, modalDetail].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', e => {
          if (e.target === modal) modal.classList.add('hidden');
        });
      }
    });
  }

  // =========================================================================
  // Expose Application Public Interface
  // =========================================================================
  window.florestasApp = {
    state,
    openLocationModal,
    openSpeciesModal,
    filterBySpecies,
    resetAllFilters,
    updateLanguage
  };

  // =========================================================================
  // Initialization Routine
  // =========================================================================
  function init() {
    initMap();
    bindEvents();
    bindMineralsEvents();
    updateLanguage(state.lang);
    updateMineralsLanguage();
    measureSheetPeek();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
