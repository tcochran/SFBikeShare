angular.module('sf_bikes')

.service('graphics', function() {
    var width = 1040, height = 900;
    var projection = d3.geo.mercator()
        .center([-122.4067, 37.7879])
        .scale(850000)
        .translate([width / 2, height / 2]); 

    var stationsSvg;
    var tripsSvg;

    this.drawMap = function () {
        stationsSvg = Snap("#stations-svg");
        tripsSvg = Snap("#trips-svg");
        
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


    this.drawStation = function (station) {
        var location = projection([station.long, station.lat]);
        console.log(location);
        var circle = stationsSvg.circle(location[0], location[1], 8);

        circle.attr({
            fill: "#bada55",
            stroke: "#000",
            strokeWidth: 0,
            zIndex: '9999'
        });
    };

    this.clearTrips = function() {
        tripsSvg.clear();
    };

    this.drawTrip = function(trip, duration) {

        var location1 = projection([trip.startStation.long, trip.startStation.lat]);
        var location2 = projection([trip.endStation.long, trip.endStation.lat]);

        console.log(duration);

        var line = tripsSvg.line(location1[0], location1[1], location1[0], location1[1]);
        line.attr({
            stroke: "#333",
            strokeWidth: 3,
            opacity: 0.25,
            strokeOpacity: 0.25,
        });
        var circle = tripsSvg.circle(location1[0], location1[1], 4);

        circle.attr({
            fill: "#82C7BC",
            stroke: "#000",
            strokeWidth: 0,
        });
            
        circle.animate({cx: location2[0], cy: location2[1]}, duration, null, function(){
            circle.remove();
        });
        line.animate({x2: location2[0], y2: location2[1]}, duration);
    };
})

.directive('map', function($interval, graphics) {
    return {
        scope: {
            stations: '=',
            trips: '=',
            stats: '=', 
            filter: '='
        },
        restrict: 'A',
        link: function(scope, element, attrs, ctrl){

            var allTrips = null;
            
            graphics.drawMap();

            scope.stations.map(function(station) {
                graphics.drawStation(station);
            });

            var intervalPromise = null;

            scope.$watch('trips', function(newTrips) {

                if (newTrips == null)
                    return;
                
                if (intervalPromise != null) {
                    $interval.cancel(intervalPromise);
                }

                graphics.clearTrips();

                allTrips = angular.copy(newTrips);
                    
                scope.stats.minutes = 0;
                scope.stats.numBikes = 0; 
                totalMinutes = 0;

                startBikes(scope.filter.speed); 
                
            })

            var renderBikes = function(tickTime, totalMinutes, tickMinutes) {
                var trips = allTrips.filter(function(trip){
                    return trip.minutes <= totalMinutes;
                });

                trips.forEach(function(trip) {
                    var duration = tickTime * (trip.duration / tickMinutes);
                    graphics.drawTrip(trip, duration);
                    var index = allTrips.indexOf(trip);
                    allTrips.splice(trip, 1);
                });

                return trips.length;
            };
            
            var startBikes = function (speed) {

                var tickMinutes = Number(speed);

                if (intervalPromise != null) {
                    $interval.cancel(intervalPromise);
                }

                intervalPromise = $interval(function() {
                    var bikesThisTick = renderBikes(tickTime, scope.stats.minutes, tickMinutes);
                    totalMinutes += tickMinutes;

                    scope.stats.minutes = totalMinutes > 1440 ? 1440 : totalMinutes;

                    scope.stats.numBikes = (scope.stats.numBikes += bikesThisTick);

                    if (scope.stats.minutes > 1440) {
                        $interval.cancel(intervalPromise);
                    }

                }, tickTime);
            };

            var tickTime = 70;
            scope.stats.minutes = 0;
            scope.stats.numBikes = 0; 
            var totalMinutes = 0;

            scope.$watch('filter.speed', function(speed, oldspeed){
                if (scope.trips == null)
                    return;

                startBikes(speed);
            });
        }
    }
})


.directive('dailyTotals', function() {

    return {
        scope: {
            totals: '=',
            
        },
        link: function(scope, element) {
            
            data = scope.totals;

            

            // data = [[1, 500], [2, 600], [3, 100], [4, 300], [5, 200]]

            var margin = {top: 50, right: 20, bottom: 30, left: 50},
                width = 1400 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            var x = d3.scale.linear()
                // .rangeRoundBands([0, width], .1);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");


            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(2);

            var svg = d3.select(".bar-chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(0" + margin.left + "," + margin.top + ")");
            // d3.json(scope.totals, type, function(error, data) {
                console.log(data);
                //[d3.min(scope.totals, function(v){ return v[0]; }), d3.max(scope.totals, function(v){ return v[0]; })]
              x.domain(data.map(function(d) { return d[0]; }));
              y.domain([0, 1300]);

              svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  // .attr("transform", "rotate(-90)")
                  .call(xAxis)
                  .selectAll("text").remove();

              svg.append("g")
                  .attr("class", "y axis")
                  // .attr("dy", "-20em")
                  // .attr("y",50)
                  .call(yAxis)
                  // .selectAll("text").remove()
                .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 10)
                  .attr("dy", "-1.91em")
                  .style("text-anchor", "end");

                  console.log("start x", x(1377748800000));
              svg.selectAll(".bar")
                  .data(data)
                .enter().append("rect")
                  .attr("class", "bar")
                  // .attr("x", function(d) { console.log("x", d[0] / 1000 / 60); return x(d[0] / 1000 / 60 ); }  )
                  .attr("x", function(d) { console.log("x", x(d[0] / 1000 / 60)); return (x(d[0]) * 7)  ; }  )
                  .attr("width", 6)
                  .attr("y", function(d) { return y(d[1]); })
                  .attr("height", function(d) { return height - y(d[1]); });
            

            // });
            // };
//             1377748800000
// 1377835200000
// 1377921600000
// 1378008000000
// 1378094400000

        }
    };
});