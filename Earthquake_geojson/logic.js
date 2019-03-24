// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><h3>" + feature.properties.mag + " magnitude" +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      },
    //use point to layer function to get circle markers
    pointToLayer: function(feature, latlng) {
      return new L.circle(latlng, {
        radius: getCir(feature.properties.mag),
        fillColor: getColors(feature.properties.mag),
        fillOpacity: 0.75,
        color: "black",
        stroke: true,
        weight: 0.5
      })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

//function to get circle size based on earthquake magnitude
function getCir(mag) {
  return mag * 20000
};

//function to get colors based on earthquake magnitude
function getColors(mag) {
  if (mag > 5) {
    return "red"
  } else if (mag > 4) {
    return "orangered" 
  } else if (mag > 3) {
    return "yellow"
  } else if (mag > 2) {
    return "yellowgreen" 
  } else if (mag > 1) {
    return "green"
  } else {
    return "lightgreen"
  }
};

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Grey Scale": light,
    "Outdoors": outdoors,
    "Satellite": satellite
  };

  //create tectonic plates layer
  var tectonicPlates = new L.LayerGroup();
  //add tectonic plates data
  d3.json(tectUrl, function(tectData){
    L.geoJSON(tectData, {
      color: "orange",
      weight: 2
    })
    .addTo(tectonicPlates);
  });

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [light, earthquakes, tectonicPlates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend");
    magnitude = [0, 1, 2, 3, 4, 5],
    labels = ['<strong>Magnitude</strong><br>'];

    //loop through magnitudes 
    for (var m = 0; m < magnitude.length; m++) {
      div.innerHTML +=
      labels.push(
        '<m style="background:' + getColors(magnitude[m] + 1) + '"></m> ' + 
        magnitude[m] + (magnitude[m + 1] ? '&ndash;' + magnitude[m + 1] + '<br>' : '+'));
    }
    div.innerHTML = labels.join(" ");
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
}


