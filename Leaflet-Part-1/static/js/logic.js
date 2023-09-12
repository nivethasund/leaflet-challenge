let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// A function to determine the marker size based on the magnitude of the earthquake
function markerSize(magnitude) {
    return Math.sqrt(magnitude) * 10;
  }

function chooseColor(depth) {
    if (depth >= -10 && depth <=10){
        return "#0000FF";
    }
    else if (depth > 10 && depth <=30){
        return "#4B0082"
    }
    else if (depth > 30 && depth <=50){
        return "#8A2BE2"
    }
    else if (depth > 50 && depth <=70){
        return "#FF00FF"
    }
    else if (depth > 70 && depth <=90){
        return "#FF69B4"
    }
    else {
        return "#FF0000"
    }
}

d3.json(url).then(function(data) {
    console.log(data.features);    
    createFeatures(data.features);
});

  
function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function addPopups(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }
  
    function makeCircle(feature, latlng) {
        let circleMarkerOptions = {
            radius: markerSize(feature.properties.mag), // Adjust the radius based on magnitude
            fillColor: chooseColor(feature.geometry.coordinates[2]), // Fill color of the circle
            color: chooseColor(feature.geometry.coordinates[2]), // Border color of the circle
            weight: 1, // Border weight
            opacity: 1, // Border opacity
            fillOpacity: 0.8, // Fill opacity
        };
      return L.circleMarker(latlng, circleMarkerOptions)
    }
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData,  {
      pointToLayer:  makeCircle,
      onEachFeature: addPopups
      
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Create a legend control
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const depthLabels = ['-10 to 10', '10 to 30', '30 to 50', '50 to 70', '70 to 90', '90+'];

        // Loop through depth ranges and generate legend HTML
        for (let i = 0; i < depthLabels.length; i++) {
            const color = chooseColor((i + 1) * 20); // Adjust the depth values as needed
            div.innerHTML +=
                '<i style="background:' + color + '"></i> ' +
                depthLabels[i] + '<br>';
        }

        return div;
    };

    // Add the legend to the map
    legend.addTo(myMap);
  
  }
