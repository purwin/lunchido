// get start point

// get first rando open place

// determine if it's within 15 mins

// get:
// name,
// location,
// food type,
// price,
// reviews,
// photos,
// distance in time

// add it to list

// if perfect:
// give directions

// if not:
//   update search params
//   run search function




// search params (updated throughout):
// maxPrice (3 at first)
// excludeType (empty at first)
// maxDistance (15min at first)



// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map, infoWindow, bounds;

var form_addr;

// Create map
function initMap() {
  var styles = [
    {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ];

  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 39.952583, lng: -75.165222},
    zoom: 15,
    mapTypeControl: false,
    styles: styles
  });
  bounds = new google.maps.LatLngBounds();

  infoWindow = new google.maps.InfoWindow;
}

// Set map based on text input
function manualLocateMe(address) {
  // Initialize the geocoder.
  var geocoder = new google.maps.Geocoder();
  // Make sure the address isn't blank.
  if (address == '') {
    window.alert("You gotta enter an address or location!");
  } else {
    // Geocode the address/area entered to get the center. Then, center the map
    // on it and zoom in
    geocoder.geocode(
      { address: address,
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
          // Store lat/lng coordinates
          var lunchCoordinates = {
            lat: results[0].geometry.location.lat(),
            long: results[0].geometry.location.lng()
          }
          console.log(lunchCoordinates);

          // Create a marker
          var startMarker = createMarker(results[0].geometry.location, "Lunch start");
          console.log(startMarker);
          // // Create an onclick event to open the large infowindow at each marker.
          // marker.addListener('click', function() {
          //   populateInfoWindow(this, largeInfowindow);
          // });
          // // Two event listeners - one for mouseover, one for mouseout,
          // // to change the colors back and forth.
          // marker.addListener('mouseover', function() {
          //   this.setIcon(highlightedIcon);
          // });
          // marker.addListener('mouseout', function() {
          //   this.setIcon(defaultIcon);
          // });
          form_addr = results[0].formatted_address;
          console.log(form_addr);
          return "HEY!";
        } else {
          window.alert("Couldn’t find that location. Try being more specific.");
        }
      });
  }
}

// Function: Set map based on geolocation
function geolocateMe() {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var startMarker = createMarker(pos, "Lunch start");

      map.setCenter(pos);
      bounds.extend(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
    return map.getCenter();
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        "Error: The Geolocation service failed." :
                        "Error: Your browser doesn’t support geolocation.");
  infoWindow.open(map);
}

// Function: Create a marker, add click events, re-fit the map based on the added markers, and add marker to the map
function createMarker(position, title) {
  var marker = new google.maps.Marker({
    position: position,
    map: map,
    title: title,
    animation: google.maps.Animation.DROP,
  });
  // Add click event to display marker info window
  marker.addListener('click', function() {
    populateInfoWindow(this, infoWindow);
  });

  bounds.extend(marker.position);
  return marker;
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}


function addLunch(location) {
  console.log(location.location);
  var newMarker = createMarker(location.location, location.name);
  map.fitBounds(bounds);
}


// Adapted from Udacity https://github.com/udacity/ud864
// This function allows the user to input a desired travel time, in
// minutes, and a travel mode, and a location - and only show the listings
// that are within that travel time (via that travel mode) of the location
function searchWithinTime() {
  // Initialize the distance matrix service.
  var distanceMatrixService = new google.maps.DistanceMatrixService;
  var address = document.getElementById("search-within-time-text").value;
  // Check to make sure the place entered isn't blank.
  if (address == "") {
    window.alert("You must enter an address.");
  } else {
    hideListings();
    // Use the distance matrix service to calculate the duration of the
    // routes between all our markers, and the destination address entered
    // by the user. Then put all the origins into an origin matrix.
    var origins = [];
    for (var i = 0; i < markers.length; i++) {
      origins[i] = markers[i].position;
    }
    var destination = address;
    var mode = document.getElementById("mode").value;
    // Now that both the origins and destination are defined, get all the
    // info for the distances between them.
    distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        window.alert("Error: " + status);
      } else {
        displayMarkersWithinTime(response);
      }
    });
  }
}