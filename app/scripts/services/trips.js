angular.module('sf_bikes')

.service('Trips', function($http, Stations, $q){

    var tripsPromise = $http.get('data/trips.json').then(function(response){
        return response.data;
    });

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

            trip.date = Number(Date.parse(dateString));


            return trip;
        });
    });

    this.all = function(filterDateString, cities) {

        var filterDate = Date.parse(filterDateString);

        return translatedPromise.then(function(trips) {
            return trips.filter(function(trip){
                var dateString = trip['Start Date'].split(' ')[0];
                return cities.indexOf(trip.startStation.landmark) != -1
                    && cities.indexOf(trip.endStation.landmark) != -1 
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
        }).then(function(totals) {
            var keys = Object.keys(totals);
            var values = keys.map(function(key) { return [Number(key), totals[key]]; });
            return values.sort(function(tuple1, tuple2){ return tuple1[0] - tuple2[0] });
        });
    };

    this.dateList = function() {
        return translatedPromise.then(function(trips) {
            return trips.reduce(function(dates, trip) {
                if (dates.indexOf(trip.date) == -1) {
                    dates.push(trip.date)
                }
                return dates;
            }, []);
        })
    };
});