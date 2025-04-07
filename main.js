// https://www.youtube.com/watch?v=SFiNibl0F5U
// http://geojson.io/#map=2/20.0/0.0

window.onload = init;
function init() {
    const map = new ol.Map({
        view: new ol.View({
            center: ol.proj.fromLonLat([17.99000012504559, 59.32261248448822]),
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


    const popup = document.getElementById('popup');
    const popupImage = document.getElementById('popup-image');

    const overlay = new ol.Overlay({
        element: popup,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
        // Create a Layer for picture
    });
    map.addOverlay(overlay);

    map.on('singleclick', function (evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feat) {
            return feat;
        });

        // Always hide popup first
        popup.style.display = 'none';
        overlay.setPosition(undefined);

        if (!feature) return;

        const coordinate = evt.coordinate;
        const markerType = feature.get('markerType');
        const title = feature.get('title') || "No Title";
        const date = feature.get('date') || "";
        const imageUrl = feature.get('picture');


        if (markerType === 'photo') {
            popup.innerHTML = 
            `
            <strong style="font-size: 1vw; white-space: nowrap;">${title}</strong><br>
            <strong style="font-size: 1vw;">${date}</strong><br>
                <img src="${imageUrl}" alt="Photo" style="max-width:450px; max-height:550px; margin-top:5px;">
            `;
        } else {
            popup.innerHTML = 
            `
             <strong style="font-size: 1vw; white-space: nowrap;">${title}</strong><br>
            <strong style="font-size: 1vw;">${date}</strong><br>
            `;
        }

        // Show and position popup
        popup.style.display = 'block';
        overlay.setPosition(coordinate);
    });



    const EssingeIslandsGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: './data/vector_data/map.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible: true,
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







}