// Create our map object
var myMap = L.map("mapid", {
    center: [
        0, 0
    ],
    zoom: 2
});

// Define satellite map layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
}).addTo(myMap);

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {

    console.log(data.features)

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
        L.circleMarker([d['geometry']['coordinates'][1], d['geometry']['coordinates'][0]], { color: color_arr, radius: d['properties']['mag'] ** 1.85 }).bindPopup(`Location: ${d['properties']['place']}<br>Magnitude: ${d['properties']['mag']}`).openPopup().addTo(myMap)

    });

});

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