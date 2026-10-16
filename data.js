/**
 * FLORESTAS DE PORTUGAL - Authentic Forest, Phenology & Autumn Foliage Dataset
 * Data sources:
 *  - DGT (Direção-Geral do Território): COS 2025v1 Série 2, COS 2023v1 Série 2, CPV 2025-2026, Serras Principais
 *  - ICNF (Instituto da Conservação da Natureza e das Florestas): 6.º Inventário Florestal Nacional (IFN6, 2019)
 *  - Flora-On (Sociedade Portuguesa de Botânica): Phenological calendars (flowering, fruiting, foliar senescence)
 *  - iNaturalist: Taxon IDs verified for Portugal (place_id: 7122)
 *
 * Languages: Russian (ru), European Portuguese (pt), English (en)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FLORESTAS_DATA = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DATA = {
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2026-10-16",
    "datasetDescription": {
      "ru": "Аутентичная база данных лесов Португалии, фенологии (цветение и плодоношение) и динамики осенней листвы.",
      "pt": "Base de dados autêntica das florestas de Portugal, fenologia (floração e frutificação) e dinâmica da folhagem de outono.",
      "en": "Authentic dataset of Portugal forests, phenology (blooming and fruiting), and autumn foliage dynamics."
    },
    "phenologyNote": {
      "ru": "Статус осенней листвы рассчитывается по высотным и региональным фенологическим календарям (ICNF / Flora-On / IPMA) и верифицируется наблюдениями с геопривязкой iNaturalist.",
      "pt": "O estado da folhagem de outono é calculado com base em calendários fenológicos altimétricos e regionais (ICNF / Flora-On / IPMA) e verificado através de observações georreferenciadas do iNaturalist.",
      "en": "Autumn foliage status is calculated using elevation and regional phenological calendars (ICNF / Flora-On / IPMA) and cross-checked with geotagged iNaturalist observations."
    }
  },
  "sources": [
    {
      "id": "dgt_cos_s2",
      "title": {
        "ru": "DGT — Серия 2 COS (COS 2025v1 / COS 2023v1)",
        "pt": "DGT — COS Série 2 (COS 2025v1 / COS 2023v1)",
        "en": "DGT — Land Cover Map Series 2 (COS 2025v1 / COS 2023v1)"
      },
      "organization": "Direção-Geral do Território (DGT)",
      "year": "2023–2025",
      "url": "https://geo2.dgterritorio.gov.pt/geoserver/ows",
      "description": {
        "ru": "Официальная цифровая карта землепользования и растительного покрова Португалии (Série 2) с разрешением до уровня 4.",
        "pt": "Cartografia temática oficial de ocupação e uso do solo de Portugal Continental em regime contínuo, com nomenclatura até ao nível 4.",
        "en": "Official thematic land use and land cover cartography for mainland Portugal with hierarchical classification down to level 4."
      }
    },
    {
      "id": "dgt_cpv",
      "title": {
        "ru": "DGT — Мониторинг потерь растительности (CPV 2025–2026)",
        "pt": "DGT — Cartografia de Perdas de Vegetação (CPV 2025–2026)",
        "en": "DGT — Vegetation Loss Cartography (CPV 2025–2026)"
      },
      "organization": "Direção-Geral do Território (DGT) / DRFloresta",
      "year": "2025–2026",
      "url": "https://geo2.dgterritorio.gov.pt/geoserver/ows",
      "description": {
        "ru": "Спутниковый оперативный мониторинг потерь древесной растительности и гарей в гидрологическом году 2025–2026.",
        "pt": "Monitorização contínua por satélite das perdas de coberto vegetal e áreas ardidas no ano hidrológico 2025–2026.",
        "en": "Continuous satellite monitoring of canopy loss and burned areas for the 2025–2026 hydrological year."
      }
    },
    {
      "id": "icnf_ifn6",
      "title": {
        "ru": "ICNF — 6-я Национальная лесная инвентаризация (IFN6)",
        "pt": "ICNF — 6.º Inventário Florestal Nacional (IFN6)",
        "en": "ICNF — 6th National Forest Inventory (IFN6)"
      },
      "organization": "Instituto da Conservação da Natureza e das Florestas (ICNF)",
      "year": "2019",
      "url": "https://www.icnf.pt/florestas/ifn",
      "description": {
        "ru": "Государственная статистика лесного фонда Португалии: площади пород, запасы древесины и структура насаждений.",
        "pt": "Estatísticas florestais oficiais de Portugal Continental: áreas por espécie, volumetria e estrutura dos povoamentos florestais.",
        "en": "Official national forest statistics for mainland Portugal: species surface areas, standing volume, and forest structure."
      }
    },
    {
      "id": "flora_on",
      "title": {
        "ru": "Flora-On — Флора Португалии",
        "pt": "Flora-On — Sociedade Portuguesa de Botânica",
        "en": "Flora-On — Botanical Society of Portugal"
      },
      "organization": "Sociedade Portuguesa de Botânica (SPBotânica)",
      "year": "2012–2026",
      "url": "https://flora-on.pt/",
      "description": {
        "ru": "Интерактивный научный ботанический атлас Португалии с выверенными календарями цветения, плодоношения и вегетации.",
        "pt": "Portal botânico interativo com fichas científicas, épocas verificadas de floração, frutificação e distribuição biogeográfica.",
        "en": "Scientific interactive botanical portal featuring verified flowering and fruiting calendars and biogeographical ranges."
      }
    },
    {
      "id": "inaturalist_pt",
      "title": {
        "ru": "iNaturalist — Наблюдения за биоразнообразием Португалии",
        "pt": "iNaturalist — Observações da Biodiversidade em Portugal",
        "en": "iNaturalist — Biodiversity Observations in Portugal"
      },
      "organization": "California Academy of Sciences / National Geographic / iNaturalist Portugal",
      "year": "2026",
      "url": "https://www.inaturalist.org/observations?place_id=7122",
      "description": {
        "ru": "Живой поток геопривязанных фотонаблюдений за дикорастущими деревьями и кустарниками с исследовательским качеством (Research Grade).",
        "pt": "Fluxo em tempo real de observações fotográficas georreferenciadas de espécies arbóreas e arbustivas com Grau de Investigação.",
        "en": "Real-time stream of research-grade geotagged photographic observations for tree and shrub species across Portugal."
      }
    }
  ],
  "wmsConfig": {
    "url": "https://geo2.dgterritorio.gov.pt/geoserver/ows",
    "defaultVersion": "1.1.1",
    "srs": "EPSG:4326",
    "layers": {
      "cos2025": {
        "id": "COS-S2:cos2025v1-s2",
        "title": {
          "ru": "COS 2025v1 (Серия 2)",
          "pt": "COS 2025v1 (Série 2)",
          "en": "COS 2025v1 (Series 2)"
        },
        "year": 2025,
        "defaultCql": "cos25v1_n1_c = '5'"
      },
      "cos2023": {
        "id": "COS-S2:cos2023v1-s2",
        "title": {
          "ru": "COS 2023v1 (Серия 2)",
          "pt": "COS 2023v1 (Série 2)",
          "en": "COS 2023v1 (Series 2)"
        },
        "year": 2023,
        "defaultCql": "cos23v1_n1_c = '5'"
      },
      "cpv2026": {
        "id": "DRFloresta:CPV",
        "title": {
          "ru": "Потери растительности (CPV 2025–2026)",
          "pt": "Perdas de Vegetação (CPV 2025–2026)",
          "en": "Vegetation Loss (CPV 2025–2026)"
        },
        "year": "2025-2026",
        "defaultCql": null
      },
      "serras": {
        "id": "serras_contributos:Serras_principais",
        "title": {
          "ru": "Главные горные хребты Португалии",
          "pt": "Serras Principais de Portugal Continental",
          "en": "Principal Mountain Ranges of Portugal"
        },
        "year": "2024",
        "defaultCql": null
      }
    },
    "cqlFilters": {
      "all_forests": "cos25v1_n1_c = '5'",
      "eucalyptus": "cos25v1_n4_l ILIKE '%eucalipto%'",
      "pine": "cos25v1_n4_l ILIKE '%pinheiro%' OR cos25v1_n4_l ILIKE '%resinosas%'",
      "deciduous": "cos25v1_n4_l ILIKE '%carvalho%' OR cos25v1_n4_l ILIKE '%castanheiro%' OR cos25v1_n4_l ILIKE '%outras folhosas%'",
      "montado": "cos25v1_n4_l ILIKE '%sobreiro%' OR cos25v1_n4_l ILIKE '%azinheira%'"
    }
  },
  "species": [
    {
      "id": "quercus_suber",
      "scientificName": "Quercus suber",
      "inatTaxonId": 50868,
      "category": "montado",
      "leafType": "evergreen",
      "areaHa": 719900,
      "sharePct": 22.3,
      "color": "#2d6a4f",
      "icon": "🌳",
      "names": {
        "ru": "Пробковый дуб",
        "pt": "Sobreiro",
        "en": "Cork Oak"
      },
      "descriptions": {
        "ru": "Национальное дерево Португалии (закон 2011 г.). Формирует уникальную экосистему монтадо в Алентежу, Сетубале и Рибатежу. Португалия производит более 50% мировой натуральной пробки. Кора снимается раз в 9–10 лет.",
        "pt": "Árvore Nacional de Portugal (declarada por lei em 2011). Estrutura o ecossistema único do montado no Alentejo, Península de Setúbal e Ribatejo. Portugal é líder mundial na produção de cortiça.",
        "en": "National Tree of Portugal (designated by law in 2011). Forms the unique montado agrosilvopastoral landscape across Alentejo, Setúbal, and Ribatejo. Portugal provides over 50% of the world cork supply."
      },
      "phenology": {
        "floweringMonths": [
          4,
          5
        ],
        "fruitingMonths": [
          10,
          11,
          12,
          1,
          2
        ],
        "autumnFoliage": null,
        "phenologyNotes": {
          "ru": "Вечнозеленый. Цветет в апреле-мае. Желуди (bolotas) созревают с октября по февраль и служат основным кормом для черной иберийской свиньи в период откорма (montanheira).",
          "pt": "Folha perene. Floração em abril-maio. A bolota amadurece de outubro a fevereiro, sustentando a época tradicional de montanheira do porco de raça alentejana.",
          "en": "Evergreen foliage. Flowers in April-May. Acorns ripen from October to February, powering the traditional acorn-fattening season (montanheira) of the Iberian pig."
        }
      },
      "dgtCosCodes": [
        "5.1.1.1",
        "4.1.1.1",
        "4.2.1.1"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Весенние свисающие сережки (апрель-май)",
          "pt": "Amentilhos pendentes na primavera",
          "en": "Hanging spring catkins"
        },
        "fruiting": {
          "ru": "Обильные желуди (bolotas) для черных свиней (октябрь-февраль)",
          "pt": "Bolota farta para a época de montanheira",
          "en": "Abundant acorns for montanheira pig feeding"
        }
      }
    },
    {
      "id": "quercus_rotundifolia",
      "scientificName": "Quercus rotundifolia",
      "inatTaxonId": 82946,
      "category": "montado",
      "leafType": "evergreen",
      "areaHa": 348700,
      "sharePct": 10.8,
      "color": "#40916c",
      "icon": "🌿",
      "names": {
        "ru": "Каменный дуб",
        "pt": "Azinheira",
        "en": "Holm Oak"
      },
      "descriptions": {
        "ru": "Главная лесообразующая порода сухих внутренних равнин Алентежу (Эвора, Бежа) и Траз-уж-Монтиш. Образует светлые леса — «азиньялы». Дает сладкие желуди.",
        "pt": "Espécie fulcral dos montados do interior alentejano (Évora, Beja) e dos contrafortes transmontanos. Muito resistente à secura estival e ao clima mediterrânico extremo.",
        "en": "Key keystone species of the dry inland Alentejo plains and eastern Trás-os-Montes. Highly resilient to prolonged summer drought; produces sweet acorns."
      },
      "phenology": {
        "floweringMonths": [
          3,
          4,
          5
        ],
        "fruitingMonths": [
          10,
          11,
          12,
          1
        ],
        "autumnFoliage": null,
        "phenologyNotes": {
          "ru": "Вечнозеленый. Цветет в марте-мае. Сладкие желуди опадают с октября по январь.",
          "pt": "Folha persistente. Floração entre março e maio. Bolota doce com maturação e queda entre outubro e janeiro.",
          "en": "Evergreen. Blooms from March to May. Sweet acorns ripen and drop between October and January."
        }
      },
      "dgtCosCodes": [
        "5.1.1.2",
        "4.1.1.2",
        "4.2.1.2"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Весенние желтоватые сережки (март-май)",
          "pt": "Amentilhos amarelados em abril",
          "en": "Yellowish catkins in spring"
        },
        "fruiting": {
          "ru": "Сладкие съедобные желуди (октябрь-январь)",
          "pt": "Bolota doce comestível outonal",
          "en": "Sweet edible acorns in autumn"
        }
      }
    },
    {
      "id": "pinus_pinaster",
      "scientificName": "Pinus pinaster",
      "inatTaxonId": 82723,
      "category": "pine",
      "leafType": "evergreen",
      "areaHa": 713300,
      "sharePct": 22.1,
      "color": "#1b4332",
      "icon": "🌲",
      "names": {
        "ru": "Приморская сосна",
        "pt": "Pinheiro-bravo",
        "en": "Maritime Pine"
      },
      "descriptions": {
        "ru": "Историческая хвойная порода центрального и северного побережья (знаменитый Королевский бор Лейрии — Pinhal de Leiria). Традиционный источник древесины для каравелл эпохи Великих географических открытий и смолы.",
        "pt": "Espécie emblemática do litoral e serras do Centro e Norte. Base histórica do Pinhal de Leiria (Pinhal do Rei), forneceu madeira para os navios dos Descobrimentos e resina.",
        "en": "Iconic conifer dominating coastal and mountain zones in Central and Northern Portugal. Historic anchor of Pinhal de Leiria, supplying timber for Age of Discovery caravels."
      },
      "phenology": {
        "floweringMonths": [
          2,
          3,
          4,
          5
        ],
        "fruitingMonths": [],
        "autumnFoliage": null,
        "phenologyNotes": {
          "ru": "Вечнозеленый. Пыльцевое цветение весной. Шишки созревают 2 года, рассеивание семян происходит осенью и весной.",
          "pt": "Folha persistente. Dispersão de pólen na primavera. Pinhas com maturação bianual, com abertura e dispersão de sementes.",
          "en": "Evergreen needles. Pollen dispersal in spring. Cones take two years to mature; seed release occurs in autumn and spring."
        }
      },
      "dgtCosCodes": [
        "5.1.2.1"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Пыльцевые золотистые колоски (февраль-май)",
          "pt": "Espigas de pólen primaveris",
          "en": "Golden pollen clusters in spring"
        },
        "fruiting": {
          "ru": "Крупные деревянистые смолистые шишки",
          "pt": "Pinhas lenhosas e resinosas",
          "en": "Large woody resinous pinecones"
        }
      }
    },
    {
      "id": "pinus_pinea",
      "scientificName": "Pinus pinea",
      "inatTaxonId": 63621,
      "category": "pine",
      "leafType": "evergreen",
      "areaHa": 193400,
      "sharePct": 6,
      "color": "#0f382c",
      "icon": "🌲",
      "names": {
        "ru": "Итальянская сосна (пиния)",
        "pt": "Pinheiro-manso",
        "en": "Stone Pine"
      },
      "descriptions": {
        "ru": "Характерная зонтиковидная сосна песчаных почв полуострова Сетубал (Алкасер-ду-Сал, Грандола) и Рибатежу. Португалия — ведущий мировой экспортер ценного кедрового ореха (pinhão).",
        "pt": "Conífera de copa arredondada em guarda-sol, dominante nos solos arenosos da Península de Setúbal, bacia do Sado (Alcácer do Sal) e Coruche. Produz o pinhão comercial.",
        "en": "Umbrella-shaped pine flourishing on the sandy soils of Setúbal Peninsula, Sado basin (Alcácer do Sal), and Ribatejo. Portugal is a top global exporter of premium pine nuts."
      },
      "phenology": {
        "floweringMonths": [
          4,
          5
        ],
        "fruitingMonths": [
          12,
          1,
          2,
          3
        ],
        "autumnFoliage": null,
        "phenologyNotes": {
          "ru": "Вечнозеленый. Цветет в апреле-мае. Шишки созревают 3 года; сбор шишек (pinhas) официально разрешен и проводится зимой с 1 декабря по конец марта.",
          "pt": "Folha persistente. Floração em abril-maio. As pinhas amadurecem no terceiro ano; a colheita oficial decorre exclusivamente entre dezembro e março.",
          "en": "Evergreen. Flowers in April-May. Cones require three years to mature; official pine cone harvest is legally regulated from December through March."
        }
      },
      "dgtCosCodes": [
        "5.1.2.2",
        "4.1.2.1",
        "4.2.2.1"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Пыльцевые сережки (март-май)",
          "pt": "Inflorescências masculinas em maio",
          "en": "Pollen clusters in May"
        },
        "fruiting": {
          "ru": "Округлые шишки с ценными кедровыми орешками (пиньоны)",
          "pt": "Pinhas arredondadas com pinhões nobres",
          "en": "Rounded cones yielding gourmet pine nuts"
        }
      }
    },
    {
      "id": "eucalyptus_globulus",
      "scientificName": "Eucalyptus globulus",
      "inatTaxonId": 53398,
      "category": "eucalyptus",
      "leafType": "evergreen",
      "areaHa": 845000,
      "sharePct": 26.2,
      "color": "#52b788",
      "icon": "🍃",
      "names": {
        "ru": "Шаровидный эвкалипт",
        "pt": "Eucalipto",
        "en": "Tasmanian Blue Gum"
      },
      "descriptions": {
        "ru": "Самая распространенная порода по площади в Португалии (26% лесов). Интродуцирован в XIX веке. Быстрорастущее сырье для целлюлозно-бумажной промышленности в Бейра-Литорал и на севере.",
        "pt": "Espécie arbórea mais extensa em Portugal Continental (26% da floresta). Introduzida no século XIX, alimenta a indústria da pasta e papel no Centro-Norte.",
        "en": "Most extensive tree species by area in mainland Portugal (26% of forest land). Introduced in the 19th century, serving as key pulp and paper resource in Central and Northern regions."
      },
      "phenology": {
        "floweringMonths": [
          11,
          12,
          1,
          2
        ],
        "fruitingMonths": [
          11,
          12,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "autumnFoliage": null,
        "phenologyNotes": {
          "ru": "Вечнозеленый. Цветет обильно осенью и зимой (с сентября по март), являясь главным зимним медоносом для пчеловодства в Португалии.",
          "pt": "Folha persistente. Floração intensa de outono e inverno (setembro a março), constituindo o principal recurso melífero invernal de Portugal.",
          "en": "Evergreen. Remarkable autumn and winter bloom (September to March), representing the primary winter nectar source for Portuguese apiculture."
        }
      },
      "dgtCosCodes": [
        "5.1.1.6"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Пушистые белые цветки с обильным нектаром (октябрь-март)",
          "pt": "Floração melífera de outono-inverno",
          "en": "Feathery white winter blossoms rich in nectar"
        },
        "fruiting": {
          "ru": "Деревянистые ребристые коробочки с семенами",
          "pt": "Cápsulas lenhosas quadrangulares",
          "en": "Woody seed capsules"
        }
      }
    },
    {
      "id": "castanea_sativa",
      "scientificName": "Castanea sativa",
      "inatTaxonId": 121763,
      "category": "deciduous",
      "leafType": "deciduous",
      "areaHa": 47800,
      "sharePct": 1.5,
      "color": "#d97706",
      "icon": "🌰",
      "names": {
        "ru": "Посевной каштан",
        "pt": "Castanheiro",
        "en": "Sweet Chestnut"
      },
      "descriptions": {
        "ru": "Культурное достояние горных районов: Траз-уж-Монтиш (Виньяйш, Браганса), Серра-да-Эштрела и Марван. Главный символ праздника Магушту (Magusto, 11 ноября). Осенью кроны окрашиваются в золотисто-медный цвет.",
        "pt": "Património agrícola e florestal transmontano (Vinhais, Padrela) e serrano (Estrela, São Mamede/Marvão). Centro da celebração do Magusto no dia de São Martinho. Folhagem outonal dourada exuberante.",
        "en": "Heritage deciduous tree celebrated in northern mountains (Vinhais, Padrela) and central ranges (Estrela, Marvão). Heart of the Magusto roasted chestnut festival. Radiant golden-bronze autumn canopy."
      },
      "phenology": {
        "leafOutMonth": 4,
        "floweringMonths": [
          6,
          7
        ],
        "fruitingMonths": [
          10,
          11
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "yellowing",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "peak_yellow",
            "11.3": "falling"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "peak_yellow",
            "11.3": "falling"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный. Цветет длинными кремовыми сережками в июне-июле. Каштаны созревают в октябре-ноябре. Золотая листва достигает пика в конце октября — начале ноября.",
          "pt": "Folha caduca. Floresce em amentilhos cremes em junho-julho. Frutificação (ouriços e castanhas) em outubro e novembro. Pico de folhagem dourada entre o final de outubro e início de novembro.",
          "en": "Deciduous. Blooms with creamy catkins in June-July. Chestnuts ripen in October and November. Peak golden-bronze canopy between late October and early November."
        }
      },
      "dgtCosCodes": [
        "5.1.1.4"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Кремово-желтые душистые сережки (июнь-июль)",
          "pt": "Amentilhos amarelo-creme aromáticos",
          "en": "Creamy-yellow fragrant catkins"
        },
        "fruiting": {
          "ru": "Съедобные каштаны в колючих плюсках (октябрь-ноябрь)",
          "pt": "Castanhas doces em ouriços espinhosos",
          "en": "Sweet edible chestnuts in spiny burrs"
        }
      }
    },
    {
      "id": "quercus_pyrenaica",
      "scientificName": "Quercus pyrenaica",
      "inatTaxonId": 125848,
      "category": "deciduous",
      "leafType": "deciduous",
      "areaHa": 43000,
      "sharePct": 1.3,
      "color": "#b45309",
      "icon": "🍂",
      "names": {
        "ru": "Пиренейский дуб (черноватый)",
        "pt": "Carvalho-negral",
        "en": "Pyrenean Oak"
      },
      "descriptions": {
        "ru": "Аборигенный листопадный дуб горных районов Серра-да-Эштрела, Монтезинью и Пенеда-Жереш. Листья с глубокими лопастями. Осенью приобретают теплый охристо-янтарный цвет и долго сохраняются на ветвях (марцесценция).",
        "pt": "Espécie autóctone nobre das montanhas do Norte e Centro (Serras da Estrela, Montesinho, Gerês e Gardunha). Apresenta marcescência foliar: a folhagem adquire tons acobreados e resiste até ao inverno.",
        "en": "Native montane oak inhabiting Serra da Estrela, Montesinho, and Peneda-Gerês. Exhibits marcescence: deeply lobed leaves turn amber-copper in autumn and cling to branches into winter."
      },
      "phenology": {
        "leafOutMonth": 5,
        "floweringMonths": [
          5,
          6
        ],
        "fruitingMonths": [
          9,
          10,
          11
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "yellowing",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "peak_yellow",
            "11.3": "falling"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный/марцесцентный. Цветет в мае-июне. Желуди опадают в сентябре-ноябре. Осеннее пожелтение начинается в середине октября на высотах более 900 м, пик — в конце октября и начале ноября.",
          "pt": "Marcescente. Floração em maio-junho. Maturação das bolotas em setembro-novembro. Amarelecimento a partir de meados de outubro acima dos 900m; pico âmbar e acobreado em finais de outubro.",
          "en": "Marcescent deciduous oak. Flowers in May-June. Acorns mature in Sep-Nov. Foliage yellows from mid-October above 900m, reaching peak amber-copper in late October and early November."
        }
      },
      "dgtCosCodes": [
        "5.1.1.3",
        "4.1.1.3",
        "4.2.1.3"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Свисающие сережки (апрель-май)",
          "pt": "Amentilhos em maio",
          "en": "Hanging catkins in May"
        },
        "fruiting": {
          "ru": "Желуди на коротких ножках (сентябрь-ноябрь)",
          "pt": "Bolotas sésseis ou subsésseis",
          "en": "Acorns on short stalks"
        }
      }
    },
    {
      "id": "quercus_robur",
      "scientificName": "Quercus robur",
      "inatTaxonId": 1520309,
      "category": "deciduous",
      "leafType": "deciduous",
      "areaHa": 26000,
      "sharePct": 0.8,
      "color": "#92400e",
      "icon": "🍁",
      "names": {
        "ru": "Черешчатый дуб",
        "pt": "Carvalho-alvarinho",
        "en": "Pedunculate Oak"
      },
      "descriptions": {
        "ru": "Атлантический великан влажного северо-запада Португалии (Минью, Дору-Литорал, реликтовый лес Мата-да-Албергария в Жереше). Формирует богатейшие многоярусные дубравы.",
        "pt": "Carvalho atlântico emblemático do Noroeste Húmido de Portugal (Minho e Parque Nacional da Peneda-Gerês, como na Mata da Albergaria). Estrutura as matas mais biodiversas do país.",
        "en": "Magnificent Atlantic oak thriving across humid Northwestern Portugal (Minho and Peneda-Gerês National Park, such as Mata da Albergaria). Forms prime native climax temperate rainforests."
      },
      "phenology": {
        "leafOutMonth": 4,
        "floweringMonths": [
          4,
          5
        ],
        "fruitingMonths": [
          9,
          10,
          11
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "green",
            "11.2": "yellowing",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный. Цветет в апреле-мае. Желуди на длинных черешках созревают в сентябре-ноябре. Осенняя окраска — от золотистой до теплой ржаво-коричневой в конце октября и ноябре.",
          "pt": "Folha caduca. Floração em abril-maio. Bolotas em pedúnculos longos em setembro-novembro. Folhagem adquire tons dourados e castanho-ferrugem em finais de outubro e novembro.",
          "en": "Deciduous. Blooms in April-May. Long-stalked acorns drop in Sep-Nov. Foliage turns deep gold and russet brown through late October and November."
        }
      },
      "dgtCosCodes": [
        "5.1.1.3",
        "4.1.1.3",
        "4.2.1.3"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Свисающие сережки (апрель-май)",
          "pt": "Amentilhos primaveris",
          "en": "Spring catkins"
        },
        "fruiting": {
          "ru": "Желуди на длинных ножках (сентябрь-ноябрь)",
          "pt": "Bolotas em longos pedúnculos",
          "en": "Long-stalked pedunculate acorns"
        }
      }
    },
    {
      "id": "quercus_faginea",
      "scientificName": "Quercus faginea",
      "inatTaxonId": 82980,
      "category": "deciduous",
      "leafType": "deciduous",
      "areaHa": 13300,
      "sharePct": 0.4,
      "color": "#78350f",
      "icon": "🍂",
      "names": {
        "ru": "Португальский дуб (дуб серкиньо)",
        "pt": "Carvalho-cerquinho",
        "en": "Portuguese Oak"
      },
      "descriptions": {
        "ru": "Эндемичный дуб Пиренейского полуострова, приспособленный к известняковым почвам Центральной Португалии (Серра-де-Айре-и-Кандеэйруш, Бусаку, Синтра). Полулистопадный / марцесцентный вид.",
        "pt": "Carvalho mediterrânico-atlântico característico do maciço calcário estremenho (Serras de Aire e Candeeiros, Sicó, Sintra e Buçaco). Folhagem marcescente com orlas dentadas.",
        "en": "Sub-Mediterranean marcescent oak thriving on limestone soils of Central Portugal (Aire e Candeeiros, Sicó, Sintra, Buçaco). Dentate leaves turn yellow-ochre in late autumn."
      },
      "phenology": {
        "leafOutMonth": 4,
        "floweringMonths": [
          3,
          4,
          5
        ],
        "fruitingMonths": [
          9,
          10,
          11
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "green",
            "11.2": "yellowing",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Марцесцентный. Цветет в марте-мае. Желуди созревают осенью. Листва меняет цвет позже других дубов — преимущественно в первой половине ноября.",
          "pt": "Marcescente. Floração precoce em março-maio. A mudança de cor foliar é tardia, tornando-se amarelada e ocre predominantemente em novembro.",
          "en": "Marcescent. Early spring flowering (March-May). Foliar colour change occurs later than northern oaks, peaking yellow-ochre during November."
        }
      },
      "dgtCosCodes": [
        "5.1.1.3",
        "4.1.1.3",
        "4.2.1.3"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Весеннее цветение (март-май)",
          "pt": "Floração em março-maio",
          "en": "Spring flowering"
        },
        "fruiting": {
          "ru": "Желуди в чешуйчатых чашечках (сентябрь-ноябрь)",
          "pt": "Bolotas em cúpulas escamosas",
          "en": "Acorns in scaly cups"
        }
      }
    },
    {
      "id": "fagus_sylvatica",
      "scientificName": "Fagus sylvatica",
      "inatTaxonId": 54227,
      "category": "deciduous",
      "leafType": "deciduous",
      "areaHa": null,
      "sharePct": null,
      "color": "#ea580c",
      "icon": "🍁",
      "names": {
        "ru": "Европейский бук (лесной)",
        "pt": "Faia",
        "en": "European Beech"
      },
      "descriptions": {
        "ru": "Звезда осеннего экотуризма в Серра-да-Эштрела (Мантейгаш, роща Bosque de São Lourenço и маршрут Rota das Faias — PR13 MTG). Посажена в начале XX века Службой лесного хозяйства, образовав самый фотографируемый золотисто-багряный лес Португалии.",
        "pt": "Protagonista icónico do outono na Serra da Estrela (Manteigas, Bosque de São Lourenço e PR13 MTG - Rota das Faias). Introduzida no início do século XX pelos Serviços Florestais, cria uma das abóbadas outonais mais espectaculares do país.",
        "en": "The crown jewel of autumn foliage in Serra da Estrela (Manteigas, São Lourenço Beech Forest, and trail PR13 MTG - Rota das Faias). Planted in the early 20th century, forming Portugal most celebrated golden-copper cathedral canopy."
      },
      "phenology": {
        "leafOutMonth": 4,
        "floweringMonths": [
          4,
          5
        ],
        "fruitingMonths": [
          9,
          10
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный. Цветет в апреле-мае. Орешки (буковые орехи) созревают в сентябре-октябре. В Мантейгаше (1100 м) листва начинает желтеть к середине октября, достигает ослепительного медно-оранжевого пика в конце октября — начале ноября, после чего ковром устилает лесные тропы к середине ноября.",
          "pt": "Folha caduca. Floresce em abril-maio; faiolas em setembro-outubro. Em Manteigas (1100m), a viragem inicia-se em meados de outubro, atingindo o auge de cobre e laranja entre 25 de outubro e 10 de novembro, caindo em tapete até meados de novembro.",
          "en": "Deciduous. Flowers in April-May; beechnuts in Sep-Oct. In Manteigas (1100m), leaves begin turning in mid-October, reaching dazzling copper-orange peak between Oct 25 and Nov 10, creating a carpeted forest floor by mid-November."
        }
      },
      "dgtCosCodes": [
        "5.1.1.8",
        "4.1.1.4",
        "4.2.1.4"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Весенние соцветия (апрель-май)",
          "pt": "Flores discretas em maio",
          "en": "Discreet spring flowers"
        },
        "fruiting": {
          "ru": "Трехгранные буковые орешки в плюсках (сентябрь-октябрь)",
          "pt": "Faiolas triangulares oleaginosas",
          "en": "Triangular beechnuts in prickly husks"
        }
      }
    },
    {
      "id": "betula_celtiberica",
      "scientificName": "Betula celtiberica",
      "inatTaxonId": 784704,
      "category": "deciduous",
      "leafType": "deciduous",
      "areaHa": null,
      "sharePct": null,
      "color": "#eab308",
      "icon": "🌾",
      "names": {
        "ru": "Береза кельтиберийская",
        "pt": "Bétula-celtibérica",
        "en": "Celtic Birch"
      },
      "descriptions": {
        "ru": "Коренная береза высокогорий севера и центра Португалии (Жереш, Эштрела, Монтезинью, Алван). Белоствольное дерево, растущее вдоль горных ручьев и на верхнем пределе леса. В октябре вспыхивает ярко-лимонным цветом.",
        "pt": "Bétula autóctone das galerias ripícolas e encostas montanas do Norte e Centro (Peneda-Gerês, Serra da Estrela, Montesinho e Alvão). Casca prateada e folhagem amarela luminosa de outono.",
        "en": "Native birch of high-elevation riparian galleries and mountain slopes (Gerês, Estrela, Montesinho, Alvão). Silvery bark and radiant lemon-yellow autumn foliage."
      },
      "phenology": {
        "leafOutMonth": 4,
        "floweringMonths": [
          4,
          5
        ],
        "fruitingMonths": [
          7,
          8,
          9
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "yellowing",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "falling",
            "11.2": "fallen",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный. Цветет сережками в апреле-мае. Раннее осеннее пожелтение: листья становятся ярко-желтыми уже в начале-середине октября, а опадают раньше дубов — к началу ноября.",
          "pt": "Folha caduca. Floresce em abril-maio. Amarelecimento precoce: as folhas atingem amarelo vivo no início e meados de outubro, caindo tipicamente antes dos carvalhais.",
          "en": "Deciduous. Flowers in April-May. Early autumn yellowing: leaves turn vivid golden-lemon in early to mid-October, shedding earlier than associated oaks."
        }
      },
      "dgtCosCodes": [
        "5.1.1.8",
        "4.1.1.4",
        "4.2.1.4"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Мужские и женские сережки (апрель-май)",
          "pt": "Amentilhos primaveris",
          "en": "Spring catkins"
        },
        "fruiting": {
          "ru": "Крылатые орешки-семянки (сентябрь-октябрь)",
          "pt": "Sâmaras aladas miúdas",
          "en": "Small winged nutlets"
        }
      }
    },
    {
      "id": "arbutus_unedo",
      "scientificName": "Arbutus unedo",
      "inatTaxonId": 82689,
      "category": "orchard_shrub",
      "leafType": "evergreen",
      "cosRole": "associated",
      "areaHa": 16000,
      "sharePct": 0.5,
      "color": "#dc2626",
      "icon": "🍓",
      "names": {
        "ru": "Земляничное дерево (земляничник)",
        "pt": "Medronheiro",
        "en": "Strawberry Tree"
      },
      "descriptions": {
        "ru": "Средиземноморское вечнозеленое дерево, визитная карточка Серра-де-Моншике и Серра-ду-Калдейран (Алгарве), а также Алентежу и Центра. Из спелых ягод производят знаменитый португальский дистиллят — Aguardente de Medronho.",
        "pt": "Espécie mediterrânica nobre e protegida, ícone da Serra de Monchique e Serra do Caldeirão (Algarve), Centro e Alentejo. Dos seus frutos redondos avermelhados destila-se a tradicional Aguardente de Medronho.",
        "en": "Mediterranean evergreen treasure and cultural symbol of Serra de Monchique and Caldeirão (Algarve). Its bright red globose fruits are fermented and distilled into the prized artisan spirit Aguardente de Medronho."
      },
      "phenology": {
        "floweringMonths": [
          10,
          11,
          12
        ],
        "fruitingMonths": [
          10,
          11,
          12
        ],
        "autumnFoliage": null,
        "phenologyNotes": {
          "ru": "Вечнозеленый. Уникальная осенняя фенология: в октябре-декабре на ветвях ОДНОВРЕМЕННО распускаются нежные бело-розовые колокольчатые цветы и висят ярко-красные спелые плоды прошлого года!",
          "pt": "Folha persistente. Fenologia outonal singular: entre outubro e dezembro, a árvore ostenta SIMULTANEAMENTE cachos de flores brancas em campânula e medronhos maduros escarlates do ciclo anterior.",
          "en": "Evergreen. Extraordinary autumn phenology: from October through December, it SIMULTANEOUSLY displays clusters of delicate white-pink bell flowers and ripe scarlet strawberry-like fruits from the previous year cycle."
        }
      },
      "dgtCosCodes": [
        "5.1.1.3",
        "5.1.1.1",
        "5.1.1.8"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Белые цветки-колокольчики одновременно с плодами (октябрь-декабрь)",
          "pt": "Campainhas brancas em cachos pendentes",
          "en": "White bell-shaped hanging flowers"
        },
        "fruiting": {
          "ru": "Сладкие ярко-красные ягоды медронхо (октябрь-декабрь)",
          "pt": "Medronhos vermelhos maduros deliciosos",
          "en": "Sweet vibrant red ripe medronho berries"
        }
      }
    },
    {
      "id": "prunus_dulcis",
      "scientificName": "Prunus dulcis",
      "inatTaxonId": 69936,
      "category": "orchard_shrub",
      "leafType": "deciduous",
      "cosRole": "associated",
      "areaHa": 35000,
      "sharePct": null,
      "color": "#ec4899",
      "icon": "🌸",
      "names": {
        "ru": "Миндаль обыкновенный",
        "pt": "Amendoeira",
        "en": "Almond"
      },
      "descriptions": {
        "ru": "Знаменитый символ конца зимы в Дору-Супериор (Вила-Нова-де-Фош-Коа, Барка-д’Алва) и Алгарве (Баррокал). Тысячи цветущих деревьев покрывают долины бело-розовым покровом уже в феврале.",
        "pt": "Cultura ancestral e atracção paisagística maior no Douro Superior (Vila Nova de Foz Côa, Figueira de Castelo Rodrigo) e Barrocal Algarvio. Celebração do espectáculo das \"Amendoeiras em Flor\".",
        "en": "Celebrated harbinger of spring in Douro Superior (Vila Nova de Foz Côa, Barca d’Alva) and the Algarve Barrocal. Whitish-pink blossoms carpet valleys during late winter."
      },
      "phenology": {
        "leafOutMonth": 3,
        "floweringMonths": [
          1,
          2,
          3
        ],
        "fruitingMonths": [
          8,
          9
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "falling",
            "11.2": "fallen",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный. Раннее феерическое цветение в конце января — марте («Миндаль в цвету»). Урожай миндаля собирают в августе-сентябре. Листья желтеют в конце октября и опадают в ноябре.",
          "pt": "Folha caduca. Floração precoce espectacular de janeiro a março (\"Amendoeiras em Flor\"). Maturação e apanha dos frutos em agosto-setembro; desfoliação outonal em novembro.",
          "en": "Deciduous. Spectacular early blossoms from late January through March (\"Almonds in Bloom\"). Almond harvest in August-September; foliage drops in November."
        }
      },
      "dgtCosCodes": [
        "2.2.2.1",
        "2.2.2.2",
        "2.2.2.3"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Знаменитое бело-розовое цветение миндаля (январь-март)",
          "pt": "Espetáculo de amendoeiras em flor",
          "en": "Legendary white and pink almond blossoms"
        },
        "fruiting": {
          "ru": "Миндальные орехи в бархатистой оболочке (август-октябрь)",
          "pt": "Amêndoas em casca aveludada",
          "en": "Hard-shelled almonds in velvety hulls"
        }
      }
    },
    {
      "id": "prunus_avium",
      "scientificName": "Prunus avium",
      "inatTaxonId": 61964,
      "category": "orchard_shrub",
      "leafType": "deciduous",
      "areaHa": 6500,
      "sharePct": null,
      "color": "#f43f5e",
      "icon": "🍒",
      "names": {
        "ru": "Черешня (дикая и садовая черешня Фундана)",
        "pt": "Cerejeira",
        "en": "Sweet Cherry"
      },
      "descriptions": {
        "ru": "Сердце региона Кова-да-Бейра и склонов Серра-да-Гардунья (Фундан). Весной долины утопают в белом цвету (Festa da Cerejeira в апреле), летом радуют сочными ягодами (Cereja do Fundão IGP), а осенью вспыхивают пламенными алыми и золотыми кронами.",
        "pt": "Símbolo maior da Cova da Beira e encostas da Serra da Gardunha (Fundão). Em abril veste as encostas de branco nupcial; no outono transforma os pomares num vibrante mar carmesim e dourado.",
        "en": "Icon of the Cova da Beira valley and slopes of Serra da Gardunha (Fundão). Snowy white blooms blanket the hills in April, yielding renowned Fundão cherries in June and blazing crimson-orange autumn foliage."
      },
      "phenology": {
        "leafOutMonth": 4,
        "floweringMonths": [
          3,
          4
        ],
        "fruitingMonths": [
          5,
          6,
          7
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный. Пышное цветение в конце марта — апреле. Сбор черешни в мае-июле. Осенняя листва приобретает ярчайшие багряные, вишнево-красные и золотистые тона с конца октября по середину ноября.",
          "pt": "Folha caduca. Floração exuberante entre finais de março e abril. Colheita de maio a julho. A folhagem de outono atinge tonalidades de vermelho vivo, carmesim e dourado entre o fim de outubro e meados de novembro.",
          "en": "Deciduous. Bountiful white flowering in late March and April. Fruit harvest May through July. Autumn foliage transforms into striking crimson, cherry-red, and gold hues from late October through mid-November."
        }
      },
      "dgtCosCodes": [
        "5.1.1.8",
        "4.1.1.4",
        "4.2.1.4"
      ],
      "phenomenonDetails": {
        "flowering": {
          "ru": "Белоснежное цветение садов Фундана (март-апрель)",
          "pt": "Manto branco na Cova da Beira",
          "en": "Snowy white cherry blossoms"
        },
        "fruiting": {
          "ru": "Сочная черешня Cereja do Fundão IGP (май-июль)",
          "pt": "Cereja do Fundão IGP sumarenta",
          "en": "Succulent Fundão cherries"
        }
      }
    },
    {
      "id": "ceratonia_siliqua",
      "scientificName": "Ceratonia siliqua",
      "inatTaxonId": 56037,
      "category": "orchard_shrub",
      "leafType": "evergreen",
      "areaHa": 45000,
      "sharePct": 1.4,
      "color": "#854d0e",
      "icon": "🫘",
      "dgtCosCodes": [
        "5.1.1.5"
      ],
      "names": {
        "ru": "Рожковое дерево (альфарробейра)",
        "pt": "Alfarrobeira",
        "en": "Carob Tree"
      },
      "descriptions": {
        "ru": "Вечнозеленое средиземноморское дерево, ключевая порода Баррокала в Алгарви и долины реки Саду. Дает сладкие богатые сахаром стручки (рожки), используемые для производства муки кэроба, ликеров и кондитерских изделий.",
        "pt": "Árvore perenifólia emblemática do Barrocal algarvio e bacia do Sado. Muito resistente à seca, produz as afamadas vagens de alfarroba utilizadas na doçaria tradicional e substituto do cacau.",
        "en": "Classic evergreen tree of the Algarve Barrocal and Sado basin. Thrives in dry limestone terrain, producing sweet nutritious carob pods widely used in gastronomy."
      },
      "phenology": {
        "floweringMonths": [
          9,
          10,
          11
        ],
        "fruitingMonths": [
          7,
          8,
          9,
          10
        ],
        "autumnFoliage": null,
        "phenologyNotes": {
          "ru": "Вечнозеленый. Необычное осеннее цветение: мелкие красноватые цветки распускаются прямо на стволе и толстых ветвях (каулифлория) в сентябре-ноябре.",
          "pt": "Folha perene. Floração caulinar outonal distintiva entre setembro e novembro; maturação das vagens no verão e início de outono.",
          "en": "Evergreen. Distinctive cauliflorous autumn flowering (September-November); dark pods ripen in late summer and early autumn."
        }
      },
      "phenomenonDetails": {
        "flowering": {
          "ru": "Осенние красноватые соцветия на коре (сентябрь-ноябрь)",
          "pt": "Flores avermelhadas caulinares de outono",
          "en": "Reddish cauliflorous autumn blossoms"
        },
        "fruiting": {
          "ru": "Сладкие темно-шоколадные стручки рожкового дерева (июль-октябрь)",
          "pt": "Vagens castanhas doces de alfarroba",
          "en": "Sweet dark brown carob pods"
        }
      }
    },
    {
      "id": "crataegus_monogyna",
      "scientificName": "Crataegus monogyna",
      "inatTaxonId": 56038,
      "category": "orchard_shrub",
      "leafType": "deciduous",
      "cosRole": "associated",
      "areaHa": null,
      "sharePct": null,
      "color": "#b91c1c",
      "icon": "🌺",
      "dgtCosCodes": [
        "5.1.1.3",
        "5.1.1.8"
      ],
      "names": {
        "ru": "Боярышник однопестичный (пильритейру)",
        "pt": "Pilriteiro",
        "en": "Common Hawthorn"
      },
      "descriptions": {
        "ru": "Колючий листопадный кустарник или небольшое дерево, повсеместно встречающееся в подлеске дубрав и на опушках лесов Португалии. Весной покрывается ароматными белыми цветками, а осенью привлекает птиц гроздьями ярко-красных ягод.",
        "pt": "Arbusto ou pequena árvore caducifólia autóctone comum nas orlas e subcoberto dos carvalhais. Floração branca melífera primaveril e bagas vermelhas reluzentes no outono.",
        "en": "Native deciduous spiny shrub or small tree forming hedgerows and forest understorey. Showy fragrant spring blossom followed by brilliant scarlet berries in autumn."
      },
      "phenology": {
        "leafOutMonth": 3,
        "floweringMonths": [
          4,
          5
        ],
        "fruitingMonths": [
          9,
          10,
          11
        ],
        "autumnFoliage": {
          "high_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "yellowing",
            "10.2": "peak_yellow",
            "10.3": "falling",
            "11.1": "fallen",
            "11.2": "fallen",
            "11.3": "fallen"
          },
          "mid_mountain": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "yellowing",
            "10.3": "peak_yellow",
            "11.1": "falling",
            "11.2": "fallen",
            "11.3": "fallen"
          },
          "lowland_coastal": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "yellowing",
            "11.1": "peak_yellow",
            "11.2": "falling",
            "11.3": "fallen"
          },
          "south": {
            "1": "fallen",
            "2": "fallen",
            "12": "fallen",
            "9.3": "green",
            "10.1": "green",
            "10.2": "green",
            "10.3": "green",
            "11.1": "yellowing",
            "11.2": "peak_yellow",
            "11.3": "falling"
          }
        },
        "phenologyNotes": {
          "ru": "Листопадный. Белое цветение в апреле-мае. Алые ягоды (pilritos) густо усыпают кусты с сентября по ноябрь, пока листва окрашивается в оранжевые и желтые тона.",
          "pt": "Folha caduca. Flores brancas em abril-maio. Bagas vermelhas vivas de setembro a novembro, com viragem foliar dourada outonal.",
          "en": "Deciduous. White flowering April-May. Red berries persist from September through November as foliage turns warm golden-amber."
        }
      },
      "phenomenonDetails": {
        "flowering": {
          "ru": "Душистые белые щитковидные цветки (апрель-май)",
          "pt": "Flores brancas aromáticas primaveris",
          "en": "Fragrant white spring corymbs"
        },
        "fruiting": {
          "ru": "Ярко-алые мучнистые ягоды боярышника (сентябрь-ноябрь)",
          "pt": "Pilritos vermelhos brilhantes outonais",
          "en": "Bright scarlet autumn hawthorn berries"
        }
      }
    }
  ],
  "locations": [
    {
      "id": "mata_albergaria",
      "names": {
        "ru": "Реликтовый лес Албергария (Национальный парк Пенеда-Жереш)",
        "pt": "Mata da Albergaria (Parque Nacional da Peneda-Gerês)",
        "en": "Albergaria Ancient Forest (Peneda-Gerês National Park)"
      },
      "lat": 41.7967,
      "lng": -8.1472,
      "radiusKm": 4.5,
      "elevationM": 750,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "quercus_robur",
        "quercus_pyrenaica",
        "betula_celtiberica",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "PNPG / ICNF / Reserva da Biosfera UNESCO Gerês-Xurés",
      "summary": {
        "ru": "Один из наиболее ценных реликтовых дубовых лесов Европы с тысячелетней историей. Через лес проходит римская дорога Geira Romana с древними мильными столбами.",
        "pt": "Uma das matas caducifólias mais bem preservadas da Europa, dominada pelo carvalho-alvarinho. Atravessada pela Geira Romana (Via Nova XVIII) e classificada com Reserva Biogenética do Conselho da Europa.",
        "en": "One of Europe best-preserved temperate ancient deciduous forests, dominated by ancient pedunculate oaks. Crossed by the Roman road Geira Romana with standing milestones."
      },
      "trails": {
        "ru": "Тропа Мата-да-Албергария и Римская дорога Гейра (Миля XXXIV, Портела-ду-Омен)",
        "pt": "Trilho da Mata da Albergaria e Geira Romana (Milha XXXIV a Portela do Homem)",
        "en": "Mata da Albergaria Trail and Roman Geira Road (Milestone XXXIV to Portela do Homem)"
      }
    },
    {
      "id": "rota_faias_manteigas",
      "names": {
        "ru": "Буковый лес Сан-Лоренсу и Тропа буков (Мантейгаш, Серра-да-Эштрела)",
        "pt": "Bosque de São Lourenço e Rota das Faias (Manteigas, Serra da Estrela)",
        "en": "São Lourenço Beech Forest & Rota das Faias (Manteigas, Serra da Estrela)"
      },
      "lat": 40.3872,
      "lng": -7.5381,
      "radiusKm": 3.5,
      "elevationM": 1100,
      "region": "Centro",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "fagus_sylvatica",
        "quercus_pyrenaica",
        "castanea_sativa",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Parque Natural da Serra da Estrela (PNSE) / Município de Manteigas",
      "summary": {
        "ru": "Главная жемчужина золотой осени Португалии. Монументальный буковый лес, высаженный на склонах ледниковой долины реки Зезере. В конце октября и начале ноября образует огненно-медный навес.",
        "pt": "O santuário de outono mais célebre de Portugal. Notável bosque de faias nas encostas do Vale Glaciar do Zêzere, que atinge um deslumbramento de folhas cobreadas e douradas entre o final de outubro e início de novembro.",
        "en": "Portugal most iconic autumn destination. Monumental beech grove planted on the slopes of the Zêzere Glacial Valley, transforming into a fiery copper-amber cathedral from late October to early November."
      },
      "trails": {
        "ru": "PR13 MTG — Rota das Faias (Тропа буков) и Capela de São Lourenço",
        "pt": "PR13 MTG — Rota das Faias e Capela de São Lourenço",
        "en": "PR13 MTG — Rota das Faias (Beech Trail) & Chapel of São Lourenço"
      }
    },
    {
      "id": "soutos_montesinho",
      "names": {
        "ru": "Каштановые рощи Виньяйш и Парк Монтезинью (Траз-уж-Монтиш)",
        "pt": "Soutos de Vinhais e Parque Natural de Montesinho (Trás-os-Montes)",
        "en": "Vinhais Chestnut Groves & Montesinho Natural Park (Trás-os-Montes)"
      },
      "lat": 41.8344,
      "lng": -7.0019,
      "radiusKm": 6,
      "elevationM": 880,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "castanea_sativa",
        "quercus_pyrenaica",
        "betula_celtiberica",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Parque Natural de Montesinho / ICNF / Rota da Castanha de Vinhais",
      "summary": {
        "ru": "Мировая столица каштанов. Бескрайние вековые каштановые рощи (soutos), производящие высококачественные каштаны DOP. В октябре и ноябре окрашиваются в насыщенные золотые тона.",
        "pt": "Coração da maior mancha contínua de castanheiros da Península Ibérica. Soutos ancestrais produtores de castanha DOP Judia e Longal, rodeados por carvalhais de negral de enorme valor ecológico.",
        "en": "Capital of Portuguese chestnuts and home to extensive historic sweet chestnut groves (soutos). Spectacular gold and bronze canopy during October harvest and November Magusto celebrations."
      },
      "trails": {
        "ru": "PR1 VNH — Rota dos Soutos e Trilho de Montesinho",
        "pt": "PR1 VNH — Rota dos Soutos e Trilho de Montesinho",
        "en": "PR1 VNH — Rota dos Soutos & Montesinho Historic Trail"
      }
    },
    {
      "id": "mata_bucaco",
      "names": {
        "ru": "Национальный лес Бусаку (Лузу, Меальяда)",
        "pt": "Mata Nacional do Buçaco (Luso, Mealhada)",
        "en": "Buçaco National Forest (Luso, Mealhada)"
      },
      "lat": 40.3758,
      "lng": -8.3653,
      "radiusKm": 2,
      "elevationM": 540,
      "region": "Centro",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "orchard_shrub"
      ],
      "speciesIds": [
        "quercus_robur",
        "quercus_faginea",
        "castanea_sativa",
        "fagus_sylvatica",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Fundação Mata do Buçaco / ICNF",
      "summary": {
        "ru": "Уникальный ботанический дендропарк, огороженный монахами-кармелитами в 1628 году. Насчитывает более 250 видов экзотических и аборигенных деревьев, включая гигантские кедры, папоротники и дубравы.",
        "pt": "Património botânico excecional murado pelos Carmelitas Descalços no século XVII. Alberga carvalhais seculares, cedros monumentais, faias e o célebre Vale dos Fetos.",
        "en": "Extraordinary botanical arboretum walled by Discalced Carmelites in 1628. Home to over 250 exotic and native tree species, ancient oak groves, and the famous Fern Valley."
      },
      "trails": {
        "ru": "Trilho da Via Sacra, Trilho dos Fetos e Vale dos Abetos",
        "pt": "Trilho da Via Sacra, Trilho dos Fetos e Vale dos Abetos",
        "en": "Via Sacra Trail, Fern Valley Trail & Fir Valley Path"
      }
    },
    {
      "id": "serra_lousa",
      "names": {
        "ru": "Серра-да-Лоузан и Сланцевые деревни (Кандал, Сердейра)",
        "pt": "Serra da Lousã e Aldeias do Xisto (Candal, Cerdeira)",
        "en": "Serra da Lousã & Schist Villages (Candal, Cerdeira)"
      },
      "lat": 40.0931,
      "lng": -8.2325,
      "radiusKm": 5,
      "elevationM": 850,
      "region": "Centro",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "orchard_shrub"
      ],
      "speciesIds": [
        "castanea_sativa",
        "quercus_pyrenaica",
        "quercus_robur",
        "pinus_pinaster",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Rede das Aldeias do Xisto / ICNF Serra da Lousã",
      "summary": {
        "ru": "Густые дубовые и каштановые леса, окружающие живописные каменные сланцевые деревни. Место обитания крупнейшей популяции благородных оленей в Португалии.",
        "pt": "Maciço serrano repleto de soutos de castanheiros e carvalhais autóctones, acolhendo a maior população de veados e corços de Portugal e as emblemáticas Aldeias do Xisto.",
        "en": "Mountain range laced with sweet chestnut woods and native oak forests, sheltering Portugal largest wild red deer population around preserved Schist Villages."
      },
      "trails": {
        "ru": "PR2 LSA — Rota das Aldeias do Xisto da Lousã (Candal — Cerdeira)",
        "pt": "PR2 LSA — Rota das Aldeias do Xisto da Lousã (Candal — Cerdeira)",
        "en": "PR2 LSA — Schist Villages Trail of Lousã (Candal — Cerdeira)"
      }
    },
    {
      "id": "pinhal_leiria",
      "names": {
        "ru": "Королевский бор Лейрии / Мата-Насьонал-де-Лейрия (Маринья-Гранде)",
        "pt": "Mata Nacional de Leiria / Pinhal do Rei (Marinha Grande)",
        "en": "Leiria Royal Pine Forest (Marinha Grande)"
      },
      "lat": 39.8167,
      "lng": -8.9667,
      "radiusKm": 7,
      "elevationM": 60,
      "region": "Centro",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "pine",
      "categories": [
        "pine"
      ],
      "speciesIds": [
        "pinus_pinaster",
        "pinus_pinea",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 3,
      "sourceRef": "ICNF — Mata Nacional de Leiria / Município da Marinha Grande",
      "summary": {
        "ru": "Старейший искусственный сосновый лес Португалии, заложенный королем Афонсу III и расширенный Динишем I в XIII веке для укрепления дюн и строительства каравелл.",
        "pt": "Pinhal histórico de 11.000 hectares ordenado por D. Dinis no século XIII. Protegeu os campos agrícolas do avanço das dunas litorais e forneceu madeira para a epopeia marítima.",
        "en": "Historic 11,000-hectare coastal pine forest planted by King Dinis in the 13th century to stabilize sand dunes and supply timber for exploration fleets."
      },
      "trails": {
        "ru": "PR1 MGR — Trilho da Floresta e Dunas / Ciclovia da Estrada Atlântica",
        "pt": "PR1 MGR — Trilho da Floresta e Dunas / Ciclovia da Estrada Atlântica",
        "en": "PR1 MGR — Forest and Dunes Path / Atlantic Coastal Cycleway"
      }
    },
    {
      "id": "montado_coruche",
      "names": {
        "ru": "Монтадо Коруше и Долина реки Соррайя (Рибатежу)",
        "pt": "Montado de Coruche e Vale do Sorraia (Ribatejo)",
        "en": "Coruche Cork Montado & Sorraia Valley (Ribatejo)"
      },
      "lat": 38.9608,
      "lng": -8.5283,
      "radiusKm": 8,
      "elevationM": 110,
      "region": "Alentejo",
      "autumnTimingZone": "south",
      "dominantCategory": "montado",
      "categories": [
        "montado",
        "pine"
      ],
      "speciesIds": [
        "quercus_suber",
        "pinus_pinea",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 3,
      "sourceRef": "Observatório do Sobreiro e da Cortiça / Município de Coruche",
      "summary": {
        "ru": "Мировая столица пробкового дуба. Непрерывный массив пробкового монтадо, где производятся миллионы натуральных винных пробок высшего качества.",
        "pt": "Capital Mundial da Cortiça. Vasto ecossistema de montado de sobro gerido de forma sustentável, centro nevrálgico da extração de cortiça e preservação do lince-ibérico.",
        "en": "World Capital of Cork. Vast sustainably managed cork oak savannah (montado), central hub of natural wine cork production and biodiversity conservation."
      },
      "trails": {
        "ru": "PR1 CCH — Rota dos Montados e Charneca Ribatejana",
        "pt": "PR1 CCH — Rota dos Montados e Charneca Ribatejana",
        "en": "PR1 CCH — Cork Montado and Ribatejo Heathland Trail"
      }
    },
    {
      "id": "montado_grandola",
      "names": {
        "ru": "Монтадо Серра-де-Грандола и Побережье Алентежу",
        "pt": "Montado da Serra de Grândola e Litoral Alentejano",
        "en": "Grândola Range Cork Montado & Alentejo Coast"
      },
      "lat": 38.1633,
      "lng": -8.5833,
      "radiusKm": 6.5,
      "elevationM": 230,
      "region": "Alentejo",
      "autumnTimingZone": "south",
      "dominantCategory": "montado",
      "categories": [
        "montado",
        "pine",
        "orchard_shrub"
      ],
      "speciesIds": [
        "quercus_suber",
        "pinus_pinea",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 3,
      "sourceRef": "Município de Grândola / ICNF Alentejo Litoral",
      "summary": {
        "ru": "Приморский пробковый монтадо на гранитных холмах Серра-де-Грандола с богатым подлеском из земляничного дерева и вереска.",
        "pt": "Montado atlântico de sobreiro sobre solos xistosos e arenosos com abundante sub-bosque de medronheiro, urze e esteva.",
        "en": "Atlantic cork oak montado perched on the Grândola hills with a dense understory of strawberry trees, heather, and cistus."
      },
      "trails": {
        "ru": "PR1 GDL — Rota da Serra e Rota dos Sobreiros",
        "pt": "PR1 GDL — Rota da Serra e Rota dos Sobreiros",
        "en": "PR1 GDL — Mountain Trail and Ancient Cork Oak Walk"
      }
    },
    {
      "id": "serra_sao_mamede",
      "names": {
        "ru": "Природный парк Серра-де-Сан-Мамеде и Марван (Северный Алентежу)",
        "pt": "Parque Natural da Serra de São Mamede e Marvão (Alto Alentejo)",
        "en": "Serra de São Mamede Natural Park & Marvão (Upper Alentejo)"
      },
      "lat": 39.3942,
      "lng": -7.3481,
      "radiusKm": 5.5,
      "elevationM": 860,
      "region": "Alentejo",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "montado"
      ],
      "speciesIds": [
        "castanea_sativa",
        "quercus_pyrenaica",
        "quercus_suber",
        "quercus_rotundifolia"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Parque Natural da Serra de São Mamede (PNSSM) / ICNF",
      "summary": {
        "ru": "Удивительный горный оазис среди равнин Алентежу. Здесь сходятся пиренейские дубы, каштановые рощи Марвана и средиземноморский пробковый монтадо.",
        "pt": "Ilha botânica de transição biogeográfica no Alto Alentejo. Alberga frondosos soutos de castanheiros medievais aos pés de Marvão e bosques de carvalho-negral.",
        "en": "Botanical mountain oasis rising above the Alentejo plains. Features medieval chestnut groves around the clifftop fortress of Marvão and rich pyrenean oak woodlands."
      },
      "trails": {
        "ru": "PR1 MRV — Trilho dos Soutos e Calçadas Medievais de Marvão",
        "pt": "PR1 MRV — Trilho dos Soutos e Calçadas Medievais de Marvão",
        "en": "PR1 MRV — Chestnut Groves & Medieval Paved Trails of Marvão"
      }
    },
    {
      "id": "serra_monchique",
      "names": {
        "ru": "Серра-де-Моншике и Пик Фоя (Горный Алгарве)",
        "pt": "Serra de Monchique e Pico da Fóia (Algarve Montano)",
        "en": "Serra de Monchique & Fóia Peak (Upland Algarve)"
      },
      "lat": 37.3167,
      "lng": -8.5583,
      "radiusKm": 6,
      "elevationM": 902,
      "region": "Algarve",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "orchard_shrub",
      "categories": [
        "orchard_shrub",
        "montado",
        "eucalyptus"
      ],
      "speciesIds": [
        "arbutus_unedo",
        "quercus_suber",
        "castanea_sativa",
        "eucalyptus_globulus"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Município de Monchique / ICNF Algarve",
      "summary": {
        "ru": "«Зеленые легкие» Алгарве с субтропическим микроклиматом. Главный мировой центр земляничного дерева (medronheiro), где осенью плоды созревают одновременно с цветением.",
        "pt": "Jardim botânico natural do Algarve com microclima húmido. Capital indiscutível do medronheiro e da produção artesanal da aguardente de medronho.",
        "en": "The lush green mountain crown of the Algarve with a moist subtropical microclimate. Prime sanctuary for the strawberry tree, blooming and fruiting together in autumn."
      },
      "trails": {
        "ru": "PR3 MCQ — Trilho das Cascatas e Rota dos Medronheiros da Fóia",
        "pt": "PR3 MCQ — Trilho das Cascatas e Rota dos Medronheiros da Fóia",
        "en": "PR3 MCQ — Waterfalls Trail and Fóia Strawberry Tree Route"
      }
    },
    {
      "id": "pomares_fundao",
      "names": {
        "ru": "Сады черешни Фундана и Склоны Серра-да-Гардунья",
        "pt": "Pomares de Cerejeiras do Fundão e Encostas da Gardunha",
        "en": "Fundão Cherry Orchards & Slopes of Serra da Gardunha"
      },
      "lat": 40.1389,
      "lng": -7.5014,
      "radiusKm": 5,
      "elevationM": 580,
      "region": "Centro",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "bloom_orchard",
      "categories": [
        "bloom_orchard",
        "deciduous"
      ],
      "speciesIds": [
        "prunus_avium",
        "castanea_sativa",
        "quercus_pyrenaica",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Município do Fundão / Rota da Cereja",
      "summary": {
        "ru": "Крупнейший массив черешневых садов Португалии. В апреле склоны ослепляют белым цветением, а в конце октября и ноябре переливаются огненными вишнево-красными и золотыми красками.",
        "pt": "O berço da famosa Cereja do Fundão IGP. Proporciona um duplo espetáculo sazonal: o manto branco nupcial da floração em abril e um arrebatador mar carmesim e dourado em novembro.",
        "en": "The heartland of famous Fundão cherries. Delivers two spectacular natural seasons: pure white blossoms in April and intense fiery red-gold autumn foliage in late autumn."
      },
      "trails": {
        "ru": "Rota da Cereja do Fundão e PR1 FND — Rota da Gardunha",
        "pt": "Rota da Cereja do Fundão e PR1 FND — Rota da Gardunha",
        "en": "Fundão Cherry Route & PR1 FND — Gardunha Ridge Trail"
      }
    },
    {
      "id": "amendoeiras_foz_coa",
      "names": {
        "ru": "Тропа цветущего миндаля (Вила-Нова-де-Фош-Коа и Дору-Супериор)",
        "pt": "Rota das Amendoeiras em Flor (Vila Nova de Foz Côa e Douro Superior)",
        "en": "Almond Blossom Route (Vila Nova de Foz Côa & Upper Douro)"
      },
      "lat": 41.0825,
      "lng": -7.1361,
      "radiusKm": 7,
      "elevationM": 380,
      "region": "Norte",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "bloom_orchard",
      "categories": [
        "bloom_orchard",
        "montado"
      ],
      "speciesIds": [
        "prunus_dulcis",
        "quercus_rotundifolia",
        "quercus_suber"
      ],
      "autumnWalkRating": 3,
      "sourceRef": "Parque Arqueológico do Vale do Côa / Rota do Douro",
      "summary": {
        "ru": "Живописные террасы Дору и долины Коа, всемирно известные наскальными рисунками палеолита и бурным цветением миндаля в феврале-марте.",
        "pt": "Paisagem duriense e do vale do Côa classificada pela UNESCO. Em fevereiro e março explode no espetáculo das amendoeiras em flor; no outono as folhas vestem-se de ocre.",
        "en": "UNESCO World Heritage Douro and Côa valleys. Erupts in sea of pink-white almond blossoms during February and March, transitioning to warm ochre in late autumn."
      },
      "trails": {
        "ru": "Rota das Amendoeiras em Flor e Trilho dos Castelos do Côa",
        "pt": "Rota das Amendoeiras em Flor e Trilho dos Castelos do Côa",
        "en": "Almond Blossom Scenic Route & Côa Castles Path"
      }
    },
    {
      "id": "caldeirao_medronho",
      "names": {
        "ru": "Серра-ду-Калдейран и Барранку-ду-Велью (Алгарве)",
        "pt": "Mata da Serra do Caldeirão e Barranco do Velho (Algarve)",
        "en": "Serra do Caldeirão Forest & Barranco do Velho (Algarve)"
      },
      "lat": 37.2361,
      "lng": -7.9431,
      "radiusKm": 5,
      "elevationM": 490,
      "region": "Algarve",
      "autumnTimingZone": "south",
      "dominantCategory": "orchard_shrub",
      "categories": [
        "orchard_shrub",
        "montado"
      ],
      "speciesIds": [
        "arbutus_unedo",
        "quercus_suber",
        "quercus_rotundifolia",
        "pinus_pinea"
      ],
      "autumnWalkRating": 3,
      "sourceRef": "Associação dos Produtores de Medronho / ICNF Algarve",
      "summary": {
        "ru": "Традиционный центр сбора земляничного дерева в горах Калдейран. Осенью здесь пахнет цветущими колокольчиками земляничника и сладкой зрелой ягодой.",
        "pt": "Ponto fulcral da bacia do medronho algarvio em Barranco do Velho. No outono a serra enche-se de vida com a colheita dos frutos vermelhos para as destilarias tradicionais.",
        "en": "Traditional heart of wild strawberry tree harvesting in the Caldeirão hills. Autumn brings simultaneous floral displays and fruit harvests for copper pot distilleries."
      },
      "trails": {
        "ru": "PR2 SBA — Rota das Fontes e Medronheiros do Caldeirão",
        "pt": "PR2 SBA — Rota das Fontes e Medronheiros do Caldeirão",
        "en": "PR2 SBA — Caldeirão Springs & Strawberry Tree Route"
      }
    },
    {
      "id": "pinhal_alcacer",
      "names": {
        "ru": "Сосновый массив Алкасер-ду-Сал и Компорта (Бассейн реки Саду)",
        "pt": "Pinhal de Pinheiro-Manso de Alcácer do Sal e Comporta",
        "en": "Stone Pine Forests of Alcácer do Sal & Comporta"
      },
      "lat": 38.3833,
      "lng": -8.65,
      "radiusKm": 9,
      "elevationM": 70,
      "region": "Alentejo",
      "autumnTimingZone": "south",
      "dominantCategory": "pine",
      "categories": [
        "pine",
        "montado"
      ],
      "speciesIds": [
        "pinus_pinea",
        "quercus_suber",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 2,
      "sourceRef": "ICNF Alentejo / UNAC — União da Floresta Mediterrânica",
      "summary": {
        "ru": "Крупнейший в Европе сплошной массив средиземноморской итальянской сосны (pinheiro-manso). Зимой здесь кипит лицензированный сбор ценных шишек с кедровыми орехами.",
        "pt": "A maior mancha contínua de pinheiro-manso do mundo. Solo arenoso ideal que produz o afamado pinhão alentejano, cuja apanha decorre no inverno de dezembro a março.",
        "en": "The world largest contiguous stone pine forest. Set upon coastal sandy soils producing prized white pine nuts (pinhão), actively harvested from December through March."
      },
      "trails": {
        "ru": "Percurso do Pinhal e Arrozais do Vale do Sado",
        "pt": "Percurso do Pinhal e Arrozais do Vale do Sado",
        "en": "Sado Valley Pine Woods & Rice Fields Walk"
      }
    },
    {
      "id": "eucaliptal_agueda",
      "names": {
        "ru": "Лесопромышленный бассейн Агеда и Албергария-а-Велья (Бейра-Литорал)",
        "pt": "Bacia Florestal de Eucaliptal de Águeda e Albergaria-a-Velha",
        "en": "Águeda & Albergaria Commercial Eucalyptus Basin"
      },
      "lat": 40.575,
      "lng": -8.4417,
      "radiusKm": 8,
      "elevationM": 140,
      "region": "Centro",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "eucalyptus",
      "categories": [
        "eucalyptus",
        "pine"
      ],
      "speciesIds": [
        "eucalyptus_globulus",
        "pinus_pinaster",
        "quercus_robur"
      ],
      "autumnWalkRating": 1,
      "sourceRef": "DGT COS 2025v1 / ICNF Centro / Indústria Celulose",
      "summary": {
        "ru": "Интенсивный лесохозяйственный бассейн эвкалипта на северо-западе Центральной Португалии. Зимой эвкалипты цветут кремовыми цветами, привлекая пасечников.",
        "pt": "Coração da bacia silvícola de eucalipto em Portugal. Floresta de produção intensiva para a indústria papeleira; floração invernal com grande relevância apícola.",
        "en": "Epicentre of intensive commercial eucalyptus forestry in Portugal. Highly productive timber basin with extensive winter blooms crucial for seasonal honey production."
      },
      "trails": {
        "ru": "PR3 AGD — Trilho das Levadas do Vouga e Parque Fluvial do Alfusqueiro",
        "pt": "PR3 AGD — Trilho das Levadas do Vouga e Parque Fluvial do Alfusqueiro",
        "en": "PR3 AGD — Vouga Canals Trail & Alfusqueiro River Park"
      }
    },
    {
      "id": "lapa_dinheiros",
      "names": {
        "ru": "Каштановый лес Лапа-душ-Диньейруш и Ущелье Каниса (Сейя, Серра-да-Эштрела)",
        "pt": "Souto da Lapa dos Dinheiros e Caniçal (Seia, Serra da Estrela)",
        "en": "Lapa dos Dinheiros Ancient Chestnuts (Seia, Serra da Estrela)"
      },
      "lat": 40.3833,
      "lng": -7.7,
      "radiusKm": 3,
      "elevationM": 950,
      "region": "Centro",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "castanea_sativa",
        "quercus_pyrenaica",
        "betula_celtiberica"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Parque Natural da Serra da Estrela (PNSE) / Município de Seia",
      "summary": {
        "ru": "Завораживающий вековой каштановый лес над горной рекой Каниса на западных склонах Серра-да-Эштрела. В октябре здесь царит буйство золотой листвы и созревают каштаны.",
        "pt": "Souto secular mágico sobranceiro à ribeira da Caniça na vertente ocidental da Serra da Estrela. Destaque para as quedas de água e folhagem outonal densa.",
        "en": "Magical ancient sweet chestnut grove overlooking the Caniça river gorge on the western slopes of Serra da Estrela. Rich waterfalls and dense golden autumn canopy."
      },
      "trails": {
        "ru": "PR10 SEI — Rota da Caniça e Praia Fluvial da Lapa dos Dinheiros",
        "pt": "PR10 SEI — Rota da Caniça e Praia Fluvial da Lapa dos Dinheiros",
        "en": "PR10 SEI — Caniça River Trail & Lapa dos Dinheiros River Beach"
      }
    },
    {
      "id": "serra_sintra",
      "names": {
        "ru": "Природный парк Серра-де-Синтра (Пенинья и Монастырь капуцинов)",
        "pt": "Parque Natural da Serra de Sintra (Mata da Peninha e Capuchos)",
        "en": "Serra de Sintra Natural Park (Peninha Woods & Capuchos)"
      },
      "lat": 38.7833,
      "lng": -9.4333,
      "radiusKm": 4,
      "elevationM": 450,
      "region": "Lisboa e Vale do Tejo",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "montado",
        "pine"
      ],
      "speciesIds": [
        "quercus_robur",
        "quercus_faginea",
        "castanea_sativa",
        "pinus_pinaster",
        "quercus_suber"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Parque Natural de Sintra-Cascais (PNSC) / Parques de Sintra",
      "summary": {
        "ru": "Таинственный туманный лес на гранитном кряже Синтры. Атлантические туманы создают микроклимат с папоротниками, мхами, вековыми дубами и каштанами.",
        "pt": "Mata mística envolta em nevoeiros atlânticos constantes. Alberga uma mistura rara de espécies caducifólias com carvalhais de carvalho-alvarinho e cerquinho.",
        "en": "Enchanting misty woodland thriving on the granite ridges of Sintra. Atlantic fogs nurture rare temperate broadleaf canopies adorned with mosses and lichens."
      },
      "trails": {
        "ru": "PR2 SNT — Rota do Convento dos Capuchos e Peninha",
        "pt": "PR2 SNT — Rota do Convento dos Capuchos e Peninha",
        "en": "PR2 SNT — Capuchos Convent & Peninha Ridge Trail"
      }
    },
    {
      "id": "pitoes_junias",
      "names": {
        "ru": "Лес Баррозу и Питойнш-даш-Жуньяш (Монталегри, Жереш)",
        "pt": "Mata de Barroso e Pitões das Júnias (Montalegre, Gerês Transmontano)",
        "en": "Barroso High Woods & Pitões das Júnias (Montalegre, Gerês)"
      },
      "lat": 41.8333,
      "lng": -7.95,
      "radiusKm": 4.5,
      "elevationM": 1050,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "quercus_pyrenaica",
        "betula_celtiberica",
        "castanea_sativa",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Parque Nacional da Peneda-Gerês / Património Agrícola Mundial FAO Barroso",
      "summary": {
        "ru": "Суровое высокогорье Жереша с древней средневековой деревней Питойнш-даш-Жуньяш, монастырем XII века и чистейшими дубравами из пиренейского дуба.",
        "pt": "Paisagem protegida de montanha no Barroso (reconhecido pela FAO). Encostas com carvalhais de negral e bétulas em redor do Mosteiro de Santa Maria das Júnias.",
        "en": "High-altitude mountain wilderness in Barroso (FAO World Agricultural Heritage). Slopes clad in pyrenean oaks and birches surrounding the 12th-century ruined monastery."
      },
      "trails": {
        "ru": "PR3 MTR — Trilho de Pitões das Júnias, Cascata e Mosteiro",
        "pt": "PR3 MTR — Trilho de Pitões das Júnias, Cascata e Mosteiro",
        "en": "PR3 MTR — Pitões das Júnias Waterfall & Monastery Trail"
      }
    },
    {
      "id": "aire_candeeiros",
      "names": {
        "ru": "Дубравы Серрас-де-Айре-и-Кандеэйруш (Форнеа и Шош-де-Фену)",
        "pt": "Carvalhais das Serras de Aire e Candeeiros (Fórnea e Chós-de-Feno)",
        "en": "Aire & Candeeiros Oak Woodlands (Fórnea Amphitheatre)"
      },
      "lat": 39.55,
      "lng": -8.8167,
      "radiusKm": 4.5,
      "elevationM": 520,
      "region": "Centro",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "montado",
        "orchard_shrub"
      ],
      "speciesIds": [
        "quercus_faginea",
        "quercus_rotundifolia",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 3,
      "sourceRef": "Parque Natural das Serras de Aire e Candeeiros (PNSAC)",
      "summary": {
        "ru": "Известняковый карстовый ландшафт со знаменитым природным амфитеатром Форнеа. Здесь сохраняются лучшие в Португалии заросли португальского дуба (carvalho-cerquinho).",
        "pt": "Maciço calcário emblemático que abriga os povoamentos mais representativos de carvalho-cerquinho do país, com destaque para a impressionante depressão cárstica da Fórnea.",
        "en": "Karst limestone massif preserving Portugal most characteristic Portuguese oak (cerquinho) woodlands, punctuated by the dramatic natural amphitheatre of Fórnea."
      },
      "trails": {
        "ru": "PR1 PMS — Rota da Fórnea e Chós-de-Feno",
        "pt": "PR1 PMS — Rota da Fórnea e Chós-de-Feno",
        "en": "PR1 PMS — Fórnea Amphitheatre & Chós-de-Feno Path"
      }
    },
    {
      "id": "serra_d_ossa",
      "names": {
        "ru": "Монтадо Серра-д’Осса (Редонду и Эштремош, Центральный Алентежу)",
        "pt": "Montado da Serra d'Ossa (Redondo e Estremoz, Alentejo Central)",
        "en": "Serra d'Ossa Montado (Redondo & Estremoz, Central Alentejo)"
      },
      "lat": 38.7333,
      "lng": -7.5667,
      "radiusKm": 5,
      "elevationM": 650,
      "region": "Alentejo",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "montado",
      "categories": [
        "montado",
        "orchard_shrub"
      ],
      "speciesIds": [
        "quercus_rotundifolia",
        "quercus_suber",
        "arbutus_unedo",
        "eucalyptus_globulus"
      ],
      "autumnWalkRating": 3,
      "sourceRef": "Município do Redondo / Rota da Serra d'Ossa",
      "summary": {
        "ru": "Горный хребет в сердце Алентежу, поднимающийся до 650 метров. Лесистые склоны с каменным и пробковым дубом и новыми деревянными эко-мостками (passadiços).",
        "pt": "Elevação orográfica no coração da planície alentejana, coberta por montado denso de azinho e sobro e pontuada pelos Passadiços da Serra d'Ossa.",
        "en": "Mountain ridge rising above the central Alentejo plains, carpeted with holm and cork oak montado and linked by scenic wooden cliffside walkways (Passadiços)."
      },
      "trails": {
        "ru": "PR1 RDD — Percurso da Serra d'Ossa e Passadiços da Aldeia da Serra",
        "pt": "PR1 RDD — Percurso da Serra d'Ossa e Passadiços da Aldeia da Serra",
        "en": "PR1 RDD — Serra d'Ossa Circuit & Aldeia da Serra Walkways"
      }
    },
    {
      "id": "mata_margaraca",
      "names": {
        "ru": "Реликтовый лес Маргараса и Водопад Фрага-да-Пена (Серра-ду-Асор)",
        "pt": "Mata da Margaraça e Fraga da Pena (Serra do Açor, Arganil)",
        "en": "Margaraça Relic Forest & Fraga da Pena (Serra do Açor, Arganil)"
      },
      "lat": 40.2167,
      "lng": -7.9167,
      "radiusKm": 3,
      "elevationM": 680,
      "region": "Centro",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "orchard_shrub"
      ],
      "speciesIds": [
        "quercus_robur",
        "castanea_sativa",
        "arbutus_unedo",
        "betula_celtiberica"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Área de Paisagem Protegida da Serra do Açor / ICNF",
      "summary": {
        "ru": "Один из редчайших сохранившихся фрагментов первобытного широколиственного леса Центральной Португалии. Водопад Фрага-да-Пена падает среди вековых дубов и каштанов.",
        "pt": "Classificada como Reserva Bio-Genética pelo Conselho da Europa. Joia botânica que preserva a vegetação climácica original da Beira com carvalhos, castanheiros e o raro azereiro.",
        "en": "Council of Europe Biogenetic Reserve and prime remnant of the ancient climax broadleaf forest of Central Portugal. Crystalline waterfalls cascade beneath giant chestnuts and oaks."
      },
      "trails": {
        "ru": "PR3 AGN — Trilho da Mata da Margaraça e Fraga da Pena",
        "pt": "PR3 AGN — Trilho da Mata da Margaraça e Fraga da Pena",
        "en": "PR3 AGN — Margaraça Forest Sanctuary & Fraga da Pena Trail"
      }
    },
    {
      "id": "serra_padrela",
      "names": {
        "ru": "Каштановый бор Серра-да-Падрела (Валпасуш и Вила-Поука-де-Агиар)",
        "pt": "Soutos da Serra da Padrela (Valpaços e Vila Pouca de Aguiar)",
        "en": "Serra da Padrela Chestnut Forest (Valpaços & Vila Pouca de Aguiar)"
      },
      "lat": 41.5667,
      "lng": -7.5833,
      "radiusKm": 5.5,
      "elevationM": 920,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "pine"
      ],
      "speciesIds": [
        "castanea_sativa",
        "quercus_pyrenaica",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "DOP Castanha da Padrela / Município de Valpaços",
      "summary": {
        "ru": "Крупнейший сплошной массив сортовых каштанов сорта Judia в Европе. Осенью весь горный хребет переливается теплыми золотисто-желтыми тонами.",
        "pt": "Maior mancha contínua de castanheiros da Europa dedicada à castanha de Denominação de Origem Protegida (DOP Padrela). Vista panorâmica e cores douradas intensas em outubro.",
        "en": "Largest contiguous sweet chestnut forest in Europe producing certified PDO Padrela chestnuts. Panoramic mountain range illuminated in luminous gold throughout October."
      },
      "trails": {
        "ru": "Rota dos Castanheiros da Serra da Padrela e Rota da Castanha Judia",
        "pt": "Rota dos Castanheiros da Serra da Padrela e Rota da Castanha Judia",
        "en": "Serra da Padrela Chestnut Trail & Judia Chestnut Heritage Route"
      }
    },
    {
      "id": "parque_arrabida",
      "names": {
        "ru": "Природный парк Аррабида (Сетубал & Сезимбра)",
        "pt": "Parque Natural da Arrábida (Mata do Solitário & Mata do Vidal)",
        "en": "Arrábida Natural Park (Solitário & Vidal Relict Forests)"
      },
      "lat": 38.4872,
      "lng": -8.9833,
      "radiusKm": 4,
      "elevationM": 380,
      "region": "AML",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "montado",
      "categories": [
        "montado",
        "orchard_shrub"
      ],
      "speciesIds": [
        "quercus_suber",
        "quercus_faginea",
        "arbutus_unedo",
        "ceratonia_siliqua"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "PN Arrábida / ICNF",
      "summary": {
        "ru": "Реликтовый средиземноморский лес над лазурным океаном. Уникальный первозданный маквис с земляничником, рожковым деревом и португальским дубом.",
        "pt": "Mata mediterrânica relíquia única sobre as escarpas calcárias do Atlântico. Alberga medronheiros centenários, carvalho-cerquinho e carvalhais virgens.",
        "en": "Relict Mediterranean primeval forest on ocean limestone cliffs. Preserves pristine maquis with ancient strawberry trees, carob and Portuguese oak."
      },
      "trails": {
        "ru": "PR1 SSB — Trilho das Faias da Arrábida e Mata do Solitário",
        "pt": "PR1 SSB — Trilho da Mata do Solitário e Convento da Arrábida",
        "en": "Solitário Primeval Forest Trail & Arrábida Convent Path"
      }
    },
    {
      "id": "serra_alvao",
      "names": {
        "ru": "Природный парк Алван (Физгаш-ду-Эрмелу, Мондин-ди-Башту)",
        "pt": "Parque Natural do Alvão (Fisgas de Ermelo e Vale do Olo)",
        "en": "Alvão Natural Park (Fisgas de Ermelo & Olo Valley)"
      },
      "lat": 41.3653,
      "lng": -7.8214,
      "radiusKm": 5,
      "elevationM": 850,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "pine"
      ],
      "speciesIds": [
        "quercus_pyrenaica",
        "betula_celtiberica",
        "pinus_pinaster",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "PN Alvão / ICNF",
      "summary": {
        "ru": "Живописное гранитное высокогорье со знаменитыми водопадами Физгаш-ду-Эрмелу. Дубравы пиренейского дуба и березовые рощи окрашиваются в яркое золото в октябре.",
        "pt": "Paisagem granítica dramática com as maiores cascatas de Portugal. Carvalhais de negral e bétulas com tons outonais cintilantes em outubro.",
        "en": "Dramatic mountain park featuring Portugal highest waterfalls. Pyrenean oak forests and birch groves illuminated in golden hues in October."
      },
      "trails": {
        "ru": "PR3 MDB — Trilho das Fisgas de Ermelo e Rota das Bétulas",
        "pt": "PR3 MDB — Trilho das Fisgas de Ermelo e Vale do Olo",
        "en": "PR3 MDB — Fisgas de Ermelo Waterfalls & Birch Woods"
      }
    },
    {
      "id": "serra_marao",
      "names": {
        "ru": "Серра-ду-Маран (Амаранти & Байан)",
        "pt": "Serra do Marão (Carvalhais de Baião e Amarante)",
        "en": "Serra do Marão (Baião & Amarante Oakwoods)"
      },
      "lat": 41.2581,
      "lng": -7.925,
      "radiusKm": 6,
      "elevationM": 1050,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "quercus_robur",
        "quercus_pyrenaica",
        "castanea_sativa",
        "betula_celtiberica"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Município de Baião / ICNF",
      "summary": {
        "ru": "Монументальный горный рубеж между Дору и Минью. Старинные каштановые рощи и дубравы черешчатого дуба на склонах рек Овела и Тейшейра.",
        "pt": "Maciço imponente divisor do Douro e Minho. Soutos seculares e densos carvalhais caducifólios nas encostas do Teixeira e Ovelha.",
        "en": "Imposing mountain barrier between the Douro and Minho. Ancient sweet chestnut groves and lush pedunculate oak slopes."
      },
      "trails": {
        "ru": "PR1 BAO — Caminho do Marão e Rota dos Carvalhos",
        "pt": "PR1 BAO — Caminho do Marão e Rota dos Carvalhos",
        "en": "PR1 BAO — Marão Crest Trail & Ancient Oak Path"
      }
    },
    {
      "id": "soajo_gavieira",
      "names": {
        "ru": "Серра-ду-Суажу и Мезиу (Жереш-Шарес)",
        "pt": "Serra do Soajo e Mezio (Parque Nacional da Peneda-Gerês)",
        "en": "Soajo & Mezio Ancient Oakwoods (Peneda-Gerês)"
      },
      "lat": 41.8744,
      "lng": -8.2611,
      "radiusKm": 5.5,
      "elevationM": 800,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "quercus_robur",
        "quercus_pyrenaica",
        "betula_celtiberica",
        "crataegus_monogyna"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Porta do Mezio / PNPG",
      "summary": {
        "ru": "Западный форпост парка Пенеда-Жереш со знаменитыми каменными амбарами-эшпигейруш в Суажу. Первозданные дубравы и боярышник с багряными осенними ягодами.",
        "pt": "Espaço nobre do Parque Nacional junto aos célebres espigueiros do Soajo. Carvalhais densos com azevinho e pilriteiro salpicados de frutos vermelhos.",
        "en": "Western stronghold of Peneda-Gerês near iconic Soajo granite granaries. Pristine oakwoods teeming with red hawthorn berries in autumn."
      },
      "trails": {
        "ru": "PR1 AVV — Trilho dos Caminhos do Pão e Carvalhais do Mezio",
        "pt": "PR1 AVV — Trilho dos Caminhos do Pão e Carvalhais do Mezio",
        "en": "PR1 AVV — Heritage Bread Trails & Mezio Oakwoods"
      }
    },
    {
      "id": "mata_medos",
      "names": {
        "ru": "Заказник Мата-душ-Медуш (Кошта-да-Капарика)",
        "pt": "Reserva Natural da Mata dos Medos (Arriba Fóssil da Costa da Caparica)",
        "en": "Mata dos Medos Nature Reserve (Caparica Fossil Cliff)"
      },
      "lat": 38.5833,
      "lng": -9.1917,
      "radiusKm": 3.5,
      "elevationM": 110,
      "region": "AML",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "pine",
      "categories": [
        "pine",
        "orchard_shrub"
      ],
      "speciesIds": [
        "pinus_pinea",
        "pinus_pinaster",
        "arbutus_unedo",
        "crataegus_monogyna"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Reserva Botânica Mata dos Medos / ICNF",
      "summary": {
        "ru": "Королевский сосновый бор на вершине древнего ископаемого клифа Капарики, посаженный королем Жуаном V. Вековые зонтичные пинии и земляничник.",
        "pt": "Pinhal monumental de pinheiro-manso mandado plantar por D. João V na arriba fóssil da Caparica. Reserva botânica única sobre o mar.",
        "en": "Historic stone pine coastal forest planted by King John V atop Caparica fossil cliff. Botanical haven with umbrella pines and strawberry trees."
      },
      "trails": {
        "ru": "Trilho da Reserva Botânica da Mata dos Medos e Miradouro do Atlântico",
        "pt": "Trilho da Reserva Botânica da Mata dos Medos e Miradouros",
        "en": "Mata dos Medos Botanical Walk & Atlantic Lookouts"
      }
    },
    {
      "id": "paul_boquilobo",
      "names": {
        "ru": "Биосферный заповедник Паул-ду-Бокилобу (Рибатежу)",
        "pt": "Reserva da Biosfera do Paul do Boquilobo (Golegã e Torres Novas)",
        "en": "Paul do Boquilobo Biosphere Reserve (Ribatejo Wetlands & Forest)"
      },
      "lat": 39.3833,
      "lng": -8.5333,
      "radiusKm": 3,
      "elevationM": 25,
      "region": "Centro",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous"
      ],
      "speciesIds": [
        "quercus_faginea",
        "quercus_robur",
        "crataegus_monogyna"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Reserva da Biosfera UNESCO / ICNF",
      "summary": {
        "ru": "Первый биосферный заповедник ЮНЕСКО в Португалии. Пойменные галерейные леса, вековые ивы и дубравы португальского дуба.",
        "pt": "Primeira Reserva da Biosfera UNESCO de Portugal continental. Bosques ripícolas luxuriantes de freixo, salgueiro e carvalho-cerquinho.",
        "en": "First UNESCO Biosphere Reserve in mainland Portugal. Riparian gallery forests of ash, willow, and Portuguese oak along the Almonda river."
      },
      "trails": {
        "ru": "PR1 GLG — Trilho dos Salgueiros e Rota da Biosfera",
        "pt": "PR1 GLG — Trilho dos Salgueiros e Paul do Boquilobo",
        "en": "PR1 GLG — Willow Trail & Boquilobo Wetland Loop"
      }
    },
    {
      "id": "serra_sico",
      "names": {
        "ru": "Массив Сико (Ансиан, Помбал & Пенела)",
        "pt": "Maciço de Sicó (Carvalhais de Ansião e Alvorge)",
        "en": "Sicó Massif (Ansião & Alvorge Oakwoods)"
      },
      "lat": 39.8833,
      "lng": -8.45,
      "radiusKm": 4.5,
      "elevationM": 450,
      "region": "Centro",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "orchard_shrub"
      ],
      "speciesIds": [
        "quercus_faginea",
        "quercus_suber",
        "arbutus_unedo",
        "crataegus_monogyna"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Terras de Sicó / ICNF",
      "summary": {
        "ru": "Карстовое известняковое плато с лучшими рощами португальского дуба серкиньо. Листва приобретает благородный охристо-бронзовый цвет в ноябре.",
        "pt": "Paisagem cársica de calcários jurássicos dominada pelos carvalhais de cerquinho mais expressivos do Centro, dourados em novembro.",
        "en": "Karst limestone massif featuring Central Portugal premier Portuguese oak woodlands turning luminous ochre in November."
      },
      "trails": {
        "ru": "PR1 ANS — Trilho dos Carvalhais de Sicó e Vale das Buracas",
        "pt": "PR1 ANS — Trilho dos Carvalhais de Sicó e Buracas do Casmilo",
        "en": "PR1 ANS — Sicó Oakwoods & Casmilo Buracas Trail"
      }
    },
    {
      "id": "serra_cabreira",
      "names": {
        "ru": "Серра-да-Кабрейра (Виейра-ду-Минью)",
        "pt": "Serra da Cabreira (Mata da Cabeça da Vaca e Vale do Ave)",
        "en": "Serra da Cabreira (Cabeça da Vaca Primeval Woods)"
      },
      "lat": 41.6167,
      "lng": -8.0833,
      "radiusKm": 6,
      "elevationM": 980,
      "region": "Norte",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "pine"
      ],
      "speciesIds": [
        "quercus_robur",
        "quercus_pyrenaica",
        "betula_celtiberica",
        "pinus_pinaster"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Município de Vieira do Minho / ICNF",
      "summary": {
        "ru": "Величественный горный хребет над рекой Аве. Заповедный лес Cabeça da Vaca с монументальными дубами и березовыми перелесками.",
        "pt": "Imensa serra minhota de granito com a deslumbrante Mata da Cabeça da Vaca, plena de carvalhais caducifólios e cogumelos silvestres no outono.",
        "en": "Expansive Minho mountain wilderness with protected ancient oak stands and brilliant birch corridors in October."
      },
      "trails": {
        "ru": "PR1 VVR — Rota da Costa dos Carvalhos e Serra da Cabreira",
        "pt": "PR1 VVR — Rota da Costa dos Carvalhos e Cabeça da Vaca",
        "en": "PR1 VVR — Oak Slope Heritage Trail & Cabreira Ridges"
      }
    },
    {
      "id": "tapada_mafra",
      "names": {
        "ru": "Королевская тапада Мафры (Мафра)",
        "pt": "Tapada Nacional de Mafra (Sobreirais e Carvalhais Reais)",
        "en": "Tapada Nacional de Mafra (Royal Woodland Reserve)"
      },
      "lat": 38.9667,
      "lng": -9.2833,
      "radiusKm": 3,
      "elevationM": 220,
      "region": "AML",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "montado",
      "categories": [
        "montado",
        "deciduous",
        "pine"
      ],
      "speciesIds": [
        "quercus_suber",
        "quercus_faginea",
        "pinus_pinea",
        "castanea_sativa"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Tapada Nacional de Mafra",
      "summary": {
        "ru": "Огороженный королевский охотничий парк XVIII века площадью 800 га, созданный при короле Жуане V. Вековые пробковые дубы, пинии и олени в дикой природе.",
        "pt": "Parque florestal amuralhado de 800 hectares criado por D. João V em 1747. Sobreirais majestosos, castanheiros e fauna selvagem livre.",
        "en": "Walled 800-hectare royal forest park created in 1747 by King John V. Majestic cork oaks, stone pines, and free-roaming deer."
      },
      "trails": {
        "ru": "Trilho Real dos Sobreiros e Rota dos Gamos",
        "pt": "Trilho Real dos Sobreiros e dos Gamos",
        "en": "Royal Cork Oak Trail & Fallow Deer Circuit"
      }
    },
    {
      "id": "castanheiros_marvao",
      "names": {
        "ru": "Средневековые каштановые рощи Марвана (Портажен)",
        "pt": "Soutos Históricos de Marvão e Portagem (Serra de São Mamede)",
        "en": "Marvão & Portagem Ancient Chestnut Groves (São Mamede)"
      },
      "lat": 39.3944,
      "lng": -7.3778,
      "radiusKm": 3.5,
      "elevationM": 650,
      "region": "Alentejo",
      "autumnTimingZone": "mid_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "montado"
      ],
      "speciesIds": [
        "castanea_sativa",
        "quercus_pyrenaica",
        "quercus_suber"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Festa do Castanheiro de Marvão / ICNF",
      "summary": {
        "ru": "Вековые рощи исполинских каштанов вокруг неприступного замка Марван. Центр знаменитого праздника каштанов Festa do Castanheiro в ноябре.",
        "pt": "Soutos com castanheiros gigantescos classificados como monumentos vivos sob as muralhas de Marvão. Berço da mais famosa Festa do Castanheiro do Alentejo.",
        "en": "Monumental sweet chestnut groves beneath the medieval citadel of Marvão. Epicenter of Alentejo premier autumn Chestnut Festival."
      },
      "trails": {
        "ru": "PR1 MRV — Rota dos Soutos Medievais e Rio Sever",
        "pt": "PR1 MRV — Rota dos Castanheiros de Marvão e Rio Sever",
        "en": "PR1 MRV — Medieval Chestnut Trail & River Sever"
      }
    },
    {
      "id": "alfarrobeiras_tavira",
      "names": {
        "ru": "Рощи рожкового дерева и миндаля Тавиры (Баррокал)",
        "pt": "Pomares Tradicionais de Alfarrobeira de Tavira (Barrocal Algarvio)",
        "en": "Tavira Traditional Carob & Almond Groves (Algarve Barrocal)"
      },
      "lat": 37.15,
      "lng": -7.6833,
      "radiusKm": 4.5,
      "elevationM": 180,
      "region": "Algarve",
      "autumnTimingZone": "south",
      "dominantCategory": "orchard_shrub",
      "categories": [
        "orchard_shrub"
      ],
      "speciesIds": [
        "ceratonia_siliqua",
        "prunus_dulcis",
        "arbutus_unedo",
        "quercus_rotundifolia"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "AIDA / Município de Tavira",
      "summary": {
        "ru": "Классический сельский ландшафт Баррокала. Живописные плантации рожкового дерева с осенним цветением на стволах и сады миндаля.",
        "pt": "Paisagem idílica do Barrocal algarvio dominada por alfarrobeiras seculares, amendoeiras e oliveiras sobre solos argilo-calcários.",
        "en": "Idyllic Algarve Barrocal landscape dotted with ancient carob orchards, almonds, and holm oaks on rolling red-limestone hills."
      },
      "trails": {
        "ru": "PR2 TVR — Rota da Alfarroba e Barrocal Algarvio",
        "pt": "PR2 TVR — Rota da Alfarroba e Barrocal Algarvio",
        "en": "PR2 TVR — Carob Heritage Route & Barrocal Walk"
      }
    },
    {
      "id": "dunas_sao_jacinto",
      "names": {
        "ru": "Заказник дюн Сан-Жасинту (Авейру)",
        "pt": "Reserva Natural das Dunas de São Jacinto (Ria de Aveiro)",
        "en": "São Jacinto Dunes Nature Reserve (Ria de Aveiro Pine Forest)"
      },
      "lat": 40.6667,
      "lng": -8.7333,
      "radiusKm": 3,
      "elevationM": 15,
      "region": "Centro",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "pine",
      "categories": [
        "pine",
        "orchard_shrub"
      ],
      "speciesIds": [
        "pinus_pinaster",
        "arbutus_unedo",
        "crataegus_monogyna"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "RNDSJ / ICNF",
      "summary": {
        "ru": "Приморский прибрежный бор, высаженный на песчаной косе между океаном и лагуной Риа-ди-Авейру. Густой подлесок из земляничника и можжевельника.",
        "pt": "Belo pinhal litoral de fixação dunar entre a Ria de Aveiro e o Atlântico. Subcoberto abundante de medronheiro e camarinhas.",
        "en": "Coastal pine forest anchored on a fragile sand spit between the Atlantic and Aveiro lagoon, rich in strawberry trees and coastal flora."
      },
      "trails": {
        "ru": "Trilho da Descoberta da Natureza de São Jacinto",
        "pt": "Trilho da Descoberta da Natureza de São Jacinto",
        "en": "São Jacinto Nature Discovery Trail"
      }
    },
    {
      "id": "floresta_foz_areho",
      "names": {
        "ru": "Прибрежные пинии Обидуша и Фош-ду-Арелью",
        "pt": "Pinhais Mansos de Óbidos e Lagoa de Foz do Arelho",
        "en": "Óbidos & Foz do Arelho Coastal Stone Pines"
      },
      "lat": 39.4333,
      "lng": -9.1833,
      "radiusKm": 4,
      "elevationM": 80,
      "region": "Centro",
      "autumnTimingZone": "lowland_coastal",
      "dominantCategory": "pine",
      "categories": [
        "pine",
        "montado"
      ],
      "speciesIds": [
        "pinus_pinea",
        "pinus_pinaster",
        "quercus_suber",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 4,
      "sourceRef": "Município de Óbidos / ICNF",
      "summary": {
        "ru": "Приморские сосновые леса из итальянской пинии над лагуной Обидуш. Зрелые сосновые шишки и сладкий земляничник осенью.",
        "pt": "Pinhais de pinheiro-manso com vista panorâmica para a Lagoa de Óbidos e mar aberto. Pinhas nobres e medronhos em abundância.",
        "en": "Scenic umbrella pine groves overlooking the Óbidos coastal lagoon. Rich in pine nuts, cork oaks, and strawberry trees."
      },
      "trails": {
        "ru": "PR1 OBD — Trilho da Lagoa de Óbidos e Pinhal Litoral",
        "pt": "PR1 OBD — Trilho da Lagoa de Óbidos e Pinhal Litoral",
        "en": "PR1 OBD — Óbidos Lagoon & Coastal Pine Path"
      }
    },
    {
      "id": "serra_gardunha",
      "names": {
        "ru": "Серра-да-Гардунья (Каштелу-Нову & Алпедринья)",
        "pt": "Serra da Gardunha (Castelo Novo e Encostas da Gardunha)",
        "en": "Serra da Gardunha (Castelo Novo Medieval Slopes)"
      },
      "lat": 40.1167,
      "lng": -7.5,
      "radiusKm": 5,
      "elevationM": 950,
      "region": "Centro",
      "autumnTimingZone": "high_mountain",
      "dominantCategory": "deciduous",
      "categories": [
        "deciduous",
        "orchard_shrub"
      ],
      "speciesIds": [
        "castanea_sativa",
        "quercus_pyrenaica",
        "prunus_avium",
        "arbutus_unedo"
      ],
      "autumnWalkRating": 5,
      "sourceRef": "Paisagem Protegida Regional da Gardunha",
      "summary": {
        "ru": "Живописный гранитный массив к югу от Серра-да-Эштрела. Знаменитые сады черешни, каштановые рощи и золотые дубравы над исторической деревней Каштелу-Нову.",
        "pt": "Paisagem Protegida Regional de relevo altivo sobre a Beira Baixa. Soutos densos, carvalhais de negral e cerejais que explodem em carmesim no outono.",
        "en": "Protected regional mountain ridge above Beira Baixa. Sweet chestnut groves and cherry orchards creating fiery crimson and gold slopes in autumn."
      },
      "trails": {
        "ru": "PR1 FND — Rota da Gardunha e Aldeia Histórica de Castelo Novo",
        "pt": "PR1 FND — Rota da Gardunha e Castelo Novo",
        "en": "PR1 FND — Gardunha Crest & Castelo Novo Historic Trail"
      }
    }
  ],
  "regionalStats": {
    "totalForestAreaContinentalHa": 3224200,
    "totalContinentalLandHa": 8901500,
    "nationalForestCoveragePct": 35.8,
    "inventoryYear": 2019,
    "baselineYear": 2015,
    "speciesNationalTotals": [
      {
        "id": "eucalyptus_globulus",
        "areaHa": 845000,
        "sharePct": 26.2
      },
      {
        "id": "quercus_suber",
        "areaHa": 719900,
        "sharePct": 22.3
      },
      {
        "id": "pinus_pinaster",
        "areaHa": 713300,
        "sharePct": 22.1
      },
      {
        "id": "quercus_rotundifolia",
        "areaHa": 348700,
        "sharePct": 10.8
      },
      {
        "id": "pinus_pinea",
        "areaHa": 193400,
        "sharePct": 6
      },
      {
        "id": "quercus_deciduous",
        "areaHa": 82300,
        "sharePct": 2.6
      },
      {
        "id": "castanea_sativa",
        "areaHa": 47800,
        "sharePct": 1.5
      },
      {
        "id": "other_broadleaves",
        "areaHa": 182000,
        "sharePct": 5.6
      },
      {
        "id": "other_conifers",
        "areaHa": 16000,
        "sharePct": 0.5
      },
      {
        "id": "open_woodland_riparian",
        "areaHa": 75800,
        "sharePct": 2.4
      }
    ],
    "nutsII": [
      {
        "regionKey": "Norte",
        "names": {
          "ru": "Север (Norte)",
          "pt": "Norte",
          "en": "North"
        },
        "totalForestHa": 754200,
        "regionLandHa": 2088800,
        "forestCoveragePct": 36.1,
        "dominantSpecies": [
          {
            "id": "pinus_pinaster",
            "areaHa": 236000,
            "sharePct": 31.3
          },
          {
            "id": "eucalyptus_globulus",
            "areaHa": 194000,
            "sharePct": 25.7
          },
          {
            "id": "quercus_deciduous",
            "areaHa": 68000,
            "sharePct": 9
          },
          {
            "id": "castanea_sativa",
            "areaHa": 44000,
            "sharePct": 5.8
          }
        ]
      },
      {
        "regionKey": "Centro",
        "names": {
          "ru": "Центр (Centro)",
          "pt": "Centro",
          "en": "Centre"
        },
        "totalForestHa": 1073600,
        "regionLandHa": 2831800,
        "forestCoveragePct": 37.9,
        "dominantSpecies": [
          {
            "id": "eucalyptus_globulus",
            "areaHa": 395000,
            "sharePct": 36.8
          },
          {
            "id": "pinus_pinaster",
            "areaHa": 378000,
            "sharePct": 35.2
          },
          {
            "id": "quercus_suber",
            "areaHa": 104000,
            "sharePct": 9.7
          },
          {
            "id": "castanea_sativa",
            "areaHa": 12000,
            "sharePct": 1.1
          }
        ]
      },
      {
        "regionKey": "AML",
        "names": {
          "ru": "Агломерация Лиссабона (AML)",
          "pt": "Área Metropolitana de Lisboa",
          "en": "Lisbon Metro Area"
        },
        "totalForestHa": 71500,
        "regionLandHa": 300100,
        "forestCoveragePct": 23.8,
        "dominantSpecies": [
          {
            "id": "pinus_pinea",
            "areaHa": 24000,
            "sharePct": 33.6
          },
          {
            "id": "eucalyptus_globulus",
            "areaHa": 21000,
            "sharePct": 29.4
          },
          {
            "id": "quercus_suber",
            "areaHa": 16000,
            "sharePct": 22.4
          },
          {
            "id": "pinus_pinaster",
            "areaHa": 6500,
            "sharePct": 9.1
          }
        ]
      },
      {
        "regionKey": "Alentejo",
        "names": {
          "ru": "Алентежу (Alentejo)",
          "pt": "Alentejo",
          "en": "Alentejo"
        },
        "totalForestHa": 1126300,
        "regionLandHa": 3155100,
        "forestCoveragePct": 35.7,
        "dominantSpecies": [
          {
            "id": "quercus_suber",
            "areaHa": 541000,
            "sharePct": 48
          },
          {
            "id": "quercus_rotundifolia",
            "areaHa": 326000,
            "sharePct": 28.9
          },
          {
            "id": "pinus_pinea",
            "areaHa": 147000,
            "sharePct": 13.1
          },
          {
            "id": "eucalyptus_globulus",
            "areaHa": 84000,
            "sharePct": 7.5
          }
        ]
      },
      {
        "regionKey": "Algarve",
        "names": {
          "ru": "Алгарви (Algarve)",
          "pt": "Algarve",
          "en": "Algarve"
        },
        "totalForestHa": 198600,
        "regionLandHa": 499700,
        "forestCoveragePct": 39.7,
        "dominantSpecies": [
          {
            "id": "quercus_suber",
            "areaHa": 59000,
            "sharePct": 29.7
          },
          {
            "id": "arbutus_unedo",
            "areaHa": 55000,
            "sharePct": 27.7
          },
          {
            "id": "pinus_pinaster",
            "areaHa": 34000,
            "sharePct": 17.1
          },
          {
            "id": "quercus_rotundifolia",
            "areaHa": 22000,
            "sharePct": 11.1
          }
        ]
      }
    ]
  },
  "i18n": {
    "ru": {
      "appTitle": "Леса Португалии & Осенняя Фенология",
      "appSubtitle": "Интерактивная карта лесов, фенологии цветения и плодоношения, а также статуса осенней листвы",
      "layersTitle": "Официальные слои DGT",
      "forestCategoriesTitle": "Фильтр категорий лесов",
      "allCategories": "Все леса",
      "catEucalyptus": "Эвкалипт",
      "catPine": "Сосновые леса",
      "catDeciduous": "Листопадные дубы и каштаны",
      "catMontado": "Монтадо (пробка и каменный дуб)",
      "catBloomOrchard": "Цветущие сады и кустарники",
      "timeSliderTitle": "Календарь фенологии и осени",
      "monthNames": [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь"
      ],
      "periodThirds": {
        "1": "начало месяца",
        "2": "середина месяца",
        "3": "конец месяца"
      },
      "foliageStates": {
        "green": "Зеленая листва",
        "yellowing": "Начало пожелтения / раннее золото",
        "peak_yellow": "Пик золотой и багряной осени",
        "falling": "Активный листопад",
        "fallen": "Опавшая листва / ковер на земле"
      },
      "phenologyEvents": {
        "flowering": "Цветение",
        "fruiting": "Плодоношение / Сбор урожая",
        "autumnFoliage": "Осенняя окраска кроны",
        "evergreenNotice": "Вечнозеленый вид: крона сохраняет зеленый цвет круглый год"
      },
      "locationsTab": "Знаменитые леса и парки",
      "speciesTab": "Древесные породы (14)",
      "statsTab": "Лесная статистика IFN6",
      "searchPlaceholder": "Поиск леса, вида, региона или тропы...",
      "autumnWalkScore": "Оценка для осенних прогулок",
      "elevation": "Высота над уровнем моря",
      "region": "Регион",
      "trails": "Рекомендуемые пешеходные маршруты",
      "inatObservations": "Живые наблюдения на iNaturalist",
      "viewInat": "Смотреть фото в Португалии на iNaturalist",
      "sourceCitations": "Официальные источники данных",
      "legend": "Легенда",
      "vegetationLossNotice": "CPV: Спутниковая детекция потерь древесного покрова за текущий период 2025–2026 гг."
    },
    "pt": {
      "appTitle": "Florestas de Portugal & Fenologia de Outono",
      "appSubtitle": "Mapa interactivo das florestas, fenologia de floração e frutificação, e estado da folhagem de outono",
      "layersTitle": "Camadas Oficiais DGT",
      "forestCategoriesTitle": "Filtro de Povoamentos Florestais",
      "allCategories": "Todas as Florestas",
      "catEucalyptus": "Eucaliptal",
      "catPine": "Pinhais (Bravo e Manso)",
      "catDeciduous": "Folhosas Caducifólias (Carvalhos e Castanheiros)",
      "catMontado": "Montado (Sobreiro e Azinheira)",
      "catBloomOrchard": "Pomares Floridos e Matos Nobres",
      "timeSliderTitle": "Calendário Fenológico e de Outono",
      "monthNames": [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
      ],
      "periodThirds": {
        "1": "início do mês",
        "2": "meados do mês",
        "3": "fim do mês"
      },
      "foliageStates": {
        "green": "Folhagem verde",
        "yellowing": "Amarelecimento inicial / tons dourados precoces",
        "peak_yellow": "Pico dourado, acobreado e rubro",
        "falling": "Queda de folha activa",
        "fallen": "Folhas caídas / tapete no solo"
      },
      "phenologyEvents": {
        "flowering": "Floração",
        "fruiting": "Frutificação / Maturação",
        "autumnFoliage": "Mudança de cor outonal",
        "evergreenNotice": "Espécie perenifólia: copa verde persistente ao longo de todo o ano"
      },
      "locationsTab": "Florestas Notáveis e Parques",
      "speciesTab": "Espécies Arbóreas (14)",
      "statsTab": "Estatísticas Florestais IFN6",
      "searchPlaceholder": "Pesquisar floresta, espécie, concelho ou trilho...",
      "autumnWalkScore": "Classificação para passeios de outono",
      "elevation": "Altitude",
      "region": "Região",
      "trails": "Trilhos pedestres recomendados",
      "inatObservations": "Observações em tempo real no iNaturalist",
      "viewInat": "Ver fotografias em Portugal no iNaturalist",
      "sourceCitations": "Fontes oficiais de dados",
      "legend": "Legenda",
      "vegetationLossNotice": "CPV: Deteção contínua por satélite das perdas de coberto florestal no ano 2025–2026."
    },
    "en": {
      "appTitle": "Forests of Portugal & Autumn Phenology",
      "appSubtitle": "Interactive map of Portugal forests, flowering and fruiting phenology, and autumn foliage status",
      "layersTitle": "Official DGT WMS Layers",
      "forestCategoriesTitle": "Forest Stand Category Filter",
      "allCategories": "All Forests",
      "catEucalyptus": "Eucalyptus",
      "catPine": "Pine Woodlands (Maritime & Stone Pine)",
      "catDeciduous": "Deciduous Oaks & Sweet Chestnuts",
      "catMontado": "Montado (Cork Oak & Holm Oak)",
      "catBloomOrchard": "Blossoming Orchards & Shrublands",
      "timeSliderTitle": "Phenological & Autumn Calendar",
      "monthNames": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      "periodThirds": {
        "1": "early month",
        "2": "mid month",
        "3": "late month"
      },
      "foliageStates": {
        "green": "Green foliage",
        "yellowing": "Initial yellowing / early golden hues",
        "peak_yellow": "Peak golden, amber, and crimson foliage",
        "falling": "Active leaf drop",
        "fallen": "Fallen leaves / bare branches & ground carpet"
      },
      "phenologyEvents": {
        "flowering": "Flowering",
        "fruiting": "Fruiting / Harvest season",
        "autumnFoliage": "Autumn canopy coloration",
        "evergreenNotice": "Evergreen species: retains green foliage throughout the year"
      },
      "locationsTab": "Famous Forests & Natural Parks",
      "speciesTab": "Tree & Shrub Species (14)",
      "statsTab": "IFN6 Forest Statistics",
      "searchPlaceholder": "Search forest, species, region or trail...",
      "autumnWalkScore": "Autumn walk rating",
      "elevation": "Elevation",
      "region": "Region",
      "trails": "Recommended hiking trails",
      "inatObservations": "Live iNaturalist Observations",
      "viewInat": "View Portugal observations on iNaturalist",
      "sourceCitations": "Official Data Citations",
      "legend": "Legend",
      "vegetationLossNotice": "CPV: Continuous satellite detection of canopy cover loss in 2025–2026."
    }
  }
};

  // Helper methods
  DATA.getSpeciesById = function (speciesId) {
    for (var i = 0; i < DATA.species.length; i++) {
      if (DATA.species[i].id === speciesId) {
        return DATA.species[i];
      }
    }
    return null;
  };

  DATA.getLocationById = function (locationId) {
    for (var i = 0; i < DATA.locations.length; i++) {
      if (DATA.locations[i].id === locationId) {
        return DATA.locations[i];
      }
    }
    return null;
  };

  DATA.getPeriodKey = function (month, day) {
    var third = 1;
    if (day > 10 && day <= 20) third = 2;
    else if (day > 20) third = 3;
    return month + '.' + third;
  };

  DATA.getCurrentPeriod = function (dateObj) {
    var d = dateObj || new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    return DATA.getPeriodKey(month, day);
  };

  DATA.getAutumnStatus = function (speciesId, locationId, periodKey) {
    var sp = typeof speciesId === 'string' ? DATA.getSpeciesById(speciesId) : speciesId;
    if (!sp) return null;

    if (sp.leafType === 'evergreen') {
      return {
        status: 'evergreen',
        color: '#2d6a4f',
        label: {
          ru: 'Вечнозеленый',
          pt: 'Perenifólio',
          en: 'Evergreen'
        }
      };
    }

    var loc = typeof locationId === 'string' ? DATA.getLocationById(locationId) : locationId;
    var zone = 'mid_mountain';
    if (typeof locationId === 'string' && DATA.AUTUMN_ZONES.indexOf(locationId) !== -1) {
      zone = locationId;
    } else if (loc && loc.autumnTimingZone) {
      zone = loc.autumnTimingZone;
    } else if (loc && loc.elevationM) {
      if (loc.elevationM >= 900) zone = 'high_mountain';
      else if (loc.elevationM >= 500) zone = 'mid_mountain';
      else zone = 'lowland_coastal';
    }

    var period = periodKey || '10.2';
    var zoneFoliage = sp.phenology.autumnFoliage ? sp.phenology.autumnFoliage[zone] : null;
    var statusKey = 'green';

    if (zoneFoliage) {
      if (zoneFoliage[period]) {
        statusKey = zoneFoliage[period];
      } else {
        var m = period.split('.')[0];
        if (zoneFoliage[m]) {
          statusKey = zoneFoliage[m];
        } else {
          var mNum = parseInt(m, 10);
          // Branches stay bare in early spring until the species' leaf-out month
          var leafOut = sp.phenology.leafOutMonth || 3;
          if (mNum >= 3 && mNum <= 9) statusKey = mNum < leafOut ? 'fallen' : 'green';
          else if (mNum === 12 || mNum === 1 || mNum === 2) statusKey = 'fallen';
        }
      }
    }

    var colors = {
      green: '#2e7d32',
      yellowing: '#eab308',
      peak_yellow: '#f59e0b',
      falling: '#b45309',
      fallen: '#78350f'
    };

    return {
      status: statusKey,
      color: colors[statusKey] || '#2e7d32',
      label: {
        ru: (DATA.i18n && DATA.i18n.ru && DATA.i18n.ru.foliageStates && DATA.i18n.ru.foliageStates[statusKey]) || statusKey,
        pt: (DATA.i18n && DATA.i18n.pt && DATA.i18n.pt.foliageStates && DATA.i18n.pt.foliageStates[statusKey]) || statusKey,
        en: (DATA.i18n && DATA.i18n.en && DATA.i18n.en.foliageStates && DATA.i18n.en.foliageStates[statusKey]) || statusKey
      }
    };
  };

  DATA.AUTUMN_ZONES = ['high_mountain', 'mid_mountain', 'lowland_coastal', 'south'];
  DATA.FOLIAGE_RANK = { peak_yellow: 5, yellowing: 4, falling: 3, fallen: 2, green: 1 };

  // Nationwide foliage status of a species. The COS WMS layer carries no elevation, so a
  // country-wide view must look at every altitude zone instead of silently assuming one.
  // Returns the most advanced autumn state found in any zone (same ranking as map markers),
  // plus `statuses` (every state present somewhere) and `byZone` for detailed display.
  DATA.getNationalAutumnStatus = function (speciesId, periodKey) {
    var sp = typeof speciesId === 'string' ? DATA.getSpeciesById(speciesId) : speciesId;
    if (!sp) return null;
    if (sp.leafType === 'evergreen') {
      var ev = DATA.getAutumnStatus(sp, null, periodKey);
      ev.statuses = ['evergreen'];
      ev.byZone = [];
      return ev;
    }

    var best = null;
    var statuses = [];
    var byZone = DATA.AUTUMN_ZONES.map(function (zone) {
      var st = DATA.getAutumnStatus(sp, zone, periodKey);
      if (statuses.indexOf(st.status) === -1) statuses.push(st.status);
      if (!best || (DATA.FOLIAGE_RANK[st.status] || 0) > (DATA.FOLIAGE_RANK[best.status] || 0)) {
        best = { status: st.status, color: st.color, label: st.label, zone: zone };
      }
      return { zone: zone, status: st.status, label: st.label };
    });

    best.statuses = statuses;
    best.byZone = byZone;
    return best;
  };

  // Species whose `cosRole` is 'associated' have no COS class of their own (understory shrubs,
  // orchard crops that COS does not separate). Their codes describe typical habitat only and
  // must not drive phenology-state polygon filters.
  DATA.isCosMappable = function (sp) {
    return !!(sp && sp.dgtCosCodes && sp.dgtCosCodes.length && sp.cosRole !== 'associated');
  };

  DATA.getPhenologyByMonth = function (monthNumber) {
    var m = parseInt(monthNumber, 10);
    var flowering = [];
    var fruiting = [];

    for (var i = 0; i < DATA.species.length; i++) {
      var sp = DATA.species[i];
      if (sp.phenology.floweringMonths.indexOf(m) !== -1) {
        flowering.push(sp);
      }
      if (sp.phenology.fruitingMonths.indexOf(m) !== -1) {
        fruiting.push(sp);
      }
    }

    return {
      month: m,
      flowering: flowering,
      fruiting: fruiting
    };
  };

  DATA.getInatApiUrl = function (taxonId, options) {
    var opts = options || {};
    var placeId = opts.placeId || 7122;
    var perPage = opts.perPage || 12;
    var quality = opts.qualityGrade || 'research';
    return (
      'https://api.inaturalist.org/v1/observations?' +
      'place_id=' + placeId +
      '&taxon_id=' + taxonId +
      '&quality_grade=' + quality +
      '&photos=true' +
      '&per_page=' + perPage +
      '&order_by=observed_on'
    );
  };

  DATA.getInatWebUrl = function (taxonId) {
    return 'https://www.inaturalist.org/observations?place_id=7122&taxon_id=' + taxonId;
  };

  DATA.buildWmsUrl = function (layerKey, options) {
    var opts = options || {};
    var layerObj = DATA.wmsConfig.layers[layerKey] || DATA.wmsConfig.layers.cos2025;
    var cql = opts.cqlFilter || layerObj.defaultCql;
    var params = [
      'SERVICE=WMS',
      'VERSION=' + (opts.version || DATA.wmsConfig.defaultVersion),
      'REQUEST=GetMap',
      'LAYERS=' + encodeURIComponent(layerObj.id),
      'STYLES=',
      'FORMAT=image/png',
      'TRANSPARENT=true',
      'SRS=' + (opts.srs || DATA.wmsConfig.srs)
    ];

    if (opts.bbox) {
      params.push('BBOX=' + opts.bbox);
    }
    if (opts.width && opts.height) {
      params.push('WIDTH=' + opts.width + '&HEIGHT=' + opts.height);
    }
    if (cql) {
      params.push('CQL_FILTER=' + encodeURIComponent(cql));
    }

    return DATA.wmsConfig.url + '?' + params.join('&');
  };


  // Official DGT COS Level 4 Full Trilingual Dictionary (101 official classes)
  DATA.cosN4Translations = {
  "1.1.1.1": {
    "code": "1.1.1.1",
    "pt": "Áreas edificadas residenciais contínuas predominantemente verticais",
    "ru": "Многоэтажная жилая сплошная застройка",
    "en": "Predominantly high-rise continuous residential fabric",
    "isForest": false
  },
  "1.1.1.2": {
    "code": "1.1.1.2",
    "pt": "Áreas edificadas residenciais contínuas predominantemente horizontais",
    "ru": "Малоэтажная жилая сплошная застройка",
    "en": "Predominantly low-rise continuous residential fabric",
    "isForest": false
  },
  "1.1.2.1": {
    "code": "1.1.2.1",
    "pt": "Áreas edificadas residenciais descontínuas",
    "ru": "Прерывистая жилая застройка",
    "en": "Discontinuous residential urban fabric",
    "isForest": false
  },
  "1.1.2.2": {
    "code": "1.1.2.2",
    "pt": "Áreas edificadas residenciais descontínuas esparsas",
    "ru": "Разреженная жилая застройка",
    "en": "Sparse discontinuous residential fabric",
    "isForest": false
  },
  "1.2.1.1": {
    "code": "1.2.1.1",
    "pt": "Indústria e logística",
    "ru": "Промышленность и логистические комплексы",
    "en": "Industrial and logistics complexes",
    "isForest": false
  },
  "1.2.1.2": {
    "code": "1.2.1.2",
    "pt": "Comércio e serviços",
    "ru": "Коммерческие центры и сфера услуг",
    "en": "Commercial and service facilities",
    "isForest": false
  },
  "1.2.2.1": {
    "code": "1.2.2.1",
    "pt": "Áreas edificadas turísticas",
    "ru": "Туристические гостиничные комплексы",
    "en": "Tourism accommodation complexes",
    "isForest": false
  },
  "1.2.2.2": {
    "code": "1.2.2.2",
    "pt": "Parques de campismo e de caravanismo",
    "ru": "Кемпинги и караванинг",
    "en": "Campgrounds and caravan parks",
    "isForest": false
  },
  "1.2.3.1": {
    "code": "1.2.3.1",
    "pt": "Instalações agrícolas e pecuárias",
    "ru": "Сельскохозяйственные и животноводческие комплексы",
    "en": "Agricultural and livestock facilities",
    "isForest": false
  },
  "1.2.3.2": {
    "code": "1.2.3.2",
    "pt": "Instalações aquícolas",
    "ru": "Аквакультурные рыбные хозяйства",
    "en": "Aquaculture facilities",
    "isForest": false
  },
  "1.3.1.1": {
    "code": "1.3.1.1",
    "pt": "Equipamentos de educação",
    "ru": "Образовательные учреждения и кампусы",
    "en": "Educational facilities",
    "isForest": false
  },
  "1.3.1.2": {
    "code": "1.3.1.2",
    "pt": "Equipamentos de saúde",
    "ru": "Медицинские комплексы и больницы",
    "en": "Healthcare facilities",
    "isForest": false
  },
  "1.3.2.1": {
    "code": "1.3.2.1",
    "pt": "Equipamentos culturais",
    "ru": "Культурные учреждения и театры",
    "en": "Cultural facilities",
    "isForest": false
  },
  "1.3.2.2": {
    "code": "1.3.2.2",
    "pt": "Sítios arqueológicos",
    "ru": "Археологические памятники и раскопки",
    "en": "Archaeological sites",
    "isForest": false
  },
  "1.3.3.1": {
    "code": "1.3.3.1",
    "pt": "Equipamentos desportivos",
    "ru": "Спортивные комплексы и стадионы",
    "en": "Sports facilities",
    "isForest": false
  },
  "1.3.3.2": {
    "code": "1.3.3.2",
    "pt": "Equipamentos de lazer",
    "ru": "Рекреационные парки и зоны отдыха",
    "en": "Leisure facilities",
    "isForest": false
  },
  "1.3.3.3": {
    "code": "1.3.3.3",
    "pt": "Campos de golfe",
    "ru": "Поля для гольфа",
    "en": "Golf courses",
    "isForest": false
  },
  "1.3.4.1": {
    "code": "1.3.4.1",
    "pt": "Cemitérios",
    "ru": "Кладбища и мемориалы",
    "en": "Cemeteries",
    "isForest": false
  },
  "1.3.4.2": {
    "code": "1.3.4.2",
    "pt": "Outros equipamentos",
    "ru": "Прочие общественные сооружения",
    "en": "Other community facilities",
    "isForest": false
  },
  "1.4.1.1": {
    "code": "1.4.1.1",
    "pt": "Infraestruturas de produção de energia hídrica",
    "ru": "Гидроэлектростанции и дамбы",
    "en": "Hydroelectric dams and facilities",
    "isForest": false
  },
  "1.4.1.2": {
    "code": "1.4.1.2",
    "pt": "Infraestruturas de produção de energia solar",
    "ru": "Солнечные электростанции (СЭС)",
    "en": "Solar power plants",
    "isForest": false
  },
  "1.4.1.3": {
    "code": "1.4.1.3",
    "pt": "Outras Infraestruturas de produção de energia renovável",
    "ru": "Ветровые электростанции (ВЭС)",
    "en": "Wind power farms",
    "isForest": false
  },
  "1.4.2.1": {
    "code": "1.4.2.1",
    "pt": "Infraestruturas de produção de energia de fonte fóssil",
    "ru": "ТЭЦ и ископаемая энергетика",
    "en": "Thermal power plants",
    "isForest": false
  },
  "1.4.3.1": {
    "code": "1.4.3.1",
    "pt": "Subestações e postos de transformação de energia",
    "ru": "Электрические подстанции и ЛЭП",
    "en": "Electrical substations and power lines",
    "isForest": false
  },
  "1.4.4.1": {
    "code": "1.4.4.1",
    "pt": "Infraestruturas de captação e tratamento de águas para consumo",
    "ru": "Водозаборы и станции водоподготовки",
    "en": "Water intake and treatment stations",
    "isForest": false
  },
  "1.4.4.2": {
    "code": "1.4.4.2",
    "pt": "Infraestruturas de drenagem e tratamento de águas residuais",
    "ru": "Очистные сооружения сточных вод",
    "en": "Wastewater treatment plants",
    "isForest": false
  },
  "1.4.5.1": {
    "code": "1.4.5.1",
    "pt": "Aterros",
    "ru": "Полигоны ТБО и свалки",
    "en": "Landfill sites",
    "isForest": false
  },
  "1.4.5.2": {
    "code": "1.4.5.2",
    "pt": "Outras infraestruturas de resíduos",
    "ru": "Мусороперерабатывающие комплексы",
    "en": "Waste treatment facilities",
    "isForest": false
  },
  "1.4.6.1": {
    "code": "1.4.6.1",
    "pt": "Infraestruturas militares",
    "ru": "Военные объекты и базы",
    "en": "Military installations",
    "isForest": false
  },
  "1.4.6.2": {
    "code": "1.4.6.2",
    "pt": "Outras infraestruturas",
    "ru": "Прочие объекты инфраструктуры",
    "en": "Other infrastructure",
    "isForest": false
  },
  "1.5.1.1": {
    "code": "1.5.1.1",
    "pt": "Rede rodoviária",
    "ru": "Автодорожная сеть и развязки",
    "en": "Road network and interchanges",
    "isForest": false
  },
  "1.5.1.2": {
    "code": "1.5.1.2",
    "pt": "Rede ferroviária",
    "ru": "Железнодорожные пути и станции",
    "en": "Railways and train stations",
    "isForest": false
  },
  "1.5.2.1": {
    "code": "1.5.2.1",
    "pt": "Terminais portuários de mar e de rio",
    "ru": "Морские и речные грузовые порты",
    "en": "Commercial sea and river ports",
    "isForest": false
  },
  "1.5.2.2": {
    "code": "1.5.2.2",
    "pt": "Estaleiros navais e docas secas",
    "ru": "Судоверфи и сухие доки",
    "en": "Shipyards and dry docks",
    "isForest": false
  },
  "1.5.2.3": {
    "code": "1.5.2.3",
    "pt": "Marinas e docas pesca",
    "ru": "Марины, яхт-клубы и рыбные гавани",
    "en": "Marinas and fishing docks",
    "isForest": false
  },
  "1.5.3.1": {
    "code": "1.5.3.1",
    "pt": "Aeroportos",
    "ru": "Международные аэропорты",
    "en": "International airports",
    "isForest": false
  },
  "1.5.3.2": {
    "code": "1.5.3.2",
    "pt": "Aeródromos",
    "ru": "Аэродромы и взлетные полосы",
    "en": "Airfields and runways",
    "isForest": false
  },
  "1.5.4.1": {
    "code": "1.5.4.1",
    "pt": "Áreas de estacionamento",
    "ru": "Автомобильные парковки и терминалы",
    "en": "Parking areas and transit hubs",
    "isForest": false
  },
  "1.6.1.1": {
    "code": "1.6.1.1",
    "pt": "Minas a céu aberto",
    "ru": "Открытые рудники и карьеры полезных ископаемых",
    "en": "Open-cast mines and pits",
    "isForest": false
  },
  "1.6.1.2": {
    "code": "1.6.1.2",
    "pt": "Pedreiras",
    "ru": "Каменоломни и добыча гранита/мрамора",
    "en": "Stone and marble quarries",
    "isForest": false
  },
  "1.7.1.1": {
    "code": "1.7.1.1",
    "pt": "Vazios sem construção",
    "ru": "Vazios sem construção",
    "en": "Vazios sem construção",
    "isForest": false
  },
  "1.7.1.2": {
    "code": "1.7.1.2",
    "pt": "Áreas em construção",
    "ru": "Áreas em construção",
    "en": "Áreas em construção",
    "isForest": false
  },
  "1.8.1.1": {
    "code": "1.8.1.1",
    "pt": "Espaços verdes",
    "ru": "Espaços verdes",
    "en": "Espaços verdes",
    "isForest": false
  },
  "1.8.1.2": {
    "code": "1.8.1.2",
    "pt": "Hortas comunitárias",
    "ru": "Hortas comunitárias",
    "en": "Hortas comunitárias",
    "isForest": false
  },
  "2.1.1.1": {
    "code": "2.1.1.1",
    "pt": "Culturas temporárias de sequeiro e regadio",
    "ru": "Богарные пахотные земли",
    "en": "Non-irrigated arable land",
    "isForest": false
  },
  "2.1.1.2": {
    "code": "2.1.1.2",
    "pt": "Arrozais",
    "ru": "Arrozais",
    "en": "Arrozais",
    "isForest": false
  },
  "2.2.1.1": {
    "code": "2.2.1.1",
    "pt": "Vinhas",
    "ru": "Виноградники",
    "en": "Vineyards",
    "isForest": false
  },
  "2.2.2.1": {
    "code": "2.2.2.1",
    "pt": "Pomares em copa de baixa densidade",
    "ru": "Традиционные сады низкой плотности (миндаль, инжир, каштан, черешня)",
    "en": "Traditional low-density orchards (almond, fig, chestnut, cherry)",
    "isForest": true
  },
  "2.2.2.2": {
    "code": "2.2.2.2",
    "pt": "Pomares em copa de alta densidade",
    "ru": "Плодовые сады высокой плотности",
    "en": "High-density fruit orchards",
    "isForest": false
  },
  "2.2.2.3": {
    "code": "2.2.2.3",
    "pt": "Pomares em sebe",
    "ru": "Интенсивные шпалерные сады",
    "en": "Hedge fruit plantations",
    "isForest": false
  },
  "2.2.3.1": {
    "code": "2.2.3.1",
    "pt": "Olival em copa de baixa densidade",
    "ru": "Традиционные оливковые рощи",
    "en": "Traditional olive groves",
    "isForest": false
  },
  "2.2.3.2": {
    "code": "2.2.3.2",
    "pt": "Olival em copa de alta densidade",
    "ru": "Интенсивные оливковые сады",
    "en": "Intensive olive orchards",
    "isForest": false
  },
  "2.2.3.3": {
    "code": "2.2.3.3",
    "pt": "Olival em sebe",
    "ru": "Суперинтенсивные шпалерные оливковые посадки",
    "en": "Super-intensive hedge olive plantations",
    "isForest": false
  },
  "2.3.1.1": {
    "code": "2.3.1.1",
    "pt": "Culturas temporárias e/ou pastagens melhoradas associadas a vinha",
    "ru": "Улучшенные сенокосы и пастбища",
    "en": "Improved pastures and meadows",
    "isForest": false
  },
  "2.3.1.2": {
    "code": "2.3.1.2",
    "pt": "Culturas temporárias e/ou pastagens melhoradas associadas a pomar",
    "ru": "Естественные луговые пастбища",
    "en": "Natural grasslands",
    "isForest": false
  },
  "2.3.1.3": {
    "code": "2.3.1.3",
    "pt": "Culturas temporárias e/ou pastagens melhoradas associadas a olival",
    "ru": "Culturas temporárias e/ou pastagens melhoradas associadas a olival",
    "en": "Culturas temporárias e/ou pastagens melhoradas associadas a olival",
    "isForest": false
  },
  "2.4.1.1": {
    "code": "2.4.1.1",
    "pt": "Agricultura e viveiros protegidos",
    "ru": "Тепличные хозяйства и питомники",
    "en": "Greenhouses and plant nurseries",
    "isForest": false
  },
  "3.1.1.1": {
    "code": "3.1.1.1",
    "pt": "Pastagens melhoradas",
    "ru": "Песчаные пляжи и приморские дюны",
    "en": "Sandy beaches and coastal dunes",
    "isForest": false
  },
  "3.1.2.1": {
    "code": "3.1.2.1",
    "pt": "Pastagens espontâneas",
    "ru": "Pastagens espontâneas",
    "en": "Pastagens espontâneas",
    "isForest": false
  },
  "4.1.1.1": {
    "code": "4.1.1.1",
    "pt": "Superfícies agrossilvícolas de sobreiro",
    "ru": "Монтадо пробкового дуба с пашней (агролесоводство)",
    "en": "Arable agroforestry cork oak montado",
    "isForest": true
  },
  "4.1.1.2": {
    "code": "4.1.1.2",
    "pt": "Superfícies agrossilvícolas de azinheira",
    "ru": "Монтадо каменного дуба с пашней (агролесоводство)",
    "en": "Arable agroforestry holm oak montado",
    "isForest": true
  },
  "4.1.1.3": {
    "code": "4.1.1.3",
    "pt": "Superfícies agrossilvícolas de outros carvalhos",
    "ru": "Дубравы других видов дуба с пашней (агролесоводство)",
    "en": "Arable agroforestry other oaks",
    "isForest": true
  },
  "4.1.1.4": {
    "code": "4.1.1.4",
    "pt": "Superfícies agrossilvícolas de outras folhosas",
    "ru": "Лиственные насаждения с пашней (агролесоводство)",
    "en": "Arable agroforestry other broadleaves",
    "isForest": true
  },
  "4.1.2.1": {
    "code": "4.1.2.1",
    "pt": "Superfícies agrossilvícolas de pinheiro manso",
    "ru": "Рощи сосны пинии с пашней (агролесоводство)",
    "en": "Arable agroforestry stone pine",
    "isForest": true
  },
  "4.1.2.2": {
    "code": "4.1.2.2",
    "pt": "Superfícies agrossilvícolas de outras resinosas",
    "ru": "Хвойные насаждения с пашней (агролесоводство)",
    "en": "Arable agroforestry other conifers",
    "isForest": true
  },
  "4.2.1.1": {
    "code": "4.2.1.1",
    "pt": "Superfícies silvopastoris de sobreiro",
    "ru": "Монтадо пробкового дуба с выпасом (сильвопастораль)",
    "en": "Silvopastoral cork oak montado",
    "isForest": true
  },
  "4.2.1.2": {
    "code": "4.2.1.2",
    "pt": "Superfícies silvopastoris de azinheira",
    "ru": "Монтадо каменного дуба с выпасом (сильвопастораль)",
    "en": "Silvopastoral holm oak montado",
    "isForest": true
  },
  "4.2.1.3": {
    "code": "4.2.1.3",
    "pt": "Superfícies silvopastoris de outros carvalhos",
    "ru": "Дубравы других видов дуба с выпасом (сильвопастораль)",
    "en": "Silvopastoral other oaks",
    "isForest": true
  },
  "4.2.1.4": {
    "code": "4.2.1.4",
    "pt": "Superfícies silvopastoris de outras folhosas",
    "ru": "Лиственные насаждения с выпасом (сильвопастораль)",
    "en": "Silvopastoral other broadleaves",
    "isForest": true
  },
  "4.2.2.1": {
    "code": "4.2.2.1",
    "pt": "Superfícies silvopastoris de pinheiro manso",
    "ru": "Рощи сосны пинии с выпасом (сильвопастораль)",
    "en": "Silvopastoral stone pine",
    "isForest": true
  },
  "4.2.2.2": {
    "code": "4.2.2.2",
    "pt": "Superfícies silvopastoris de outras resinosas",
    "ru": "Хвойные насаждения с выпасом (сильвопастораль)",
    "en": "Silvopastoral other conifers",
    "isForest": true
  },
  "5.1.1.1": {
    "code": "5.1.1.1",
    "pt": "Florestas de sobreiro",
    "ru": "Леса пробкового дуба (сомкнутые sobreirais)",
    "en": "Cork oak closed forests",
    "isForest": true
  },
  "5.1.1.2": {
    "code": "5.1.1.2",
    "pt": "Florestas de azinheira",
    "ru": "Леса каменного дуба (azinhais)",
    "en": "Holm oak closed forests",
    "isForest": true
  },
  "5.1.1.3": {
    "code": "5.1.1.3",
    "pt": "Florestas de outros carvalhos",
    "ru": "Дубравы черешчатого, пиренейского и португальского дубов",
    "en": "Deciduous oak forests (pedunculate, Pyrenean, Portuguese)",
    "isForest": true
  },
  "5.1.1.4": {
    "code": "5.1.1.4",
    "pt": "Florestas de castanheiro",
    "ru": "Каштановые леса и рощи (soutos)",
    "en": "Sweet chestnut forests & groves (soutos)",
    "isForest": true
  },
  "5.1.1.5": {
    "code": "5.1.1.5",
    "pt": "Florestas de alfarrobeira",
    "ru": "Леса и рощи рожкового дерева (alfarrobais)",
    "en": "Carob tree forests and groves",
    "isForest": true
  },
  "5.1.1.6": {
    "code": "5.1.1.6",
    "pt": "Florestas de eucalipto",
    "ru": "Эвкалиптовые леса и плантации",
    "en": "Eucalyptus forests & pulp plantations",
    "isForest": true
  },
  "5.1.1.7": {
    "code": "5.1.1.7",
    "pt": "Florestas de acácias",
    "ru": "Леса и заросли акаций",
    "en": "Acacia stands",
    "isForest": true
  },
  "5.1.1.8": {
    "code": "5.1.1.8",
    "pt": "Florestas de outras folhosas",
    "ru": "Леса других лиственных пород (бук, береза, черешня, ясень)",
    "en": "Other broadleaved forests (beech, birch, cherry, ash)",
    "isForest": true
  },
  "5.1.2.1": {
    "code": "5.1.2.1",
    "pt": "Florestas de pinheiro bravo",
    "ru": "Сосновые боры приморской сосны",
    "en": "Maritime pine forests",
    "isForest": true
  },
  "5.1.2.2": {
    "code": "5.1.2.2",
    "pt": "Florestas de pinheiro manso",
    "ru": "Леса сосны пинии (итальянская кедровая сосна)",
    "en": "Stone pine forests (umbrella pine)",
    "isForest": true
  },
  "5.1.2.3": {
    "code": "5.1.2.3",
    "pt": "Florestas de outras resinosas",
    "ru": "Леса других хвойных пород (кедры, пихты, кипарисы)",
    "en": "Other conifer forests (cedar, cypress, fir)",
    "isForest": true
  },
  "6.1.1.1": {
    "code": "6.1.1.1",
    "pt": "Matos",
    "ru": "Кустарниковые заросли (маки, вересковые пустоши)",
    "en": "Shrublands and Mediterranean maquis",
    "isForest": false
  },
  "7.1.1.1": {
    "code": "7.1.1.1",
    "pt": "Praias, dunas e areais interiores",
    "ru": "Внутренние пресноводные марши и болота",
    "en": "Inland freshwater marshes",
    "isForest": false
  },
  "7.1.1.2": {
    "code": "7.1.1.2",
    "pt": "Praias, dunas e areais costeiros",
    "ru": "Praias, dunas e areais costeiros",
    "en": "Praias, dunas e areais costeiros",
    "isForest": false
  },
  "7.1.2.1": {
    "code": "7.1.2.1",
    "pt": "Espaços rochosos",
    "ru": "Espaços rochosos",
    "en": "Espaços rochosos",
    "isForest": false
  },
  "7.1.3.1": {
    "code": "7.1.3.1",
    "pt": "Vegetação esparsa",
    "ru": "Vegetação esparsa",
    "en": "Vegetação esparsa",
    "isForest": false
  },
  "8.1.1.1": {
    "code": "8.1.1.1",
    "pt": "Pauis e turfeiras",
    "ru": "Соляные бассейны и солеварни",
    "en": "Salinas and active salt pans",
    "isForest": false
  },
  "8.1.2.1": {
    "code": "8.1.2.1",
    "pt": "Sapais",
    "ru": "Sapais",
    "en": "Sapais",
    "isForest": false
  },
  "9.1.1.1": {
    "code": "9.1.1.1",
    "pt": "Cursos de água naturais",
    "ru": "Реки и естественные водотоки",
    "en": "Rivers and natural watercourses",
    "isForest": false
  },
  "9.1.1.2": {
    "code": "9.1.1.2",
    "pt": "Cursos de água modificados ou artificializados",
    "ru": "Искусственные каналы",
    "en": "Canals and artificial water channels",
    "isForest": false
  },
  "9.1.2.1": {
    "code": "9.1.2.1",
    "pt": "Lagos e lagoas interiores artificiais",
    "ru": "Водохранилища и запруды",
    "en": "Reservoirs and artificial dams",
    "isForest": false
  },
  "9.1.2.2": {
    "code": "9.1.2.2",
    "pt": "Lagos e lagoas interiores naturais",
    "ru": "Естественные пресноводные озера и лагуны",
    "en": "Natural freshwater lakes and ponds",
    "isForest": false
  },
  "9.1.2.3": {
    "code": "9.1.2.3",
    "pt": "Albufeiras de barragens",
    "ru": "Albufeiras de barragens",
    "en": "Albufeiras de barragens",
    "isForest": false
  },
  "9.1.2.4": {
    "code": "9.1.2.4",
    "pt": "Albufeiras de represas ou de açudes",
    "ru": "Albufeiras de represas ou de açudes",
    "en": "Albufeiras de represas ou de açudes",
    "isForest": false
  },
  "9.1.2.5": {
    "code": "9.1.2.5",
    "pt": "Charcas",
    "ru": "Charcas",
    "en": "Charcas",
    "isForest": false
  },
  "9.2.1.1": {
    "code": "9.2.1.1",
    "pt": "Aquicultura",
    "ru": "Прибрежные лагуны",
    "en": "Coastal lagoons",
    "isForest": false
  },
  "9.3.1.1": {
    "code": "9.3.1.1",
    "pt": "Salinas",
    "ru": "Salinas",
    "en": "Salinas",
    "isForest": false
  },
  "9.3.2.1": {
    "code": "9.3.2.1",
    "pt": "Lagoas costeiras",
    "ru": "Lagoas costeiras",
    "en": "Lagoas costeiras",
    "isForest": false
  },
  "9.3.3.1": {
    "code": "9.3.3.1",
    "pt": "Desembocaduras fluviais",
    "ru": "Desembocaduras fluviais",
    "en": "Desembocaduras fluviais",
    "isForest": false
  },
  "9.3.4.1": {
    "code": "9.3.4.1",
    "pt": "Oceano",
    "ru": "Океан и прибрежные морские воды",
    "en": "Ocean and marine waters",
    "isForest": false
  }
};

  return DATA;
});
