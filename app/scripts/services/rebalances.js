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

    var findFor2Days = function(date) {

        var nextDay = new Date(date.getTime());
        nextDay.setDate(date.getDate()+1);

        console.log(date, nextDay);
        return $q.all([findForDate(date), findForDate(nextDay)]).then(function(data) {
            console.log(data[0].length, data[1].length);
            return data[0].concat(data[1]);
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
        console.log("find rebalances")
    
        var startTime = Date.parse(date) + startTimeOffsetMilliseconds;

        return $q.all([findFor2Days(date), Stations.all()]).then(function(data) {
            var rebalances = data[0];
            var stations = data[1];
            var stationsLookup = {};
            stations.forEach(function(station) {
                stationsLookup[station.station_id] = station;
            });

            var cityRebalances = rebalances.map(function(rebalance) {
                rebalance.station = stationsLookup[rebalance['station_id']];
                return rebalance;
            }).filter(function(rebalance) {
                return cities.indexOf(rebalance.station.landmark) != -1;
            })

            var byStationLookup = {};

            cityRebalances.forEach(function(rebalance){
                if (!(rebalance.station_id in byStationLookup)) {

                    byStationLookup[rebalance.station_id] = [];
                }
                rebalance.timestamp = Date.parse(rebalance.time)

                
                rebalance.minutes = Math.floor((rebalance.timestamp - startTime) / 1000 / 60);

                byStationLookup[rebalance.station_id].push(rebalance);
                
            })
            return byStationLookup;

        }).then(function(byStationLookup) {
            var stationIds = Object.keys(byStationLookup);
            stationIds.forEach(function(stationId){

                var dayArray = new Array(1450);


                var sortedRebalances = byStationLookup[stationId].sort(function(rebalance1, rebalance2) {
                    return rebalance1.timestamp - rebalance2.timestamp 
                });

                for (var i = 0; i < dayArray.length; i++) {
                    dayArray[i] = findRebalanceForMinute(sortedRebalances, i);
                };

                byStationLookup[stationId] = dayArray;
            });

            var findClosest =  function(stationId, minutes) {
                if (Math.floor(minutes) > 1440)
                {
                    console.log(Math.floor(minutes));
                }
                if (!(stationId in byStationLookup)){
                    return null;
                }
                return byStationLookup[stationId][Math.floor(minutes)];
            };

            return { findClosest: findClosest  };

        });
    };
});