'use strict';
var testDateString = '1/1/2014';
var testDate = function(){
    var testDate = Date.parse(testDateString);
    return testDate;
}();

angular.module('sf_bikes', [])

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
