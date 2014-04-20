angular.module('sf_bikes')

.service('Stations', function($http) {
    var stationsPromise = $http.get('data/stations.json').then(function(response){
            return response.data;
        });

    this.all = function() {
        return stationsPromise;
    };

    this.find = function(cities) {
        return stationsPromise.then(function(stations) {
            return stations.filter(function(station){
                return cities.indexOf(station.landmark) != -1;
            });
        });
    };
    var self = this;
    this.findLimits = function(city) {

        this.find(city).then(self.limit);
    }

    this.limit = function(stations) {
        var left;
        var right;
        var top;
        var bottom;

        var min = function(arr) { return Math.min.apply(null, arr); };
        var max = function(arr) { return Math.max.apply(null, arr); };
        var longs = stations.map(function(station) { return station.long; });
        var lats = stations.map(function(station) { return station.lat; });
        
        left = min(longs)
        right = max(longs)

        top = min(lats)
        bottom = max(lats)

    }
});