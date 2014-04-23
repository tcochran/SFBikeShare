angular.module('sf_bikes')

.service('Rebalances', function($http, Stations, $q) {

    Stations.all()

    var findForDate = function(date) {

        var findStation = function(id){
            return stationsLookup[id];
        };

        var padLeft = function(pad, str) {
            return pad.substring(0, pad.length - str.length) + str
        }
        var dateString = padLeft("00", (date.getMonth() + 1).toString()) + "_" + padLeft("00", date.getDate().toString()) + "_" + date.getFullYear().toString().slice(-2);

        return $http.get('data/rebalancing/' +  dateString + ".json").then(function(response){
            return response.data
        });
    }

    var findRebalanceForMinute = function(rebalances, minutes) {
        for (var i = 0; i < rebalances.length; i++) {
            
            if (rebalances[i].minutes > minutes) {
                return rebalances[i-1]
            }
        };
        return rebalances[rebalances.length - 1];
    };
    
    var startTimeOffsetMilliseconds = 6 * 60 * 60 * 1000;

    this.find = function(cities, date) {

    
        var startTime = Date.parse(date) + startTimeOffsetMilliseconds;
        console.log(Date.parse(date),startTime);

        return $q.all([findForDate(date), Stations.all()]).then(function(data) {
            var rebalances = data[0];
            var stations = data[1];
            var stationsLookup = {};
            console.log(stations);
            stations.forEach(function(station) {
                stationsLookup[station.station_id] = station;
            });

            var findStation = function(id){
                return stationsLookup[id];
            };

            var cityRebalances = rebalances.map(function(rebalance) {
                rebalance.station = findStation(rebalance['station_id']);
                return rebalance;
            }).filter(function(rebalance) {
                return cities.indexOf(rebalance.station.landmark) != -1;
            })

            console.log(cityRebalances);

            var byStationLookup = {};

            cityRebalances.forEach(function(rebalance){
                if (!(rebalance.station_id in byStationLookup)) {

                    byStationLookup[rebalance.station_id] = [];
                }
                rebalance.timestamp = Date.parse(rebalance.time)

                rebalance.minutes = Math.floor((rebalance.timestamp - startTime) / 1000 / 60);
                byStationLookup[rebalance.station_id].push(rebalance)
            })
            console.log(byStationLookup);
            return byStationLookup;

        }).then(function(byStationLookup) {
            var stationIds = Object.keys(byStationLookup);
            stationIds.forEach(function(stationId){
                var sortedRebalances = byStationLookup[stationId].sort(function(rebalance1, rebalance2) {
                    return rebalance1.timestamp - rebalance2.timestamp 
                });
                byStationLookup[stationId] = sortedRebalances;
            });

            var findClosest =  function(stationId, minutes) {

                

                var sortedRebalances = byStationLookup[stationId];
                if (sortedRebalances == null)
                    return null;
                return findRebalanceForMinute(sortedRebalances, minutes);
            };

            return { findClosest: findClosest,byStationLookup: byStationLookup  };

        });
    };
});