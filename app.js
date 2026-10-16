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
    inspectedParcel: null
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
      forestOrchard: 'Миндальные сады & кустарники',
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
      legOrchard: 'Миндаль и плодоносящие кустарники',
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
      forestOrchard: 'Pomares de Amendoeira & Arbustos',
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
      legOrchard: 'Amendoeiras & Arbustos',
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
      forestOrchard: 'Almond Orchards & Fruiting Shrubs',
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
      legOrchard: 'Almond Orchards & Shrubs',
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

  // =========================================================================
  // DGT COS Level 4 Exact CQL Code Mapping (Clean forest codes, excludes 6.1.1.1 Matos)
  // =========================================================================
  const FOREST_TYPE_CQL = {
    all: "cos25v1_n1_c = '5' OR cos25v1_n1_c = '4' OR cos25v1_n4_c IN ('2.2.2.1', '2.2.2.2', '2.2.2.3', '5.1.1.5')",
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
        '10.2': 'Золотой пик каштанов и буков в Серра-да-Эштрела и Монтезинью; одновременное цветение и созревание ягод земляничного дерева в Моншике; осыпание желудей в монтадо.',
        '10.1': 'Первые золотистые штрихи на высоких склонах Жереша и Монтезинью; сбор каштанов в Траз-уж-Монтиш; сбор шишек и зрелые смолистые сосняки.',
        '10.3': 'Максимальный багряно-медный навес на Rota das Faias в Мантейгаше; каштановые ярмарки; зрелые алые ягоды земляничника в Алгарве.',
        '11.1': 'Золотая листва спускается в предгорья (Бусаку, Сан-Мамеде); традиционный праздник жареных каштанов Магушту.',
        '11.2': 'Огненный ковер из опавших листьев на горных тропах; праздник Сан-Мартинью; активный откорм свиней желудями (montanheira) в Алентежу.',
        '11.3': 'Листопад завершается на севере; зеленое великолепие вечнозеленых лесов монтадо и сосновых боров.'
      },
      pt: {
        '10.2': 'Pico dourado nos soutos e faias da Serra da Estrela e Montesinho; floração e medronhos maduros em simultâneo em Monchique; queda da bolota nos montados.',
        '10.1': 'Primeiras tonalidades douradas nas encostas altas do Gerês e Montesinho; arranque da apanha da castanha em Trás-os-Montes; pinhais costeiros viçosos.',
        '10.3': 'Abóbada de cobre e âmbar na Rota das Faias de Manteigas; soutos transmontanos radiantes; medronhos vermelhos maduros nas encostas de Monchique.',
        '11.1': 'Cores de outono atingem as cotas médias e vales (Buçaco, Serra de São Mamede); aroma a castanhas assadas e festas tradicionais de Magusto.',
        '11.2': 'Época de São Martinho: tapetes dourados estendidos pelos trilhos; época de montanheira no Alentejo com abundância de bolota doce de sobreiro e azinheira.',
        '11.3': 'Conclusão da queda da folha nas serras nortenhas; contraste majestoso com a verdura perene dos montados e pinhais do litoral.'
      },
      en: {
        '10.2': 'Peak golden foliage in chestnut and beech forests of Serra da Estrela & Montesinho; simultaneous flowering and red berries on strawberry trees in Monchique; acorn drop in the montado.',
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
      const rankOrder = { peak_yellow: 5, yellowing: 4, falling: 3, fallen: 2, green: 1 };
      let highestRank = 0;
      let chosenStatus = null;

      deciduousSpecies.forEach(sp => {
        const st = DATA.getAutumnStatus(sp, loc, periodKey);
        if (st) {
          const rank = rankOrder[st.status] || 0;
          if (rank >= highestRank) {
            highestRank = rank;
            chosenStatus = st;
          }
        }
      });

      if (chosenStatus) {
        dominantFoliage = chosenStatus;
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

      DATA.species.forEach(sp => {
        let match = false;
        if (state.phenoState === 'flowering') {
          match = sp.phenology.floweringMonths.indexOf(state.month) !== -1;
        } else if (state.phenoState === 'fruiting') {
          match = sp.phenology.fruitingMonths.indexOf(state.month) !== -1;
        } else if (state.phenoState === 'foliage_yellowing') {
          if (sp.leafType === 'deciduous') {
            const st = DATA.getAutumnStatus(sp, null, periodKey);
            match = st && (st.status === 'yellowing' || st.status === 'peak_yellow');
          }
        } else if (state.phenoState === 'foliage_fallen') {
          if (sp.leafType === 'deciduous') {
            const st = DATA.getAutumnStatus(sp, null, periodKey);
            match = st && (st.status === 'fallen' || st.status === 'falling');
          }
        } else if (state.phenoState === 'foliage_green') {
          match = sp.leafType === 'evergreen';
        }

        if (match && sp.dgtCosCodes) {
          sp.dgtCosCodes.forEach(code => matchingCodes.add(code));
        }
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
        if ((isFl || isFr) && sp.dgtCosCodes) {
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

  function matchPhenology(statusObj, filterPheno) {
    if (filterPheno === 'all') return true;
    if (filterPheno === 'flowering') return statusObj.isFlowering;
    if (filterPheno === 'fruiting') return statusObj.isFruiting;

    const fol = statusObj.foliage ? statusObj.foliage.status : 'green';

    if (filterPheno === 'foliage_yellowing') return fol === 'yellowing' || fol === 'peak_yellow';
    if (filterPheno === 'foliage_fallen') return fol === 'fallen' || fol === 'falling';
    if (filterPheno === 'foliage_green') return fol === 'green' || fol === 'evergreen';

    return true;
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

      let autumnSt = { status: 'evergreen' };
      if (sp.leafType === 'deciduous') {
        autumnSt = DATA.getAutumnStatus(sp, null, periodKey);
      }

      const phenoObj = { isFlowering, isFruiting, foliage: autumnSt };
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
      coordsEl.textContent = `${latlng.lat.toFixed(4)}° N, ${latlng.lng.toFixed(4)}° W`;
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

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const size = map.getSize();
    const point = map.latLngToContainerPoint(e.latlng, map.getZoom());

    const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
    const width = Math.round(size.x);
    const height = Math.round(size.y);
    const x = Math.round(point.x);
    const y = Math.round(point.y);

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
    if (coordsEl) coordsEl.textContent = `${e.latlng.lat.toFixed(4)}° N, ${e.latlng.lng.toFixed(4)}° W`;

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
                : 'Sem ocupação florestal DGT neste ponto / Água';
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
        console.warn('GetFeatureInfo issue:', err);
        if (nameEl) nameEl.textContent = state.lang === 'ru' ? 'Лесной участок (ожидание данных)' : 'Ponto florestal registado';
        const codeEl = document.getElementById('val-parcel-code');
        const areaEl = document.getElementById('val-parcel-area');
        const regionEl = document.getElementById('val-parcel-region');
        if (codeEl) codeEl.textContent = '5.1.x';
        if (areaEl) areaEl.textContent = '~15 ha';
        if (regionEl) regionEl.textContent = 'Portugal';
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
              const fol = DATA.getAutumnStatus(sp, null, periodKey);
              const folLbl = fol ? fol.label[state.lang] : '';
              const isSelected = state.specificSpecies === sp.id;
              return `
                <button class="active-species-pill ${isSelected ? 'selected' : ''}" onclick="window.florestasApp.filterBySpecies('${sp.id}')" title="${folLbl}">
                  <span>🍂</span>
                  <span><strong>${common}</strong>: ${folLbl}</span>
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
        foliageStatus = DATA.getAutumnStatus(sp, null, periodKey);
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
      folStatus = DATA.getAutumnStatus(sp, null, periodKey);
    }

    document.getElementById('detail-category').textContent = sp.scientificName;
    document.getElementById('detail-foliage-status').textContent =
      `${folStatus.status !== 'evergreen' ? '🍂 ' : '🌿 '}${folStatus.label[state.lang]}`;

    document.getElementById('detail-box-foliage').textContent = folStatus.label[state.lang];
    document.getElementById('detail-box-flowering').textContent =
      sp.phenology.floweringMonths.indexOf(state.month) !== -1
        ? (state.lang === 'ru' ? 'В полном цвету' : 'Floração ativa')
        : (state.lang === 'ru' ? 'Цветение не наблюдается' : 'Sem floração');
    document.getElementById('detail-box-fruiting').textContent =
      sp.phenology.fruitingMonths.indexOf(state.month) !== -1
        ? (state.lang === 'ru' ? 'Созревание плодов / семян' : 'Maturação de fruto')
        : (state.lang === 'ru' ? 'Вне периода сбора' : 'Fora da época');

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
          const st = DATA.getAutumnStatus(sp, null, `${m}.2`);
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
        if (lang === 'ru') {
          title = `Вид: ${spName}`;
          desc = `Отображаются только участки произрастания данного вида по DGT COS (коды: ${codesStr}).`;
        } else if (lang === 'pt') {
          title = `Espécie: ${spName}`;
          desc = `Apresenta apenas os polígonos DGT COS específicos (${codesStr}) desta espécie.`;
        } else {
          title = `Species: ${spName}`;
          desc = `Displaying only official DGT COS parcels (${codesStr}) for this tree species.`;
        }
      }
    } else if (state.phenoState !== 'all') {
      hasFilter = true;
      if (state.phenoState === 'foliage_yellowing') {
        icon = '🍂';
        badge = lang === 'ru' ? 'Золотая осень' : lang === 'pt' ? 'Pico Dourado' : 'Golden Peak';
        const activeDecid = DATA.species.filter(sp => {
          if (sp.leafType !== 'deciduous') return false;
          const st = DATA.getAutumnStatus(sp, null, periodKey);
          return st && (st.status === 'yellowing' || st.status === 'peak_yellow');
        });
        const spNames = activeDecid.map(s => s.names[lang] || s.names.pt).join(', ');
        if (lang === 'ru') {
          title = `Золотая листва: ${activeDecid.length} вид(ов)`;
          desc = activeDecid.length > 0
            ? `Подсвечены лиственные леса (${spNames}). Пик осенних пейзажей и прогулок!`
            : `В текущий период нет видов на пике пожелтения листвы.`;
        } else if (lang === 'pt') {
          title = `Folhagem dourada: ${activeDecid.length} espécie(s)`;
          desc = activeDecid.length > 0
            ? `Destacadas as folhosas caducifólias (${spNames}). Período ideal para passeios outonais!`
            : `Neste período não há espécies em pico de amarelecimento foliar.`;
        } else {
          title = `Golden foliage: ${activeDecid.length} species`;
          desc = activeDecid.length > 0
            ? `Highlighting deciduous forests (${spNames}). Prime time for autumn walks!`
            : `No species are currently at peak foliage senescence.`;
        }
      } else if (state.phenoState === 'foliage_fallen') {
        icon = '🪵';
        badge = lang === 'ru' ? 'Зимний покой' : lang === 'pt' ? 'Folhas Caídas' : 'Fallen Leaves';
        const fallenDecid = DATA.species.filter(sp => {
          if (sp.leafType !== 'deciduous') return false;
          const st = DATA.getAutumnStatus(sp, null, periodKey);
          return st && (st.status === 'fallen' || st.status === 'falling');
        });
        if (fallenDecid.length === 0) {
          banner.classList.add('warning-mode');
          if (lang === 'ru') {
            title = 'Опавшая листва: 0 видов';
            desc = 'В середине октября в Португалии листья ещё не опали. Дубравы и каштаны находятся в золотом или зелёном уборе. Полигоны WMS скрыты.';
          } else if (lang === 'pt') {
            title = 'Folhas caídas: 0 espécies';
            desc = 'Em meados de outubro em Portugal as folhas ainda não caíram. Os soutos e carvalhais mantêm copa dourada ou verde. Polígonos WMS ocultados.';
          } else {
            title = 'Fallen leaves: 0 species';
            desc = 'In mid-October in Portugal leaves have not fallen yet. Canopies are still golden or green. WMS polygons are hidden.';
          }
        } else {
          const spNames = fallenDecid.map(s => s.names[lang] || s.names.pt).join(', ');
          if (lang === 'ru') {
            title = `Опавшая листва (${fallenDecid.length} вид(ов))`;
            desc = `Подсвечены массивы с завершённым листопадом: ${spNames}.`;
          } else if (lang === 'pt') {
            title = `Folhas no solo (${fallenDecid.length} espécies)`;
            desc = `Destacados povoamentos com desfolhação terminada: ${spNames}.`;
          } else {
            title = `Fallen leaves (${fallenDecid.length} species)`;
            desc = `Highlighting stands with shed foliage: ${spNames}.`;
          }
        }
      } else if (state.phenoState === 'flowering') {
        icon = '🌸';
        badge = lang === 'ru' ? 'Цветение' : lang === 'pt' ? 'Floração' : 'Blooming';
        const flSp = DATA.species.filter(sp => sp.phenology.floweringMonths.indexOf(state.month) !== -1);
        const spNames = flSp.map(s => s.names[lang] || s.names.pt).join(', ');
        if (lang === 'ru') {
          title = `Активное цветение: ${flSp.length} вид(ов)`;
          desc = `Подсвечены участки цветущих видов (${spNames}).`;
        } else if (lang === 'pt') {
          title = `Floração ativa: ${flSp.length} espécie(s)`;
          desc = `Destacadas as manchas com espécies em floração (${spNames}).`;
        } else {
          title = `Active blooming: ${flSp.length} species`;
          desc = `Highlighting stands with actively blooming species (${spNames}).`;
        }
      } else if (state.phenoState === 'fruiting') {
        icon = '🌰';
        badge = lang === 'ru' ? 'Спелые плоды' : lang === 'pt' ? 'Frutificação' : 'Fruiting';
        const frSp = DATA.species.filter(sp => sp.phenology.fruitingMonths.indexOf(state.month) !== -1);
        const spNames = frSp.map(s => s.names[lang] || s.names.pt).join(', ');
        if (lang === 'ru') {
          title = `Спелые плоды и сбор урожая: ${frSp.length} вид(ов)`;
          desc = `Подсвечены леса со спелыми плодами: каштаны, земляничное дерево, жёлуди дуба (${spNames}).`;
        } else if (lang === 'pt') {
          title = `Fruto maduro & Colheita: ${frSp.length} espécie(s)`;
          desc = `Destacadas florestas com frutos maduros: castanha, medronho, bolota (${spNames}).`;
        } else {
          title = `Ripe fruit & harvest: ${frSp.length} species`;
          desc = `Highlighting forests with ripe fruits: chestnuts, strawberry-tree berries, acorns (${spNames}).`;
        }
      } else if (state.phenoState === 'foliage_green') {
        icon = '🌿';
        badge = lang === 'ru' ? 'Вечнозелёные' : lang === 'pt' ? 'Perenifólias' : 'Evergreen';
        if (lang === 'ru') {
          title = 'Вечнозелёные леса и хвоя';
          desc = 'Подсвечены сосновые боры, эвкалиптовые рощи и средиземноморские вечнозелёные дубравы.';
        } else if (lang === 'pt') {
          title = 'Florestas perenifólias e resinosas';
          desc = 'Destacados pinhais, montados perenes e eucaliptais de copa verde contínua.';
        } else {
          title = 'Evergreen and coniferous forests';
          desc = 'Highlighting pine stands, evergreen oak montados, and year-round green canopies.';
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
          title = 'Миндальные сады и плодовые кустарники';
          desc = 'Косточковые плодовые сады и земляничное дерево (medronheiro). Исключены сплошные пустоши (6.1.1.1).';
        } else if (lang === 'pt') {
          title = 'Pomares de amendoeira e matos de fruto';
          desc = 'Frutos de casca rija e medronheiros (excluída a classe de matos generalistas 6.1.1.1).';
        } else {
          title = 'Almond orchards & fruiting shrubs';
          desc = 'Nut orchards and strawberry-tree shrubs (general scrubland 6.1.1.1 excluded).';
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
  // Event Listeners Binding
  // =========================================================================
  function bindEvents() {
    // Mobile Drawer Toggle
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (btnToggleSidebar && sidebar) {
      btnToggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Language Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        updateLanguage(lang);
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
    updateLanguage(state.lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
