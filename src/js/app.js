// Knockout.js file

import * as googmaps from "./maps";
import ko from './knockout-3.4.2.js';

var ViewModel = function() {

  var self = this;

  // Stored FourSquare API info
  this.fourSquareAPI = {
    url: "https://api.foursquare.com/v2/venues/",
    client_id: "RGJIQWJAUURIHR1SSJUTQFKQYXL3RFO34MFEWPBBAFUALZ2B",
    client_secret: "2CA2UTR0RRAGVLIDRSUL20XK4YHY554Z0UKYYZCQ0IVLJKCA"
  }

  this.searching = ko.observable(false);

  // Lunch starting point observable
  this.startingPoint = ko.observable(false);

  // General exclusion parameters
  this.excludeParams = ko.observable({
    count: 5,
    distance: null,
    types: [],
    price: 3
  })

  // Array of potential lunch options pulled from the FourSquare API
  this.lunchSearch = ko.observableArray([]);

  // Lunch options observable array (max = this.excludeParams().count)
  this.lunchList = ko.observableArray([]);

  // Manual search input
  this.manualSearch = ko.observable();

  // Selected lunch spot
  this.currentSpot = ko.observable();

  //Give user notifications
  this.notice = ko.observable();

  // Display results
  this.results = {
    start: ko.observable(false),
    lunch: {
      name: ko.observable(false),
      address: ko.observable(false)
    },
    time: ko.observable(false),
    mode: ko.observable(false),
    directions: ko.observableArray([])
  };



  // Function to use geolocation for Google Maps starting point
  this.geoLocater = function() {
    // Set startingPoint to null
    self.searching(true);
    // Get lat, lng, and address from Google Maps geolocate function
    googmaps.geolocateMe(function(data) {
      console.log("geoLocater: starting point: " + JSON.stringify(data));
      // Set starting point details to returned object
      self.startingPoint(data);
    });
  };

  // Function to manually search for Google Maps starting point
  this.manualLocater = function() {
    // Set startingPoint to null
    self.searching(true);
    // Get lat, lng, and address from Google Maps manual locate function
    googmaps.manualLocateMe(this.manualSearch(), function(data) {
      console.log("manualLocater: starting point: " + JSON.stringify(data));
      // Set starting point details to returned object
      self.startingPoint(data);
    });
  };

  // Function to highlight selected lunch option in list, show location on the map
  this.selectSpot = function(selected) {
    // set current lunch item to clicked item
    self.currentSpot(selected);
    // Run map function to show relevant marker and info window
    googmaps.selectLunch(selected);
  };

  // Function to pull lunch options from FourSquare API
  this.getLunchData = function() {
    // JSON request to get a list of lunch options
    console.log("Searching " + self.startingPoint().lat + ", " + self.startingPoint().lng);
    $.getJSON( self.fourSquareAPI.url + "explore", {
      // Pull relevant data from the API
      client_id: self.fourSquareAPI.client_id,
      client_secret: self.fourSquareAPI.client_secret,
      ll: self.startingPoint().lat + "," + self.startingPoint().lng,
      v: '20180827',
      query: "lunch",
      limit: "50",
      openNow: "1",
      price: "1,2,3",
      format: "json"
    })
    .done(function(data) {
      // Add found item objects to self.lunchSearch array
      data.response.groups[0].items.forEach(function(item) {
        self.lunchSearch.push({
          type: item.venue.categories[0].shortName,
          venueID: item.venue.id,
          location: {
            lat: item.venue.location.lat,
            lng: item.venue.location.lng,
          },
          name: item.venue.name,
          address: item.venue.location.formattedAddress.join(', ')
          });
      });
      // Run function to add lunch option to list
      self.getLunch();
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      window.alert( "Request Failed: " + err );
    });
  };

  // Function to scrape a lunch option, add it to observableArray
  this.getLunch = function() {
    // Notify user if there are no nearby places left
    if (self.lunchSearch().length == 0) {
      self.excludeParams().count = self.lunchList().length;
      self.notice('<h3 class="view__h3">You\'re too picky! Your area is all out of options! Choose from the lunch spots presented.</h3>');
      return;
    }
    // Run function if user has places to choose from and < max option #
    else if (self.lunchSearch().length > 0 && self.lunchList().length < self.excludeParams().count) {
      // Pop random item from data list
      // var lunchItem = self.lunchSearch.splice(Math.floor(Math.random() * self.lunchSearch().length), 1)[0];
      self.checkPrice();

    // Notify user if they maxed-out their options
    }
    else {
      self.notice('<h3 class="view__h3">No more options for you!</h3>');
    }

  };

  // Recursion function to call FourSquare API and check item's price against set max price
  this.checkPrice = function() {
    // Notify user if there are no nearby places left
    if (self.lunchSearch().length == 0) {
      self.excludeParams().count = self.lunchList().length;
      self.notice('<h3 class="view__h3">You were too picky! Your area is all out of options! Choose from the lunch spots presented.</h3>');
      return;
    }
    // get random place and pop from data list
    var lunchItem = self.lunchSearch.splice(Math.floor(Math.random() * self.lunchSearch().length), 1)[0];
    // get JSON of price from FourSquare API
    $.getJSON(self.fourSquareAPI.url + lunchItem.venueID, {
      // Query FourSquare API to get venue info (price)
      client_id: self.fourSquareAPI.client_id,
      client_secret: self.fourSquareAPI.client_secret,
      v: '20180827',
      format: "json"
    })
    .done(function(data) {
      // if price <= max price:
      if (data.response.venue.price.tier <= self.excludeParams().price) {
        // Store price
        lunchItem.price = data.response.venue.price.tier;
        console.log("checkPrice: " + lunchItem.name + " price " + lunchItem.price + " <= " + self.excludeParams().price);
        // Call Google Maps distance function
        googmaps.getDistance(self.startingPoint(), lunchItem, function(data) {
          // Store distance
          lunchItem.distance = data;
          // If distance <= current max distance...
          if ((self.excludeParams().distance == null) || (lunchItem.distance <= self.excludeParams().distance)) {
            console.log("checkPrice: " + lunchItem.name + " is good: " + lunchItem.distance + "!");
            // Add spot to lunch suggestion list
            self.pushOption(lunchItem);
          } else {
            console.log("checkPrice: " + lunchItem.name + " distance fails. Recursion time.");
            // ...otherwise call function again
            self.checkPrice();
          }
        });
      }
      // ...otherwise call function again
      else {
        console.log("checkPrice: " + lunchItem.name + " price fails. Recursion time.");
        self.checkPrice();
      }
    })
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      window.log( "Request Failed: " + err );
    });
  };

  // Function to display $ icon in place of numbered price item
  this.priceIcon = function(selected) {
    var x = "";
    var i;
    for (i = 0; i < parseInt(selected.price); i++) {
      x += "$";
    }
    return x;
  };

  // Function to add item to lunchList
  this.pushOption = function(lunchItem) {
    // Add ID to new lunch item
    lunchItem.id = self.lunchList().length + 1;
    // Add lunch spot to option list
    self.lunchList.push(lunchItem);
    // Run create map marker function
    googmaps.addLunch(lunchItem);
    // Run select lunch spot function
    self.selectSpot(lunchItem);
    // If data__list not active, display list for mobile devices
    if (document.querySelector(".data__list").classList.contains("menu__active") == false) {
      self.dataToggle();
    }
  };

  // Funtion to filter out lunch spot types
  this.filterParams = function() {
    self.lunchSearch.remove(function(value) {
      return self.excludeParams().types.indexOf(value.type) >= 0;
    })
  };

  // Function to update the max price
  this.updatePrice = function(selected) {
    // Set temporary var equal to passed argument price
    var priceCheck = parseInt(selected.price);
    // If max price is already lower than selected place's price, alert user
    if (priceCheck > self.excludeParams().price) {
      self.notice('<h3 class="view__h3">The current max price is lower than this place! We\'ll search for another cheap place for you.</h3>');
    }
    // Otherwise update max price and filter data list
    else {
      // Set max price to 1
      if(self.excludeParams().price <= 1 || priceCheck <= 1) {
        self.excludeParams().price = 1;
        self.notice('<h3 class="view__h3">That\'s as low as we can go! We\'ll search for another cheap place for you.</h3>');
      }
      else {
        // Update max price to < selected spot
        self.excludeParams().price = (priceCheck > 1) ? priceCheck - 1 : 1;
        console.log("New max price: " + self.excludeParams().price);
        self.notice('<h3 class="view__h3">Got it! We\'ll search for cheaper places.</h3>');
      }
    }
    // Run function to find a new lunch option
    self.getLunch();
  }

  // Function to update the food type exclusion list
  this.updateType = function(selected) {
    // if selected place's food type is not yet on the exlusions list, add it
    if (!self.excludeParams().types.includes(selected.type)) {
      self.excludeParams().types.push(selected.type);
      console.log("Updated food types to exclude: " + self.excludeParams().types);
      self.notice('<h3 class="view__h3">Noted! We\'ll avoid ' + selected.type + ' food options.</h3>');
      // Update data list to filter new exclusion
      self.filterParams();
    } else {
      self.notice('<h3 class="view__h3">We got you covered! Already excluding ' + selected.type + ' options.</h3>');
      // self.getLunch();
    }
    // run getLunch function to get a new option with updated parameters
    self.getLunch();
  };

  // Function to update the max distance
  this.updateDistance = function(selected) {
    // If max distance is not yet set, or if selected place's distance is closer than current max...
    if ((self.excludeParams().distance == null) || (selected.distance < self.excludeParams().distance)) {
      console.log("updateDistance; old max: " + self.excludeParams().distance + "; new max: " + selected.distance);
      // Update max distance
      self.excludeParams().distance = selected.distance;
      self.notice('<h3 class="view__h3">Understood. We\'ll look for closer lunch spots.</h3>');
    } else {
      self.notice('<h3 class="view__h3">The max distance is set lower than this! Don\'t worry, we got this.</h3>');
    }
    // run getLunch function to get a new option with updated parameters
    self.getLunch();
  };

  // Function run when winning lunchItem is chosen
  this.pickSpot = function(selected) {
    self.dataToggle();
    console.log("Place Chosen: " + selected.name);
    // If distance is greater than 1 mile, default directions to DRIVING
    if (self.results.mode() == false) {
      if (selected.distance > 1609) {
        self.results.mode("DRIVING");
      } else {
        self.results.mode("WALKING");
      }
    }
    // Call function to display Google Maps driving directions
    googmaps.getDirections(self.startingPoint(), selected, self.results.mode(), function(data) {
      // Set results observable start name
      self.results.start(self.startingPoint().address);
      // Set results observable lunch spot info
      self.results.lunch.name(selected.name);
      self.results.lunch.address(selected.address);
      // Set results observable travel time
      self.results.time(data.time);
      // Add each direction item
      data.directions.forEach(function(direction) {
        self.results.directions.push(direction);
      })
      // Clear notice observable
      self.notice('<h3 class="view__h3 center">Great choice!</h3>');
      // If results not active, display list for mobile devices
      if (document.querySelector(".data__results").classList.contains("menu__active") == false) {
        self.dataToggle();
      }
    });
  };

  // Function to update directions based on mode imput (DRIVING/WALKING)
  this.updateDirections = function(data, event) {
    // Update directions mode
    if (event.target.value != self.results.mode()) {
      self.results.mode(event.target.value);
      self.results.directions.removeAll()
      self.pickSpot(self.currentSpot());
    }
  }

  // Function to toggle display of data/results list for mobile
  this.dataToggle = function() {
    var select;
    // if no results yet...
    if (!self.results.start()) {
      // toggle hidden class for data
      select = document.querySelector(".data__list");
    } else {
      // toggle hidden class for results
      select = document.querySelector(".data__results");
    }
    // Toggle .menu__active class from data list
    select.classList.toggle("menu__active");
  }

  // Function to remove display of data/results list for mobile
  this.dataRemove = function(data, event) {
    var select;
    // If element selected is not an active list, hide list
    if (event.currentTarget.classList.contains("menu__active") == false) {
      // If no results yet...
      if (!self.results.start()) {
        // remove active class for data
        select = document.querySelector(".data__list");
      } else {
        // toggle hidden class for results
        select = document.querySelector(".data__results");
      }
      select.classList.remove("menu__active");
    }
  }

}

ko.applyBindings(new ViewModel())