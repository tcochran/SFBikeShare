SFBike = {Svg: {}}
SFBike.Svg.drawMap = function (width, height, projection) {
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

SFBike.Svg.drawStation = function (s, station, projection) {
    console.log("drawStation");
    var location = projection([station.long, station.lat]);
    var circle = s.circle(location[0], location[1], 8);

    circle.attr({
        fill: "#bada55",
        stroke: "#000",
        strokeWidth: 0,
        zIndex: '9999'
    });
};

SFBike.Svg.drawTrip = function(s, trip, projection, duration) {

    var location1 = projection([trip.startStation.long, trip.startStation.lat]);
    var location2 = projection([trip.endStation.long, trip.endStation.lat]);

    var line = s.line(location1[0], location1[1], location1[0], location1[1]);
    line.attr({
        stroke: "#333",
        strokeWidth: 3,
        opacity: 0.25,
        strokeOpacity: 0.25,
    });
    var circle = s.circle(location1[0], location1[1], 4)

    circle.attr({
        fill: "#82C7BC",
        stroke: "#000",
        strokeWidth: 0,
    })
        
    circle.animate({cx: location2[0], cy: location2[1]}, duration, null, function(){
        circle.remove();
    });
    line.animate({x2: location2[0], y2: location2[1]}, duration);
};

angular.module('sf_bikes')

.directive('map', function($interval) {
    return {
        scope: {
            stations: '=',
            trips: '=',
            stats: '=', 
            filter: '='
        },
        restrict: 'A',
        link: function(scope, element, attrs, ctrl){

            var s = Snap("#svg");
            var width = 1040, height = 900;
            var projection = d3.geo.mercator()
                .center([-122.4067, 37.7879])
                .scale(850000)
                .translate([width / 2, height / 2]); 

            var baseMap = SFBike.Svg.drawMap(width, height, projection);

            scope.stations.map(function(station) {
                SFBike.Svg.drawStation(s, station, projection);
            });

            var renderBikes = function(tickTime, totalMinutes, tickMinutes) {
                var trips = scope.trips.filter(function(trip){
                    return trip.minutes <= totalMinutes;
                });

                trips.forEach(function(trip) {
                    var duration = tickTime * (trip.duration / tickMinutes);
                    SFBike.Svg.drawTrip(s, trip, projection, duration);
                    var index = scope.trips.indexOf(trip);
                    scope.trips.splice(trip, 1);
                });

                return trips.length;
            };

            var tickTime = 70;

            scope.stats.minutes = 0;
            scope.stats.numBikes = 0; 
            var totalMinutes = 0;

            var intervalPromise = null;

            scope.$watch('filter.speed', function(speed){

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

            })
            

        }
    }
})