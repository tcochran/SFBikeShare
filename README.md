Ride distribution infographic
===========

http://tcochran.github.io/SFBikeShare

Visualization of bay area bike share program. A data exploratory tool to highlight where bikes are going throughout the day.

* show locations of stations 
* swap between cities and dates
* displays bikes moving between stations over the course of day
* level of the bike stations docks through the day, highlights hotspots without bikes using gradient scale, utilizies the replenishment data
* weather information for that day
* mouseover station for name and total docks

###Technology
* python scripts to generate data
* yeoman/grunt build
* angular front end
* bootstrap
* canvas and svg animations
* leaflet with open street maps basemap

###Current problems 
* as a day is counted as 6am - 6am the most recent day can't be displayed
* does not work in IE
* some of the data is inconsistent, for example redwood city the replenishment changes without corresponding trips, appears to be problems with the raw data

###Future 
* mobile customized versions
* include other cities bike share data 
* show number of bikes available and dock available on the mouse over
* report to show problems that happened during the day
* slider to control time of the day
* comparison of bike usage throught the week


An entry into the Bay Area Bike Share Open Data Challenge. For questions email timothy.cochran@gmail.com


