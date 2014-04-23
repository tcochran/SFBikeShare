angular.module('sf_bikes')

.directive('map', function($interval, graphics, canvasGraphics) {
    return {
        scope: {
            stations: '=',
            data: '=',
            stats: '=', 
            filter: '='
        },
        restrict: 'A',
        link: function(scope, element, attrs, ctrl){

            scope.$watch('stations', function(newStations){
                if (newStations == null)
                    return;

                graphics.drawMap(newStations[0].landmark);
                canvasGraphics.drawMap(newStations[0].landmark);

            })
            

            var graphicsPromise = null;

            var restartGraphic = function() {
                if (graphicsPromise != null) {
                    graphicsPromise.cancel();
                }
                    
                scope.stats.minutes = 0;
                scope.stats.numBikes = 0; 
                totalMinutes = 0;

                scope.$evalAsync(function() {
                    startBikes(scope.filter.speed, scope.filter.animate); 
                });
            }

            scope.$watch('data', function(data, oldTrips) {


                if (!data.trips || !data.rebalances)
                    return;
                restartGraphic();
            });
            
            var startBikes = function (speed, animate) {

                if (graphicsPromise != null) {
                    graphicsPromise.cancel();
                }

                graphicsPromise = canvasGraphics.drawTrips(scope.data.trips, scope.stations, scope.data.rebalances, speed, animate, scope.stations[0].landmark);
                graphicsPromise.timeUpdate(function(time) {

                    scope.stats.minutes = parseInt(time)
                    scope.$apply();
                });

                graphicsPromise.tripCountUpdate(function(tripCount) {
                    scope.stats.numBikes = tripCount;
                    scope.$apply();
                })
            };

            scope.$watch('filter.speed', function(speed, oldspeed){
                if (scope.data.trips == null)
                    return;

                graphicsPromise.changeSpeed(speed);
            });

            scope.$watch('filter.animate', function(speed, oldspeed){
                if (scope.data.trips == null)
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