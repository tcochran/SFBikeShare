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

            leafletMap = L.map('map', {maxZoom: 15, minZoom: 13, detectRetina: true, scrollWheelZoom: false});

            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                detectRetina: true
            }).addTo(leafletMap);

            scope.$watch('stations', function(newStations){
                if (newStations == null)
                    return;
                canvasGraphics.drawMap(leafletMap, newStations[0].landmark);
                graphics.drawStations(leafletMap, scope.stations);
            })

            var events = ['zoomend', 'dragend', 'drag'];

            events.forEach(function(name) {

                leafletMap.on(name, function() {
                    if (graphicsPromise != null)
                        graphicsPromise.refresh();
                    graphics.drawStations(leafletMap, scope.stations);
                });
            });

            leafletMap.on('resize', function() {
                if (graphicsPromise != null) {
                    graphicsPromise.resize();
                    graphicsPromise.refresh();
                }
                graphics.drawStations(leafletMap, scope.stations);
            });

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

                if (graphicsPromise != null) {
                    graphicsPromise.changeSpeed(speed);
                }
            });

            scope.$watch('filter.animate', function(speed, oldspeed){
                if (scope.data.trips == null)
                    return;

                restartGraphic();
            });
        }
    }
})
