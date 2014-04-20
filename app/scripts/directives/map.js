angular.module('sf_bikes')

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

            scope.$watch('stations', function(newStations){
                if (newStations == null)
                    return;

                graphics.drawMap(newStations[0].landmark);

                scope.stations.map(function(station) {
                    graphics.drawStation(station);
                });
            })
            

            var intervalPromise = null;

            var restartGraphic = function() {
                if (intervalPromise != null) {
                    $interval.cancel(intervalPromise);
                }

                graphics.clearTrips();

                allTrips = angular.copy(scope.trips);
                    
                scope.stats.minutes = 0;
                scope.stats.numBikes = 0; 
                totalMinutes = 0;

                scope.$evalAsync(function() {
                    startBikes(scope.filter.speed, scope.filter.animate); 
                });
            }

            scope.$watch('trips', function(newTrips, oldTrips) {

                if (newTrips == null)
                    return;
                
                restartGraphic();
            });

            var renderBikes = function(tickTime, totalMinutes, tickMinutes) {
                var trips = allTrips.filter(function(trip){
                    return trip.minutes <= totalMinutes;
                });

                trips.forEach(function(trip) {
                    var duration = tickTime * (trip.duration / tickMinutes);
                    graphics.drawTrip(trip, duration, true);
                    var index = allTrips.indexOf(trip);
                    allTrips.splice(trip, 1);
                });

                return trips.length;
            };
            
            var startBikes = function (speed, animate) {


                var tickMinutes = Number(speed);

                if (intervalPromise != null) {
                    $interval.cancel(intervalPromise);
                }

                if (!animate)
                {
                    scope.trips.forEach(function(trip) {
                        graphics.drawTrip(trip, 0, false);
                    }); 
                    scope.stats.minutes = 1440;
                    scope.stats.numBikes = scope.trips.length;
                    return;
                }

                intervalPromise = $interval(function() {

                    var thisTicktime = angular.copy(tickTime), thisMinutes = scope.stats.minutes, thistickMinutes = tickMinutes;
                    var bikesThisTick = renderBikes(tickTime, scope.stats.minutes, tickMinutes);
                    totalMinutes += tickMinutes;

                    scope.stats.minutes = totalMinutes > 1440 ? 1440 : totalMinutes;

                    scope.stats.numBikes = (scope.stats.numBikes += bikesThisTick);

                    if (scope.stats.minutes > 1440) {
                        $interval.cancel(intervalPromise);
                    }

                }, tickTime);
            };

            var tickTime = 100;
            scope.stats.minutes = 0;
            scope.stats.numBikes = 0; 
            var totalMinutes = 0;

            scope.$watch('filter.speed', function(speed, oldspeed){
                if (scope.trips == null)
                    return;

                startBikes(speed, scope.filter.animate);
            });

            scope.$watch('filter.animate', function(speed, oldspeed){
                if (scope.trips == null)
                    return;

                restartGraphic();
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
            
            data = scope.totals

            var margin = {top: 50, right: 20, bottom: 30, left: 50},
                width = 1400 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            var x = d3.scale.linear()

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
              x.domain(data.map(function(d) { return d[0]; }));
              y.domain([0, 1300]);

              svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis)
                  .selectAll("text").remove();

              svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 10)
                  .attr("dy", "-1.91em")
                  .style("text-anchor", "end");

              svg.selectAll(".bar")
                  .data(data)
                .enter().append("rect")
                  .attr("class", "bar")
                  .attr("x", function(d) { return (x(d[0]) * 7)  ; }  )
                  .attr("width", 6)
                  .attr("y", function(d) { return y(d[1]); })
                  .attr("height", function(d) { return height - y(d[1]); });

        }
    };
});