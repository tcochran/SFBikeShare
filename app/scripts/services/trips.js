angular.module('sf_bikes')

.service('Trips', function($http, Stations, $q){

    var findForDate = function(date) {
        var padLeft = function(pad, str) {
            return pad.substring(0, pad.length - str.length) + str
        }
        var dateString = padLeft("00", (date.getMonth() + 1).toString()) + "_" + padLeft("00", date.getDate().toString()) + "_" + date.getFullYear().toString().slice(-2);

        return $q.all([$http.get('data/trips/' + dateString + ".json"), Stations.all()]).then(function(data) {
            var trips = data[0].data;
            var stations = data[1];
            var stationsLookup = {};
            stations.forEach(function(station) {
                stationsLookup[station.station_id] = station;
            });

            return trips.map(function(trip){
                trip.startStation = stationsLookup[trip['Start Terminal']];
                trip.endStation = stationsLookup[trip['End Terminal']];

                var dateString = trip['Start Date'].split(' ')[0];
                trip.date = Number(Date.parse(dateString));
                trip.startDateTime = Date.parse(trip['Start Date']);

                return trip;
            });
        });
    }

    var startTimeOffsetMilliseconds = 6 * 60 * 60 * 1000;
    var dayMilliseconds = 24 * 60 * 60 * 1000;

    this.all = function(filterDateString, cities) {
        var date = new Date(filterDateString); 
        var nextDay = new Date(date.getTime());
        nextDay.setDate(date.getDate()+1);

        var translatedPromise = $q.all([findForDate(date), findForDate(nextDay)]).then(function(data){
            return data[0].concat(data[1]);
        });

        var filterDate = Date.parse(filterDateString);
        var startTime = filterDate + startTimeOffsetMilliseconds;
        var endTime = startTime + dayMilliseconds;

        return translatedPromise.then(function(trips) {
            return trips.filter(function(trip){
                return (cities.indexOf(trip.startStation.landmark) != -1
                    || cities.indexOf(trip.endStation.landmark) != -1) 
                    && trip.startDateTime >= startTime && trip.startDateTime <= endTime;
            }).map(function(trip) {
                var ms = Date.parse(trip['Start Date']);
                trip.duration = trip.Duration / 60;
                trip.minutes = (((ms - startTime) /1000) / 60);
                return trip;
            });
        });

        return translatedPromise.then(function(trips) {
            return trips.filter(function(trip){
                return cities.indexOf(trip.startStation.landmark) != -1
                    && cities.indexOf(trip.endStation.landmark) != -1 
                    && trip.startDateTime >= startTime && trip.startDateTime <= endTime;
            }).map(function(trip) {
                var ms = Date.parse(trip['Start Date']);
                trip.duration = trip.Duration / 60;
                trip.minutes = (((ms - startTime) /1000) / 60);
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
        return $http.get('data/all_dates.json').then(function(response) {
            return response.data.map(function(date) { return Date.parse(date); });
        })
        
    };
});