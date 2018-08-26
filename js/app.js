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
    lat: "55",
    lng: "-55"
  },
  img: "",
  genres: ["Mexican", "Italian", "Japanese"]
},
{
  name: "Place 2",
  location: {
    lat: "55",
    lng: "-55"
  },
  img: "",
  genres: ["Pizza"]
},
{
  name: "Place 3",
  location: {
    lat: "55",
    lng: "-55"
  },
  img: "",
  genres: ["Chinese", "Peruvian"]
},
{
  name: "Place 4",
  location: {
    lat: "55",
    lng: "-55"
  },
  img: "",
  genres: ["Chinese", "Peruvian"]
},
{
  name: "Place 5",
  location: {
    lat: "55",
    lng: "-55"
  },
  img: "",
  genres: ["Chinese", "Peruvian"]
},
{
  name: "Place 6",
  location: {
    lat: "55",
    lng: "-55"
  },
  img: "",
  genres: ["Chinese", "Peruvian"]
}
];





// viewmodel:
//   add new list item to page
//   add new list item to savedPlaces

var ViewModel = function() {

  var self = this;

  // Define lunch search start observable
  this.startingPoint = ko.observable();

// Define lunch options observable array
  this.lunchList = ko.observableArray([]);

  initialLunch.forEach(function(item) {
    self.lunchList.push(item);
  });

  this.selectedSpot = ko.observable(this.lunchList()[0]);

  this.geoLocater = function() {
    var x = geolocateMe();
    console.log(x);
    this.startingPoint(x);
  }

  // Define manual search input
  this.manualSearch = ko.observable();

  this.manualLocater = function() {
    var x = manualLocateMe(this.manualSearch());
    console.log(x);
    this.startingPoint(x);
  }

  // Function to add new lunch option
  this.addOption = function() {

  };


  this.selectedSpot = function(selected) {
    // set current cat to cat of item clicked
    self.currentSpot(selected);
    console.log(this);
  }

}

ko.applyBindings(new ViewModel())