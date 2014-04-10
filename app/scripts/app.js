'use strict';
var testDateString = '1/11/2014';
var testDate = function(){
    var testDate = Date.parse(testDateString);
    return testDate;
}();

angular.module('sf_bikes', [])

.controller('mapCtrl', function($scope, Stations, Trips, TestDate){
    Stations.all().then(function(stations) {
        $scope.stations = stations;
    });

    Trips.all().then(function(trips) {
        $scope.trips = trips;
    })
    $scope.stats = {testDate: testDate};
    $scope.start = {};
    
    $scope.registerAnimation = function(callback) {
        $scope.startAnimation = function() {
            callback();
        };
    }
})

.directive('map', function($interval) {
    return {
        scope: {
            stations: '=',
            trips: '=',
            start: '=',
            stats: '=' 
        },
        restrict: 'A',
        link: function(scope, element, attrs, ctrl){

            var baseMap = function (width, height, projection) {
                var svg = d3.select("#map").append("svg")
                    .attr("width", width)
                    .attr("height", height);

                d3.json("data/bayarea.geojson", function(error, uk) {
                    svg.append("path")
                        .attr("id", "states")
                        .datum(uk)
                        .attr("d", d3.geo.path().projection(projection));
                });
            };
                
            var s = Snap("#svg");
            var width = 1040, height = 900;

            var projection = d3.geo.mercator()
                .center([-122.4067, 37.7879])
                .scale(850000)
                .translate([width / 2, height / 2]); 

            baseMap(width, height, projection);

            scope.stations.map(function(station) {
                var location = projection([station.long, station.lat]);
                var circle = s.circle(location[0], location[1], 8);

                circle.attr({
                    fill: "#bada55",
                    stroke: "#000",
                    strokeWidth: 0,
                    zIndex: '9999'
                });
            });
            var count = 0;
            var numBikes = 0;
            var start = function(){

                var renderBikes = function(ticks, tickMinutes) {
                    var bikesThisMinute = scope.trips.filter(function(trip){
                        return Math.floor(trip.minutes / tickMinutes) == ticks;
                    });

                    renderTrips(bikesThisMinute);
                    return bikesThisMinute.length;
                }
                var tickTime = 70;
                var tickMinutes = 3;
                $interval(function() {
                    var countCopy = angular.copy(count);
                    
                    var bikesThisTick = renderBikes(countCopy, tickMinutes);
                    
                    count++;
                    numBikes += bikesThisTick;
                    scope.stats.minutes = count * tickMinutes;
                    scope.stats.numBikes = numBikes;

                }, tickTime, 1440 / tickMinutes);


                var renderTrips = function(trips) {
                    trips.forEach(function(trip) {
                        var location1 = projection([trip.startStation.long, trip.startStation.lat]);
                        var location2 = projection([trip.endStation.long, trip.endStation.lat]);

                        var line = s.line(location1[0], location1[1], location1[0], location1[1]);
                        line.attr({
                            stroke: "#333",
                            strokeWidth: 3,
                            opacity: 0.25,
                            strokeOpacity: 0.25,
                        });
                        var circle = s.circle(location1[0], location1[1], 4)

                        circle.attr({
                            fill: "#82C7BC",
                            stroke: "#000",
                            strokeWidth: 0,
                        })
                            
                        circle.animate({cx: location2[0], cy: location2[1]}, tickTime * (trip.duration / tickMinutes), null, function(){
                            circle.remove();
                        });
                        line.animate({x2: location2[0], y2: location2[1]}, tickTime * (trip.duration / tickMinutes));
                    })
                };
            }();

            // scope.start(start);
        }
    }
})

.service('Stations', function($http) {
    var stationsPromise = $http.get('data/stations.json').then(function(response){
        return response.data;
    })

    this.all = function() {
        return stationsPromise;
    }

    this.sf = function() {
        return stationsPromise.then(function(stations) {
            return stations.filter(function(station){
                return station.landmark == 'San Francisco';
            });
        })
    }

    this.sanJose = function() {
        return stationsPromise.then(function(stations) {
            return stations.filter(function(station){
                return station.landmark == 'San Jose';
            });
        })
    }
})


.value('TestDateString', testDateString)
.value('TestDate', testDate)

.service('Trips', function($http, Stations, $q, TestDate, TestDateString){

    var tripsPromise = $http.get('data/trips.json').then(function(response){
        return response.data;
    })
    this.all = function() {

        return $q.all([tripsPromise, Stations.all()]).then(function(data) {
            var trips = data[0];
            var stations = data[1];
            var stationsLookup = {}
            stations.forEach(function(station) {
                stationsLookup[station.station_id] = station;
            });

            var findStation = function(id){
                return stationsLookup[id];
            }

            var result = trips.map(function(trip){
                trip.startStation = findStation(trip['Start Terminal']);
                trip.endStation = findStation(trip['End Terminal']);

                return trip;
            }).filter(function(trip){ 
                var dateString = trip['Start Date'].split(' ')[0];
                return trip.startStation.landmark == 'San Francisco' && trip.endStation.landmark == 'San Francisco' && dateString == TestDateString;
            }).map(function(trip) {
                var ms = Date.parse(trip['Start Date'])
                trip.duration = trip['Duration'] / 60;
                trip.minutes = (((ms - TestDate) /1000) / 60);
                return trip;
            });
            return result;
        });
    
    }
})
