// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

console.log(queryUrl)
// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p>Magnitude: " + feature.properties.mag + "</p>" + "<p>Depth: " + feature.geometry.coordinates[2] + "</p>");
    }

    // Function that will determine the color of circle based on altitude
    function chooseColor(alt) {
        if (alt <= 10) { return "rgb(74, 183, 255)" }
        else if (alt > 10 && alt <= 30) { return "rgb(74, 255, 189)" }
        else if (alt > 30 && alt <= 50) { return "rgb(31, 217, 22)" }
        else if (alt > 50 && alt <= 70) { return "rgb(245, 170, 7)" }
        else if (alt > 70 && alt <= 90) { return "rgb(245, 86, 7)" }
        else if (alt > 90) { return "rgb(191, 6, 24)" }
    }

    function pointFunction(feature, layer) {
        console.log(feature.geometry.coordinates[2])
        return L.circleMarker(layer, {
            radius: feature.properties.mag * 10,
            color: chooseColor(feature.geometry.coordinates[2])
        });
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature, //add popups
        pointToLayer: pointFunction // add circles

    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Outdoors": outdoors,
        "Satellite": satellite
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        // "Tectonic plates": tectonicplates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

// Set up the legend
var legend = L.control({ position: "bottomleft" });
legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Depth</h4>";
    div.innerHTML += `<i style="background: rgb(74, 183, 255)"></i><span>-10 to 10</span><br>`;
    div.innerHTML += `<i style="background: rgb(74, 255, 189)"></i><span>10 to 30</span><br>`;
    div.innerHTML += `<i style="background: rgb(31, 217, 22)"></i><span>30 to 50</span><br>`;
    div.innerHTML += `<i style="background: rgb(245, 170, 7)"></i><span>50 to 70</span><br>`;
    div.innerHTML += `<i style="background: rgb(245, 86, 7)"></i><span>70 to 90</span><br>`;
    div.innerHTML += `<i style="background: rgb(191, 6, 24)"></i><span>Deeper than 90</span><br>`;
    return div;
};

// Adding legend to the map
legend.addTo(myMap);

// Use this link to get the geojson data.
var link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// var tectonicplates;

// Grabbing our GeoJSON data..
d3.json(link).then(function (data) {
    // Creating a GeoJSON layer with the retrieved data
    L.geoJson(data).addTo(myMap);
});