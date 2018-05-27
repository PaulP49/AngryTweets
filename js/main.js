window.onload = async function () {
  await initAutocomplete();
};

async function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13,
    mapTypeId: 'roadmap'
  });

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

    document.getElementById("loader").classList.add('spinner');

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

    let place = places[0];

    console.log(place);

    let func = async function() {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      let tweets = await getTweets(place.geometry.location.lat(), place.geometry.location.lng());

      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.

      let marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      });


      let trending = tweets.trend[0];

      RoundTone(trending.tone);

      var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">' + trending.trendName + '</h1>'+
        '<div id="bodyContent">'+
        '<p>Joy: ' + trending.tone.joyAverage * 100 + '% <br>' +
        'Anger: ' + trending.tone.angryAverage * 100 + '% <br>' +
        'Fear: ' + trending.tone.fearAverage * 100 + '% <br>' +
        'Sadness: ' + trending.tone.sadnessAverage * 100 + '% <br>' +
        'Analytical: ' + trending.tone.analyticalAverage * 100 + '% <br>' +
        'Criticism: ' + trending.tone.criticalAverage * 100 + '% <br>' +
        '</p>'+
        '</div>'+
        '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });

      markers.push(marker);



      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    };

    await func();

    document.getElementById("loader").classList.remove('spinner');

    map.fitBounds(bounds);
  });
}

function RoundTone(tone) {
  tone.joyAverage = tone.joyAverage.toFixed(2);
  tone.angryAverage = tone.angryAverage.toFixed(2);
  tone.fearAverage = tone.fearAverage.toFixed(2);
  tone.sadnessAverage = tone.sadnessAverage.toFixed(2);
  tone.analyticalAverage = tone.analyticalAverage.toFixed(2);
  tone.criticalAverage = tone.criticalAverage.toFixed(2);
}

