'use strict';

angular.module('sf_bikes', [])

.service('Stations', function($http) {
    var stationsPromise = $http.get('data/stations.json').then(function(response){
            return response.data;
        });

    this.all = function() {
        return stationsPromise;
    };

    this.sf = function() {
        return stationsPromise.then(function(stations) {
            return stations.filter(function(station){
                return station.landmark === 'San Francisco';
            });
        });
    };

    this.sanJose = function() {
        return stationsPromise.then(function(stations) {
            return stations.filter(function(station){
                return station.landmark === 'San Jose';
            });
        });
    };
})


.service('Trips', function($http, Stations, $q){

    var tripsPromise = $http.get('data/trips.json').then(function(response){
        return response.data;
    })

    var translatedPromise = $q.all([tripsPromise, Stations.all()]).then(function(data) {
        var trips = data[0];
        var stations = data[1];
        var stationsLookup = {};
        stations.forEach(function(station) {
            stationsLookup[station.station_id] = station;
        });

        var findStation = function(id){
            return stationsLookup[id];
        };
        return trips.map(function(trip){
            trip.startStation = findStation(trip['Start Terminal']);
            trip.endStation = findStation(trip['End Terminal']);

            var dateString = trip['Start Date'].split(' ')[0];

            trip.date = Date.parse(dateString);

            return trip;
        });
    });

    this.all = function(filterDateString) {

        var filterDate = Date.parse(filterDateString);

        return translatedPromise.then(function(trips) {
            return trips.filter(function(trip){
                var dateString = trip['Start Date'].split(' ')[0];
                return trip.startStation.landmark === 'San Francisco' 
                    && trip.endStation.landmark === 'San Francisco' 
                    && trip.date === filterDate;
            }).map(function(trip) {
                var ms = Date.parse(trip['Start Date']);
                trip.duration = trip.Duration / 60;
                trip.minutes = (((ms - filterDate) /1000) / 60);
                return trip;
            });
        });
    };


    this.dailyTotal = function() {
        return translatedPromise.then(function(trips) {
            return trips.reduce(function(totals, trip) {
                if (!(trip.date in totals)) {
                    totals[trip.date] = 0;
                }

                totals[trip.date] = totals[trip.date] + 1;

                return totals;
            }, {});

        })

    }
});


