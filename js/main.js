window.onload = function () {
  /* Data points defined as a mixture of WeightedLocation and LatLng objects */
   heatMapData = [
    {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5}
  ];

  var centerpoint = new google.maps.LatLng(37.774546, -122.433523);

  map = new google.maps.Map(document.getElementById('map'), {
    center: centerpoint,
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatMapData
  });
  heatmap.setMap(map);

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', async function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];
    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
    console.log("Latitude: " + bounds.f.b);
    console.log("Longitude: " + bounds.b.b);

    //let tweets = await getTweets(bounds.f.b, bounds.b.b);

    //console.log(tweets);
    //setupMap(tweets.trend[0].getTone(), bounds.f.b, bounds.b.b);
    setupMap(new ToneObject(0.2, 0.3, 0.4, 0.5), bounds.f.b, bounds.b.b);
  });

};

function setupMap(averages, lat, long) {
  console.log("Setting up the map...");
  console.log(lat);
  console.log(long);
  console.log(averages);
  heatMapData.push({location: new google.maps.LatLng(lat, long), weight: 4});
  heatMapData.push({location: new google.maps.LatLng(lat++, long++), weight: 4});
  console.log(heatMapData);


  console.log("Map refreshed.");
}
