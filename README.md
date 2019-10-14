# Lunchido!

This is a single-page web app that decides lunch for you, so you don't have to waste time fretting over decisions. Lunchido is built using KnockoutJS, along with HTML and JavaScript, and the app incorporates the Google Maps API and Foursquare's API to suggest lunch options in your area of choice. Suggestions are shown in the neighborhood map.

Check it out [here](https://infallible-cori-85fa18.netlify.com/).

## Prerequisites
👉 [NPM](https://www.npmjs.com/)  

## Install
Clone the app files to your computer, then install the required Node packages
```
$ git clone https://github.com/purwin/lunchido.git
$ cd lunchido
$ npm install
```

### Run
Get a dev server up and running on [http://localhost:8000](http://localhost:8000)
```
$ npm run local-server
```

Then check out that beautiful single-page web app!

## APIs

This web app incorporates the Google Maps and Foursquare APIs. We query and display the following data for you:

Google Maps:
* Takes a manual address input, or uses geolocation to find your location (with your consent, of course!)
* Displays a neighborhoood map for you to view everything
* Adds location markers and info windows for suggested lunch spots
* Displays walking/driving directions between start and endpoints once you've chosen the winning lunch spot
* Displays expected travel time

Foursquare:
* Pulls a list of open lunch places in your neighborhood based on your given location
* Filter options by price
* Filter options by food type
* Filter options by food distance

## FAQ
* **Wait, so how do I use this?**
* I'm glad you asked. Give us a location, and we'll give you suggestions for lunch. You can update the suggestions based on certain criteria. You get no more than 5 options, so make 'em count.

* **What happens when I pick my spot?**
* Happy to answer! We'll supply driving or walking directions, whichever you prefer. (If the place is farther than a mile away, we'll guess you want driving directions.)

* **Is this designed for mobile, too?**
* Great question! Yes! Hit the arrow icon, and a the lunch suggestion list will pop out and display.

## Contribute!
Feel free to `clone` or `fork` this project!