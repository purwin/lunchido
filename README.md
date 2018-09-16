# Lunchido!

This is a single-page web app that decides lunch for you, so you don't have to waste time fretting over decisions. Lunchido is built using KnockoutJS, along with HTML and JavaScript, and the app incorporates the Google Maps API and Foursquare's API to suggest lunch options in your area of choice. Suggestions are shown in the neighborhood map.

## Requirements

* You'll need [Python](https://www.python.org/) (to get a local server running) and a working computer to view or edit this project.
* A virtual machine to run everything. This app relies on [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/).

## Installation

1. Install [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/) on your computer.
2. Download the [fullstack-nanodegree-vm](https://github.com/udacity/fullstack-nanodegree-vm) vagrant file.
    * [`Clone`](https://github.com/udacity/fullstack-nanodegree-vm.git) the Udacity-created Vagrant file.
3. [`Clone`](https://github.com/purwin/lunchido) this project within the Vagrant directory so you have the working files on your computer.
4. Start up your Vagrant file. Run the following in Terminal in your Vagrant directory:
    * `vagrant up`
    * `vagrant ssh`
    * `cd /vagrant` to access project files
5. `cd` to the cloned `lunchido` directory, and run the following in Terminal:
    * Type in `python -m SimpleHTTPServer 8000` to get a local server running
6. Open your web browser of choice, and enter the following address to view the app: `http://localhost:8000`
7. Check out that beautiful single-page web app!

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

* **Q**: Wait, so how do I use this?
* **A**: I'm glad you asked. Give us a location, and we'll give you suggestions for lunch. You can update the suggestions based on certain criteria. You get no more than 5 options, so make 'em count.

* **Q**: What happens when I pick my spot?
* **A**: Happy to answer! We'll supply driving or walking directions, whichever you prefer. (If the place is farther than a mile away, we'll guess you want driving directions.)

* **Q**: Is this designed for mobile, too?
* **A**: Great question! Yes! Hit the arrow icon, and a the lunch suggestion list will pop out and display.

## Contribute!

Feel free to `clone` or `fork` this project!