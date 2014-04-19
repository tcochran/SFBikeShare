angular.module('sf_bikes')

// .service('graphics', function() {
//     var width = 1280, height = 800;
//     var projection = d3.geo.mercator()
//         .center([-121.888979, 37.330698])
//         // .center([-122.3827, 37.7879])

//         .scale(900000)
//         // .scale(40000)
//         .translate([width / 2, height / 2]); 

//     var s;
//     var labelsGroup;
//     var stationsGroup;
//     var tripsGroup;


    



//     this.drawMap = function () {

//         // map = L.map('l-map', { zoomControl:false}).setView([37.330698, -121.888979], 14);

// //         map.dragging.disable();
// //         map.touchZoom.disable();
// //         map.doubleClickZoom.disable();
// //         map.scrollWheelZoom.disable();

// // // add an OpenStreetMap tile layer
// // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
// //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
// // }).addTo(map);



//         s = Snap("#stations-svg");
        
//         tripsGroup = s.g();
//         stationsGroup = s.g();
//         labelsGroup = s.g();


        
        
//         var svg = d3.select("#map").append("svg")
//             .attr("width", width)
//             .attr("height", height);

//         // d3.json("data/sanjose2.geojson", function(error, uk) {
//         //     svg.append("path")
//         //         .attr("id", "states")
//         //         .datum(uk)
//         //         .attr("d", d3.geo.path().projection(projection));
//         // });

//         // var svg = d3.select("#map").append("svg")
//         //     .attr("width", width)
//         //     .attr("height", height);

//         // d3.json("data/bayarea.geojson", function(error, uk) {
//         //     svg.append("path")
//         //         .attr("id", "states")
//         //         .datum(uk)
//         //         .attr("d", d3.geo.path().projection(projection));
//         // });
//     };

//     this.drawStation = function (station) {

//         // var projection = function(longlat) {
            
//         //     var point = map.latLngToLayerPoint(L.latLng(longlat[1], longlat[0]))
//         //     return [point.x, point.y];
//         // }


//         var location = projection([station.long, station.lat]);
//         console.log(location);
//         var circle = stationsGroup.circle(location[0], location[1], 10);

//         circle.attr({
//             fill: "#bada55",
//             stroke: "#000",
//             strokeWidth: 0,
//             zIndex: '9999'
//         });

//         var marginTop = 44;

//         var label = labelsGroup.group();
//         var stationName = label.rect();

//         var textGroup = label.group();

//         var text = textGroup.text(location[0], location[1] - marginTop, station.name);

//         text.selectAll("tspan:nth-child(n+2)").attr({
//             dy: "1.2em",
//             textAnchor: "left",
//             x: location[0]
//         });

//         text.attr({
//             width: '100px',
//             textAnchor: "middle",
//             opacity: "#333",
//             fontSize: "16px",
//             fontWeight: 'bold'
//         });
//         var textb = text.getBBox();
//         var textDockCount = textGroup.text(textb.x, textb.y2 + textb.height, "Dock Count: " + station.dockcount);

//         var bb = textGroup.getBBox(); 

//         var paddingX = 10;
//         var paddingY = 6;

//         stationName.attr({
//             fill: "#DDD",
//             stroke: "#CCC",
//             opacity: 0.5,
//             x: bb.x - paddingX,
//             y: bb.y - paddingY,
//             width: bb.width + (paddingX * 2),
//             height: bb.height + (paddingY * 2)
//         });

//         label.attr({
//             display: 'none'
//         })

//         var hoverIn = function() {
//             circle.attr({ fill: 'steelblue' })
//             label.attr({ display: 'inherit' });

//         };

//         var hoverOut = function() {
//             circle.attr({ fill: "#bada55" })
//             label.attr({ display: 'none' });
//         }
//         circle.hover(hoverIn, hoverOut);
//     };

//     this.clearTrips = function() {
//         tripsGroup.clear();
//     };

//     this.drawTrip = function(trip, duration) {

//         // var projection = function(longlat) {
            
//         //     var point = map.latLngToLayerPoint(L.latLng(longlat[1], longlat[0]))
//         //     return [point.x, point.y];
//         // }

//         var location1 = projection([trip.startStation.long, trip.startStation.lat]);
//         var location2 = projection([trip.endStation.long, trip.endStation.lat]);

//         var line = tripsGroup.line(location1[0], location1[1], location1[0], location1[1]);
//         line.attr({
//             stroke: "black",
//             strokeWidth: 3,
//             opacity: 0.25,
//             strokeOpacity: 0.5,
//         });
//         var circle = tripsGroup.circle(location1[0], location1[1], 4);

//         circle.attr({
//             fill: "#82C7BC",
//             stroke: "#000",
//             strokeWidth: 0,
//         });
            
//         circle.animate({cx: location2[0], cy: location2[1]}, duration, null, function(){
//             circle.remove();
//         });
//         line.animate({x2: location2[0], y2: location2[1]}, duration);
//     };
// })

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

                console.log("load stations");

                graphics.drawMap(newStations[0].landmark);

                scope.stations.map(function(station) {
                    graphics.drawStation(station);
                });
            })
            

            var intervalPromise = null;

            scope.$watch('trips', function(newTrips, oldTrips) {



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