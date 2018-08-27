// knockout.js file

// model:
//   startingPoint
//   lunchOptions
//   savedPlaces
//   searchParams
initialLunch = [
{
  name: "Place 1",
  location: {
    lat: 40.7579854,
    lng: -73.8829541
  },
  img: "",
  types: ["Mexican", "Italian", "Japanese"]
},
{
  name: "Place 2",
  location: {
    lat: 40.7589512,
    lng: -73.88882869999998
  },
  img: "",
  types: ["Pizza"]
},
{
  name: "Place 3",
  location: {
    lat: 40.7478344,
    lng: -73.8820584
  },
  img: "",
  types: ["Chinese", "Peruvian"]
},
{
  name: "Place 4",
  location: {
    lat: 39.952588,
    lng: -75.16522199999981
  },
  img: "",
  types: ["Chinese", "Peruvian"]
}
];


// viewmodel:
//   add new list item to page
//   add new list item to savedPlaces

var ViewModel = function() {

  var self = this;

  // Define lunch starting point observable
  this.startingPoint = ko.observable({
    address: "Jackson Heights, Queens, NY, USA",
    lat: 40.7556818,
    lng: -73.8830701
  });

  // Define non-observable storage of potential lunch options
  this.lunchSearch = ko.observableArray([]);

// Define lunch options observable array
  this.lunchList = ko.observableArray([]);

  // Define manual search input
  this.manualSearch = ko.observable();

  initialLunch.forEach(function(item) {
    self.lunchList.push(item);
  });

  this.selectedSpot = ko.observable(this.lunchList()[0]);

  // Function to use geolocation for Google Maps starting point
  this.geoLocater = function() {
    var x = geolocateMe();
    console.log(x);
    self.startingPoint(x);
  }

  // Function to manually search for Google Maps starting point
  this.manualLocater = function() {
    console.log(this.manualSearch());
    var x = manualLocateMe(this.manualSearch());
    console.log(x);
    this.startingPoint(x);
  }

  // Function to add new lunch option
  this.addOption = function(selected) {
    // console.log(selected);
    addLunch(selected);
  };

  // Function to highlight selected lunch option in list, show location on the map
  this.selectedSpot = function(selected) {
    // set current lunch item to clicked item
    self.currentSpot(selected);
    // Run map function to show relevant marker and info window
  }

  // Function to pull lunch options from FourSquare API
  this.getLunchData = function() {
    var fourSquareAPI = "https://api.foursquare.com/v2/venues/explore";
    // JSON request
    console.log("Searching " + self.startingPoint().lat.toString() + ", " + self.startingPoint().lng.toString());
    $.getJSON( fourSquareAPI, {
      // Pull relevant data from the API
      client_id: "RGJIQWJAUURIHR1SSJUTQFKQYXL3RFO34MFEWPBBAFUALZ2B",
      client_secret: "2CA2UTR0RRAGVLIDRSUL20XK4YHY554Z0UKYYZCQ0IVLJKCA",
      ll: self.startingPoint().lat + "," + self.startingPoint().lng,
      v: '20180827',
      query: "lunch",
      limit: "50",
      openNow: "1",
      price: "1,2,3",
      format: "json"
    })
    .done(function(data) {
      data.response.groups[0].items.forEach(function(item) {
        // Add found items to self.lunchSearch list
        self.lunchSearch.push({
          type: item.venue.categories[0].shortName,
          venueID: item.venue.id,
          lat: item.venue.location.lat,
          lng: item.venue.location.lng,
          name: item.venue.name,
          shortAddress: item.venue.location.address
          });
      });
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log( "Request Failed: " + err );
    });
    console.log(self.lunchSearch());
  }

  // Function to get a lunch option, add it to observableArray
  this.getLunch = function() {
    console.log(self.lunchSearch());
    var x = [1, 2, 3];
    console.log(x.shift());
    // this.lunchList.push(self.lunchSearch[]);
    // if this.lunchList().length < 5...
    // while false:
    // get random item from getLunchData, pop item
    // Check item against excluded parameters
    // if so, return true
    // add item to this.lunchList
  }

}

ko.applyBindings(new ViewModel())