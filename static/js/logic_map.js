// Assigning the url to pull the geojson from
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Creating our map object
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
  });

// Creating our tile layer, which is our map base 
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

// Since the size of our markers will be proportionate to the magnitude of the earthquake, we will create a function that returns a number based on the magnitude
function markerSize (magnitude){
    return Math.sqrt(magnitude)*10;
}

// The color of the marker depends on the depth of the earthquake. I've pulled the ranges directly from the map screenshot
function chooseColor(depth) {
    if (depth >= -10 && depth <= 10) {
      return "#1a9850";
    } else if (depth > 10 && depth <= 30) {
      return "#91cf60";
    } else if (depth > 30 && depth <= 50) {
      return "#d9ef8b";
    } else if (depth > 50 && depth <= 70) {
      return "#fee08b";
    } else if (depth > 70 && depth <= 90) {
      return "#fc8d59";
    } else {
      return "#d73027";
    }
  }

// Using D3 to display the geojson data on the console
d3.json(url).then(function(data){
    console.log(data);
    createFeatures(data); // This function will create our map markers, and legend
});

// This is the function that is called in our console
function createFeatures(earthquakeData) {

    // Creating a function to add a pop up element to each marker
    function addPopups(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // For our markers to appear as circles, we create those properties in this function
    function makeCircle(feature, latlng) {
        let circleMarkerOptions = {
            radius: markerSize(feature.properties.mag), // Calling our marker size function
            fillColor: chooseColor(feature.geometry.coordinates[2]), // Calling our choose color function
            color: "black", // Border color of the circle
            weight: 1, // Border weight
            opacity: 1, // Border opacity
            fillOpacity: 0.8, // Fill opacity
        };
        
        return L.circleMarker(latlng, circleMarkerOptions);
    }

    // Using GeoJSON on Leaflet to use the given data to add markers and popups to our map object
    L.geoJSON(earthquakeData, {
        pointToLayer: makeCircle,
        onEachFeature: addPopups,
      }).addTo(myMap);

    // Creating our legend object
    let legend = L.control({ position: 'bottomleft' });

    // Assigning labels and colors manually to make them appear in our legend
    const depthValues = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
    const colorCodes = ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"];

    // Function to generate the legend HTML content
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            labels = [];
      
        // Loop through depth ranges and generate labels
        for (let i = 0; i < depthValues.length; i++) {
            let color = colorCodes[i];
            labels.push(`${depthValues[i]}`);
            div.innerHTML +=
              '<i style="background:' + color + '; width: 20px; height: 20px; display: inline-block;"></i> ' +
              depthValues[i] + '<br>';
        }
        return div;
    };
      
    // Add the legend to the map
    legend.addTo(myMap);

    // Add a title for the legend
    legend.getContainer().innerHTML = '<h4>Depth Legend</h4>' + legend.getContainer().innerHTML;
}
