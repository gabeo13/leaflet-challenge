// Define three map layers
var satmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

// Create our map object
var myMap = L.map("mapid", {
    center: [
        0, 0
    ],
    zoom: 2,
    layers: [satmap, lightmap, outdoormap]
});


// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Store tectonic plates url to a variable

var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"


// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {

    // Define arrays to hold created city and state markers
    var quakeMarkers = [];

    console.log(data['features'])

    // Iterate through json and construct markers
    data['features'].forEach(d => {


        //Build Color Map for coloring on depth
        var color_arr = ""
        if (d['geometry']['coordinates'][2] > 90) {
            color_arr = '#c0392b'
        }
        else if (d['geometry']['coordinates'][2] > 70) {
            color_arr = '#e74c3c'
        }
        else if (d['geometry']['coordinates'][2] > 50) {
            color_arr = '#d35400'
        }
        else if (d['geometry']['coordinates'][2] > 30) {
            color_arr = '#f39c12'
        }
        else if (d['geometry']['coordinates'][2] > 10) {
            color_arr = '#f1c40f'
        }
        else {
            color_arr = '#2ecc71'
        }

        //Add Circle Markers, size on magnitude, color on depth, bind info popup on click
        quakeMarkers.push(L.circleMarker([d['geometry']['coordinates'][1], d['geometry']['coordinates'][0]], { color: color_arr, radius: d['properties']['mag'] ** 1.85 }).bindPopup(`Location: ${d['properties']['place']}<br>Magnitude: ${d['properties']['mag']}`).openPopup());

    });

    //Hit tectonic plate api and push to array for layer control
    d3.json(platesURL).then(function (plates) {

        // var plateMarkers = [];

        // plates['features'].forEach(d => {
        //     plateMarkers.push(L.polygon([d['geometry']['coordinates']]), { color: 'red' });
        // });

        var plateMarkers = L.geoJson(plates, {
            style: function (feature) {
                return {
                    color: '#34495e',
                    fillColor: 'white',
                    fillOpacity: 0
                }
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup("Plate Name: " + feature.properties.PlateName)
            }
        }).addTo(myMap);

        // Create base layers
        var baselayer = {
            'Satellite Map': satmap,
            'Light Map': lightmap,
            'Outdoor Map': outdoormap
        };

        console.log(plateMarkers);
        console.log(quakeMarkers);

        // Create two separate layer groups below. One for earthquake markers, and one for plate data
        var quakeLayer = new L.layerGroup(quakeMarkers)
        // var plateLayer = new L.layerGroup(plateMarkers)

        // Create an overlayMaps object here to contain the "State Population" and "City Population" layers

        var overlayLayers = {
            'Earthquakes': quakeLayer,
            'Tectonic Plates': plateMarkers
        };

        // Create a layer control, containing our baseMaps and overlayMaps, and add them to the map
        L.control.layers(baselayer, overlayLayers,
            {
                'collapsed': false
            }).addTo(myMap)


        // Add legend, see CSS for Styling
        var legend = L.control({ position: "bottomleft" });

        legend.onAdd = function (myMap) {
            var div = L.DomUtil.create("div", "legend");
            div.innerHTML += "<h4>Depth of Event (km)</h4>";
            div.innerHTML += '<i style="background: #2ecc71"></i><span>0-10km</span><br>';
            div.innerHTML += '<i style="background: #f1c40f"></i><span>10-30km</span><br>';
            div.innerHTML += '<i style="background: #f39c12"></i><span>30-50km</span><br>';
            div.innerHTML += '<i style="background: #d35400"></i><span>50-70km</span><br>';
            div.innerHTML += '<i style="background: #e74c3c"></i><span>70-90km</span><br>';
            div.innerHTML += '<i style="background: #c0392b"></i><span>90+ km</span><br>';

            return div;
        };

        legend.addTo(myMap);

    });

});