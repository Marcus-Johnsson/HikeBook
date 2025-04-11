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

    const zoomOutPinSource = new ol.source.Vector();
    const zoomOutPinLayer = new ol.layer.Vector({
        source: zoomOutPinSource,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({ color: 'rgba(0, 123, 255, 0.8)' }),
                radius: 10,
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });
    map.addLayer(zoomOutPinLayer);
    zoomOutPinLayer.setVisible(false);


    function showZoomOutPin() {
        fetch('https://localhost:7040/api/hike')
        .then(response => response.json())
        .then(data => {
            
            console.log('GeoJSON data:', data);  // Log for debugging
            zoomOutPinSource.clear();
    
            data.features.forEach(feature => {
                console.log('Feature values:', feature.values);  // Log the values of each feature
    
                if (feature.geometry.type === 'LineString') {
                    const firstCoord = feature.geometry.coordinates[0];
                    const transformedCoord = ol.proj.fromLonLat([firstCoord[0], firstCoord[1]]);
    
                    // Safely access Title and Description from feature.values
                    const title = feature.properties ? feature.properties.title : 'Hike Start';
                    const description = feature.properties ? feature.properties.description : 'ss';
    
                    // Create a zoom-out pin at the first coordinate
                    const pin = new ol.Feature({
                        geometry: new ol.geom.Point(transformedCoord),
                        title: title,
                        description: description
                    });
    
                    pin.set('markerType', 'zoomoutpin');
                    zoomOutPinSource.addFeature(pin);
                }
            });
    
            zoomOutPinLayer.setVisible(true);
        })
        .catch(error => console.error('Error fetching data:', error));
    }

    function removeZoomOutPin() {
        zoomOutPinSource.clear();
        zoomOutPinLayer.setVisible(false);
    }

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
        const date = feature.get('Date') || "- -";
        const imageUrl = feature.get('picture');
        const description = feature.get('description' || "- -");
        const difficulty = feature.get('difficulty' || "- -");

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
        else if (markerType === 'zoomoutpin') {
            document.getElementById('hike-title').textContent = title;
        document.getElementById('hike-date').textContent = hike.date;
        document.getElementById('hike-season').textContent = hike.season;
        document.getElementById('hike-description').textContent = hike.description;
        document.getElementById('hike-difficulty').textContent = hike.difficulty;
        document.getElementById('hike-pathType').textContent = hike.pathType;
        document.getElementById('hike-length').textContent = hike.length;

        }
        else {
            return false
        }
        // Show and position popup
        popup.style.display = 'block';
        overlay.setPosition(coordinate);
    });

    map.on('singleclick', function (evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feat) {
            return feat;
        });
        if (!feature || !feature.getGeometry) return;
        const coord = evt.coordinate;
        const title = feature.get('title') || feature.get('Title') || 'No Title';
        const description = feature.get('description') || '';
    
        popup.innerHTML = `
            <strong style="font-size: 1vw;">${title}</strong><br>
            <span style="font-size: 1vw;">${description}</span>
        `;
        popup.style.display = 'block';
        overlay.setPosition(coord);
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
    pathLayer.getSource().on('change', function () {
        if (pathLayer.getSource().getState() === 'ready') {
            showZoomOutPin(); // Only show pins if zoom is low
        }
    });
    map.getView().on('change:resolution', function () {
        const zoom = map.getView().getZoom();
    
        // Toggle path visibility
        if (zoom >= 12) {
            pathLayer.setVisible(true);
        } else {
            pathLayer.setVisible(false);
        }
    
        // Toggle zoom-out pins
        if (zoom < 12 && !map.get('zoomPinShown')) {
            showZoomOutPin();
            map.set('zoomPinShown', true);
        } else if (zoom >= 12 && map.get('zoomPinShown')) {
            removeZoomOutPin();
            map.set('zoomPinShown', false);
        }
    });

    function updateHikeInfo(hike) {
        // Update the content of the info box with hike details
        document.getElementById('hike-title').textContent = hike.title;
        document.getElementById('hike-date').textContent = hike.date;
        document.getElementById('hike-season').textContent = hike.season;
        document.getElementById('hike-description').textContent = hike.description;
        document.getElementById('hike-difficulty').textContent = hike.difficulty;
        document.getElementById('hike-pathType').textContent = hike.pathType;
        document.getElementById('hike-length').textContent = hike.length;

    }
}