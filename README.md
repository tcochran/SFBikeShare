Ride distribution infographic
===========

http://tcochran.github.io/SFBikeShare

Visualization of bay area bike share program. A data exploratory tool to show which stations bikes are moving between over the course of a day.

* Shows locations of bike stations 
* Toggle between bay area cities and dates with trip data
* Displays bikes moving between stations over the course of day, trail is marked on map
* Level of the bike station docks through the day, highlights hotspots without bikes using a gradient scale, utilizies the bike replenishment open data
* Weather information for that day
* Hover over station for name and total dock count

###Technology
* Python scripts to generate data
* Yeoman/grunt build
* Angular front end
* Bootstrap
* Canvas and svg animations
* Leaflet with open street maps basemap

###Current problems 
* As a day is counted as 6am - 6am the most recent day can't be displayed
* Does not work in IE
* Some of the data is inconsistent, for example redwood city the replenishment changes without corresponding trips, appears to be problems with the raw data

###Future 
* Mobile customized versions
* Include other cities bike share data 
* Show number of bikes available and dock available on the mouse over
* Report to show problems that happened during the day
* Slider to control time of the day
* Comparison of bike usage throught the week


An entry into the Bay Area Bike Share Open Data Challenge. For questions email timothy.cochran@gmail.com


