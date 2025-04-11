// https://www.youtube.com/watch?v=SFiNibl0F5U
// http://geojson.io/#map=2/20.0/0.0

window.onload = init;
function init() {
    const map = new ol.Map({
        view: new ol.View({
            center: ol.proj.fromLonLat([  16.04114482475069,
                59.0816253103778 ]),
            zoom: 17,
            maxZoom: 19,
            minZoom: 5,
        }),
        target: "js-map"
    });

    const openStreetMapHumanitarian = new ol.layer.Tile({
        source: new ol.source.OSM({
            url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        }),
        visible: true,
        title: "OSMHumanitarian"
    });


    // Map Layer
    const baseLayerGroup = new ol.layer.Group({
        layers: [openStreetMapHumanitarian]

    })

    map.addLayer(openStreetMapHumanitarian);
    // Vector Layer
    // http://geojson.io/#map=2/20.0/0.0

    const pathStyle = new ol.style.Stroke({
        color: [46, 45, 45],
        width: 5,

        // path info 
    })
    const strokeStyle = new ol.style.Stroke({
        color: [46, 45, 45, 1],
        width: 2,

        // General info 
    })
    const circleStyle = new ol.style.Circle({
        fill: new ol.style.Fill({
            color: [255, 102, 0]
        }),
        radius: 8,
        stroke: strokeStyle,



        // For pins
    })
    const picturePinStyle = new ol.style.Circle({
        fill: new ol.style.Fill({
            color: [55, 22, 222]
        }),
        radius: 8,
        stroke: strokeStyle,

        // Picture pins
    });

    const infoHikeStart = new ol.style.Circle({
        fill: new ol.style.Fill({
            color: [55, 222, 222]
        }),
        radius: 8,
        stroke: strokeStyle,

        // Info pin
    });


    const popup = document.getElementById('popup');
    const overlay = new ol.Overlay({
        element: popup,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

    map.addOverlay(overlay);


    const pathLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: 'https://localhost:7040/api/hike',
            format: new ol.format.GeoJSON()
        }),
        style: function (feature) {
            const type = feature.getGeometry().getType();
            const markerType = feature.get('markerType');

            if (type === 'Point') {
                if (markerType === 'photo') {
                    return new ol.style.Style({
                        image: picturePinStyle
                    });
                } else {
                    return new ol.style.Style({
                        image: circleStyle
                    });
                }
            }
            if (type === 'LineString') {
                return new ol.style.Style({
                    stroke: pathStyle
                });
            }
        },
        visible: false,
    });
    map.addLayer(pathLayer);

    const initialZoom = map.getView().getZoom();
    if (initialZoom >= 12) {
        pathLayer.setVisible(true);
    } else {
        pathLayer.setVisible(false);
    }

    map.on('singleclick', function (evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feat) {
            return feat;
        });
        popup.style.display = 'none';
        overlay.setPosition(undefined);

        if (!feature) return;

        const coordinate = evt.coordinate;
        const markerType = feature.get('markerType');
        const title = feature.get('title') || "No Title";
        const date = feature.get('Date') || "";
        const imageUrl = feature.get('picture');
        const description = feature.get('description' || "");

        if (markerType === 'photo') {
            popup.innerHTML =
                `
            <strong style="font-size: 1vw; white-space: nowrap;">${title}</strong><br>
            <strong style="font-size: 1vw;">${date}</strong><br>
            <strong style="font-size: 1vw;">${description}</strong><br>
                <img src="${imageUrl}" alt="Photo" style="max-width:450px; max-height:550px; margin-top:5px;">
            `;
        } else if (markerType === 'point') {
            popup.innerHTML =
                `
             <strong style="font-size: 1vw; white-space: nowrap;">${title}</strong><br>
            <strong style="font-size: 1vw;">${date}</strong><br>
                        <strong style="font-size: 1vw;">${description}</strong><br>

            `;
        }
        else {
            return false
        }
        // Show and position popup
        popup.style.display = 'block';
        overlay.setPosition(coordinate);
    });

    const EssingeIslandsGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: 'https://localhost:7040/api/hike',
            format: new ol.format.GeoJSON()
        }),
        visible: false,
        title: 'Essingen',
        style: function (feature) {
            const type = feature.getGeometry().getType();
            const markerType = feature.get('markerType');

            if (type === 'Point') {
                if (markerType === 'photo') {
                    return new ol.style.Style({
                        image: picturePinStyle

                    });
                } else {
                    return new ol.style.Style({
                        image: circleStyle
                    });
                }
            }

            if (type === 'LineString') {
                return new ol.style.Style({
                    stroke: pathStyle
                });
            }
        }
    })
    map.addLayer(EssingeIslandsGeoJSON);

    map.getView().on('change:resolution', function () {
        const zoom = map.getView().getZoom();
        if (zoom < 12 && !map.get('zoomPinShown')) {
            showZoomOutPin();
            map.set('zoomPinShown', true);
        } else if (zoom >= 12 && map.get('zoomPinShown')) {
            removeZoomOutPin();
            map.set('zoomPinShown', false);
        }
    });
}