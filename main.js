// import './style.css';
// import Map from 'ol/Map.js';
// import OSM from 'ol/source/OSM.js';
// import TileLayer from 'ol/layer/Tile.js';
// import View from 'ol/View.js';

const view = new ol.View({
  center: [6260273, 7968311],
  zoom: 6,
});

// OSM LAYER
const osm = new ol.layer.Tile({
  title: "osm",
  source: new ol.source.OSM(),
});


//Вытягиваем слои с геосервера
const wmsSource = new ol.source.TileWMS({
  url: "http://localhost:8080/geoserver/wms",
  params: {
    LAYERS: [
      "kama_basin:emergency_settlements_pnt",
      "kama_basin:emergency_settlements_sqr",
      "kama_basin:rivers",
      "kama_basin:water_objects",
      "kama_basin:kama_bassin",
    ],
    TILED: true,
  },
  serverType: "geoserver",
});

// Слои по отдельности для отображения на карте 
const settlementsPnt = new ol.layer.Tile({
  title: "settlements_pnt",
  source: new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/wms",
    params: {
      LAYERS: ["kama_basin:emergency_settlements_pnt"],
      TILED: true,
    },
    serverType: "geoserver",
  }),
});

const settlementsSqr = new ol.layer.Tile({
  title: "settlements_sqr",
  source: new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/wms",
    params: {
      LAYERS: ["kama_basin:emergency_settlements_sqr"],
      TILED: true,
    },
    serverType: "geoserver",
  }),
});

const rivers = new ol.layer.Tile({
  title: "rivers",
  source: new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/wms",
    params: {
      LAYERS: ["kama_basin:rivers"],
      TILED: true,
    },
    serverType: "geoserver",
  }),
});

const waterObjects = new ol.layer.Tile({
  title: "water_objects",
  source: new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/wms",
    params: {
      LAYERS: ["kama_basin:water_objects"],
      TILED: true,
    },
    serverType: "geoserver",
  }),
});

const kamaBasin = new ol.layer.Tile({
  title: "kama_basin",
  source: new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/wms",
    params: {
      LAYERS: ["kama_basin:kama_bassin"],
      TILED: true,
    },
    serverType: "geoserver",
  }),
});

//Вспомогательный прозрачный тайл для реализации cursor:pointer при наведении курсора на слой
const gsLayers = new ol.layer.Tile({
  source: wmsSource,
  opacity: 0
})

const typeSelect = document.getElementById("type"); // Переменная меню выбора площади/длины
const showSegments = document.getElementById("segments"); // Чекбокс "показать длину сегмента"
const clearPrevious = document.getElementById("clear"); // Чекбокс "очищать предыдущие измерения"

// Стили для всех элементов, которые появляются когда измеряешь на карте
const style = new ol.style.Style({
  fill: new ol.style.Fill({
    color: "rgba(255, 255, 255, 0.2)",
  }),
  stroke: new ol.style.Stroke({
    color: "rgba(0, 0, 0, 0.5)",
    lineDash: [10, 10],
    width: 2,
  }),
  image: new ol.style.Circle({
    radius: 5,
    stroke: new ol.style.Stroke({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255, 0.2)",
    }),
  }),
});

const labelStyle = new ol.style.Style({
  text: new ol.style.Text({
    font: "14px Calibri,sans-serif",
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new ol.style.Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    padding: [3, 3, 3, 3],
    textBaseline: "bottom",
    offsetY: -15,
  }),
  image: new ol.style.RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new ol.style.Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
  }),
});

const tipStyle = new ol.style.Style({
  text: new ol.style.Text({
    font: "12px Calibri,sans-serif",
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new ol.style.Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
    padding: [2, 2, 2, 2],
    textAlign: "left",
    offsetX: 15,
  }),
});

const modifyStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 5,
    stroke: new ol.style.Stroke({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    fill: new ol.style.Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
  }),
  text: new ol.style.Text({
    text: "Drag to modify",
    font: "12px Calibri,sans-serif",
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new ol.style.Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    padding: [2, 2, 2, 2],
    textAlign: "left",
    offsetX: 15,
  }),
});

const segmentStyle = new ol.style.Style({
  text: new ol.style.Text({
    font: "12px Calibri,sans-serif",
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new ol.style.Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
    padding: [2, 2, 2, 2],
    textBaseline: "bottom",
    offsetY: -12,
  }),
  image: new ol.style.RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new ol.style.Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
  }),
});

const segmentStyles = [segmentStyle];

const formatLength = function (line) { // Функция, считающая длину 
  const length = ol.sphere.getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " km";
  } else {
    output = Math.round(length * 100) / 100 + " m";
  }
  return output;
};

const formatArea = function (polygon) { // Функция, считающая площадь
  const area = ol.sphere.getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
  } else {
    output = Math.round(area * 100) / 100 + " m\xB2";
  }
  return output;
};

const source = new ol.source.Vector();// Создание источника векторной геометрии

const modify = new ol.interaction.Modify({// Переменная, которая добавляет возможность изменения уже нарисованной геометрии
  source: source,
  style: modifyStyle,
});

let tipPoint;// Точка когда измеряешь

function styleFunction(feature, segments, drawType, tip) { // Функция, которая в зависимости от геометрии и режима рисования дает стили векторным элементам
  const styles = [];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type || type === "Point") {
    styles.push(style);
    if (type === "Polygon") {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new ol.geom.LineString(geometry.getCoordinates()[0]);
    } else if (type === "LineString") {
      point = new ol.geom.Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new ol.geom.LineString([a, b]);
      const label = formatLength(segment);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new ol.geom.Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count]);
      count++;
    });
  }
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  if (
    tip &&
    type === "Point" &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

const vector = new ol.layer.Vector({ // Векторный слой, в котором происходят изменения когда начинаешь что либо измерять. Он помещается в map и остается там
  source: source,
  style: function (feature) {
    return styleFunction(feature, showSegments.checked);
  },
});

//карта
const map = new ol.Map({
  target: "map",
  layers: [
    osm,
    settlementsSqr,
    rivers,
    waterObjects,
    kamaBasin,
    settlementsPnt,
    gsLayers,
    vector
  ],
  view,
});

// =========================================================================

//Контейнер для таблицы в данными о слое
const infoBox = document.getElementById("info");

//Вывод информации о слое, на котором произошел клик
map.on("singleclick", function (evt) {
  if (!measure_active.classList.contains('active_m')) {
  infoBox.innerHTML = "";
  const viewResolution = /** @type {number} */ (view.getResolution());
  const url = wmsSource.getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    "EPSG:3857",
    { INFO_FORMAT: "application/json" }
  );
  if (url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          let dataFeatureProperties = data.features[0].properties;

          let attr = Object.entries(dataFeatureProperties);
          let content =
            "<span>Элемент карты</span><table class='table' id='content'>";
          content +=
            "<tr><td class='desc'>Слой:</td><td>" +
            data.features[0].id.split(".")[0] +
            "</td></tr>";

          for (let i = 0; i < attr.length; i++) {
            content +=
              "<tr><td class='desc'>" +
              attr[i][0] +
              "</td><td>" +
              attr[i][1] +
              "</td></tr>";
          }
          content += "</table>";
          document.getElementById("info").innerHTML = content;
          infoBox.style.display = "flex";
        } else {
          infoBox.style.display = "none";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        infoBox.style.display = "none";
      });
    } else {
      return
    }
  }
});
console.log(map.getLayers().array_[0] instanceof ol.layer.Tile)

const measure_active = document.querySelector('.measure_active')// кнопка, включающая режим измерения на карте
const delete_measure = document.querySelector('.delete_measure')// Удалить измерения

map.addInteraction(modify); //Добавляет возможность изменения нарисованной геометрии

let draw; 

function addInteraction() {// Функция, описывающая взаимодействие с картой при измерении 
  if (measure_active.classList.contains('active_m')) { // Если кнопка измерений активна, то взаимодействуем с картой 
  const drawType = typeSelect.value;
  const activeTip =
    "Click to continue drawing the " +
    (drawType === "Polygon" ? "polygon" : "line");
  const idleTip = "Click to start measuring";
  let tip = idleTip;
  draw = new ol.interaction.Draw({
    source: source,
    type: drawType,
    style: function (feature) {
      return styleFunction(feature, showSegments.checked, drawType, tip);
    },
  });
  draw.on("drawstart", function () {
    if (clearPrevious.checked) {
      source.clear();
    }
    modify.setActive(false);
    tip = activeTip;
  });
  draw.on("drawend", function () {
    modifyStyle.setGeometry(tipPoint);
    modify.setActive(true);
    map.once("pointermove", function () {
      modifyStyle.setGeometry();
    });
    
    tip = idleTip;
  });
  
  modify.setActive(true);
  map.addInteraction(draw);
} else { // Если не активна, то прерываем выполнение функции
  return  
}
}

// Изменение курсора на pointer
map.on("pointermove", function (evt) {
  if (evt.dragging) {
    return;
  } else if (measure_active.classList.contains('active_m')) {
    return
  }
  
  const data = gsLayers.getData(evt.pixel)
  const hit = data && data[3] > 0; // transparent pixels have zero for data[3]
  map.getTargetElement().style.cursor = hit ? "pointer" : "";
});

measure_active.addEventListener('click', () => {// Слушатель события клика по кнопке включения режима измерений
  measure_active.classList.toggle('active_m')// При нажатии на кнопку добавляет и убирает класс active
  if (measure_active.classList.contains('active_m')) { // Если есть класс active у кнопки, то включаем режим измерений 
    addInteraction()
  } else { // Если нет active, то выключаем режим рисования
    map.removeInteraction(draw);
  }
})

delete_measure.addEventListener('click', () => {// Удаление измерений с карты
  source.clear()
})

typeSelect.onchange = function () { // Изменение типа геометрии для измерения
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();

showSegments.onchange = function () {
  vector.changed();
  draw.getOverlay().changed();
};
//Создание легенды
const updateLegend = function (resolution) {
  const wmsLayers = wmsSource.params_.LAYERS;
  let legendContent = "";

  for (let i = 0; i < wmsLayers.length; i++) {
    let picLegend = new ol.source.TileWMS({
      url: "http://localhost:8080/geoserver/wms",
      params: {
        LAYERS: [wmsLayers[i]],
        TILED: true,
      },
      serverType: "geoserver",
    });

    console.log(picLegend)
    
    const graphicUrl = picLegend.getLegendUrl(resolution);
    const layerName = picLegend.getParams().LAYERS[0].split(":").pop();

    legendContent += `<div class="legend-element"><img src="${graphicUrl}"> <span>${layerName}</span></div>`;
  }

  document.getElementById("legend-items").innerHTML = legendContent;
};

// Самовызывающаяся функция создания и выведения чекбоксов для видимости/невидимости слоя
const checkboxInit = function() {
  const checkboxContainer = document.getElementById('checkboxes');
  const mapLayers = map.getLayers().array_

  for (let i = 0; i < mapLayers.length; i++) {
    const check = document.createElement('input')
    check.type = 'checkbox'
    check.checked = 'true'
    check.id = mapLayers[i].values_.title
    check.className = 'vis_check'
    checkboxContainer.append(check)
    check.addEventListener('change', () => {
      mapLayers[i].setVisible(!mapLayers[i].getVisible())
    })
  }

  document.querySelectorAll('.vis_check').forEach((el) => {
    if (el.id === 'osm' || el.id === 'undefined') {
      el.remove()
    } else {
      null
    }
  })
}()

// Самовызывающаяся функция создания ползунков прозрачности слоя
const opacitiesInit = function() {
  const opacitiesContainer = document.getElementById('opacities');
  const mapLayers = map.getLayers().array_

  for (let i = 0; i < mapLayers.length; i++) {
    const range = document.createElement('input')
    range.type = 'range'
    range.min = 0
    range.max = 1
    range.step = 0.01
    range.id = mapLayers[i].values_.title + "_range"
    const vislabel = document.createElement('label')
    vislabel.id = range.id + '_label'
    vislabel.className = 'vislabel'
    vislabel.for = range.id
    vislabel.textContent = mapLayers[i].values_.title;
    range.className = 'vis_range'
    opacitiesContainer.append(vislabel)
    opacitiesContainer.append(range)
    range.addEventListener('input', () => {
      let opacity = parseFloat(range.value) 
      mapLayers[i].setOpacity(opacity)
    })
  }

  document.querySelectorAll('.vis_range').forEach((el) => {
    if (el.id === 'osm_range' || el.id === 'undefined_range') {
      el.remove()
    } else {
      null
    } 
  })

  document.querySelectorAll('.vislabel').forEach((el) => {
    if (el.id === 'osm_range_label' ||  el.id === 'undefined_range_label') {
      el.remove()
    } else {
      null
    }
  })
}()

//Кнопка для открытия окна с ползунками прозрачности
const opacityButton = document.getElementById('op_button');
opacityButton.addEventListener('click', () => {
  document.getElementById('opacities').classList.toggle('hidden');
  opacityButton.classList.toggle('active')
})

const resolution = map.getView().getResolution();
updateLegend(resolution);

map.getView().on("change:resolution", function (event) {
  const resolution = event.target.getResolution();
  updateLegend(resolution);
});

const openMeasuresButton = document.querySelector('.open-measures_button');
const measuresContainer = document.getElementById('measures');

openMeasuresButton.addEventListener('click', () => {
  measuresContainer.classList.toggle('opened')
  openMeasuresButton.classList.toggle('active')
  if (!openMeasuresButton.classList.contains('active')) {
    map.removeInteraction(draw)
    measure_active.classList.remove('active_m')
    source.clear()
  } else {
    null
  }
})
