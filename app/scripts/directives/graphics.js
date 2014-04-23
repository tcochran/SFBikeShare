angular.module('sf_bikes')

.service ('canvasGraphics', function() {

    var width = 850, height = 750;

    var san_francisco = {

        projection: d3.geo.mercator()
            .center([-122.4067, 37.7879])
            .scale(850000)
            .translate([width / 2, height / 2])
    };

    var san_jose = {
        projection: d3.geo.mercator()
            .center([-121.895979, 37.340698])
            .scale(1130000)
            .translate([width / 2, height / 2])
    };

    var redwood_city = {
        projection: d3.geo.mercator()
            .center([-122.231061, 37.485701])
            .scale(2000000)
            .translate([width / 2, height / 2])
    };

    var palo_alto_mountain_view = {
        projection: d3.geo.mercator()
            .center([-122.130778, 37.412684])
            .scale(350000)
            .translate([width / 2, height / 2])
    };
    var cities = {
        "San Jose": san_jose, 
        "San Francisco": san_francisco, 
        "Redwood City": redwood_city, 
        "Mountain View": palo_alto_mountain_view, 
        "Palo Alto": palo_alto_mountain_view
    };

    var city;
    var canvas;
    var context;
    var self = this;

    this.drawMap = function() {

        canvas = $('#map-canvas')[0];
        context = canvas.getContext('2d');
        context.lineCap = "round"
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                                context.mozBackingStorePixelRatio ||
                                context.msBackingStorePixelRatio ||
                                context.oBackingStorePixelRatio ||
                                context.backingStorePixelRatio || 1;

        var ratio = devicePixelRatio / backingStoreRatio;

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.scale(ratio, ratio);
        context.translate(0.5, 0.5);
    }


    var getColor = function (bikeCount, dockCount) {
        var percentFull = 1 - (bikeCount / dockCount);
        var step = Math.floor(20 * percentFull);
        return colors[step];
    }

    var colors = [
        "#00CC02",
        "#13CE00",
        "#2BD100",
        "#43D300",
        "#5CD600",
        "#75D800",
        "#8EDB00",
        "#A9DD00",
        "#C3E001",
        "#DEE201",
        "#E5CF01",
        "#E7B801",
        "#EAA001",
        "#EC8801",
        "#EF6F02",
        "#F15602",
        "#F43C02",
        "#F62202",
        "#F90702",
        "#FC0219"];

    this.drawStations = function(stations, rebalances, elapsedRealTime) {
        stations.forEach(function(station) {
            var rebalance = rebalances.findClosest(station.station_id, elapsedRealTime);
            // return;
            context.beginPath();
            context.arc(station.location[0], station.location[1], 8, 0, 2 * Math.PI, false);
            if (rebalance == null) {
                context.fillStyle = "00CC02"; 
                context.fill();
            } else {
                context.fillStyle = getColor(rebalance.bikes_available, station.dockcount);
                context.fill();

                context.fillStyle = "#000000"; 
                // context.font = "bold 12px sans-serif";
                // context.fillText(station.station_id + "-" + rebalance.bikes_available, station.location[0], station.location[1]);

            }
        })
    }

    this.drawTrips = function(tripsJson, stationsJson, rebalancingJson, speed, animate, cityName) {
        var elapsedRealTime = 0;
        var cancel = false;
        var startTime;
        var tripCount = 0;
        var timeUpdateCallback = function(){}
        var tripCountCallback = function() {}

        city = cities[cityName];
        var drawLine = function(start, end) {
            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = 'rgba(51,51,51, 0.1)';
            context.moveTo(start[0], start[1]);
            context.lineTo(end[0], end[1]);
            context.stroke();
        };

        var drawTrip = function(elapsedRealTime, trip) {

            var percentOfJourneyComplete = (elapsedRealTime - trip.startTime) / trip.totalTime;

            if (animate && percentOfJourneyComplete > 0 && percentOfJourneyComplete <= 1) {
                if (trip.started == false) {
                    trip.started = true;
                    tripCount++;
                    tripCountCallback(tripCount);
                }
                var x = (trip.distanceX * percentOfJourneyComplete) + trip.start[0];
                var y = (trip.distanceY * percentOfJourneyComplete) + trip.start[1];
                drawLine(trip.start, [x,y])

                context.beginPath();
                context.arc(x, y, 4, 0, 2 * Math.PI, false);
                context.fillStyle = '#82C7BC';
                context.fill();

            } else if (!animate || percentOfJourneyComplete > 1) {
                drawLine(trip.start, trip.end);
            }
        };

        var draw = function() {
            var time = (new Date()).getTime() - lastTime;
            lastTime = (new Date()).getTime();
            if (animate)
                elapsedRealTime += time * aminTimeToMinute;
            else {
                elapsedRealTime = 1440;
                tripCountCallback(trips.length);
            }

            timeUpdateCallback(elapsedRealTime);

            context.clearRect(0, 0, canvas.width, canvas.height);
            
            

            trips.forEach(function(trip) {
                drawTrip(elapsedRealTime, trip);
            });

            self.drawStations(stations, rebalancingJson, elapsedRealTime);

            if (elapsedRealTime >= 1440) {
                timeUpdateCallback(1440);
                return;
            };

            if (!cancel)
                window.requestAnimationFrame(draw);
            else
                context.clearRect(0, 0, canvas.width, canvas.height);
        };

        var aminTimeToMinute = 0.01 * speed;

        var trips = tripsJson.map(function(trip) {
            var tripAmin = {}
            tripAmin.start = city.projection([trip.startStation.long, trip.startStation.lat]);
            tripAmin.end = city.projection([trip.endStation.long, trip.endStation.lat]);
            tripAmin.startTime = trip.minutes;
            tripAmin.endTime = trip.minutes + trip.duration;
            tripAmin.start_station_id = trip.startStation.station_id
            tripAmin.end_station_id = trip.endStation.station_id
            
            tripAmin.distanceX = tripAmin.end[0] - tripAmin.start[0];
            tripAmin.distanceY = tripAmin.end[1] - tripAmin.start[1];
            tripAmin.totalTime = tripAmin.endTime - tripAmin.startTime;
            tripAmin.totalDistance = Math.sqrt(Math.abs((tripAmin.distanceX * tripAmin.distanceX)) + Math.abs((tripAmin.distanceY * tripAmin.distanceY)))
            tripAmin.started = false;
            return tripAmin;
        })
        var stations = stationsJson.map(function(station) {
            var stationAmin = {};
            stationAmin.location = city.projection([station.long, station.lat]);
            stationAmin.station_id = station.station_id;
            stationAmin.dockcount = station.dockcount;
            return stationAmin;
        });

        // trips = [trips.filter(function(trip) { return trip.start_station_id == 60 || trip.end_station_id == 60; })[0]]
        setTimeout(function() {
            lastTime = (new Date()).getTime();
            draw();
        }, 200);
        
        return {
            cancel: function() {
                cancel = true;
            },
            timeUpdate: function(callback) {
                timeUpdateCallback = callback;
            },
            tripCountUpdate: function(callback) {
                tripCountCallback = callback;
            },
            changeSpeed: function(speed) {
                aminTimeToMinute = 0.01 * speed;
            }
        }
    };

})

.service('graphics', function() {

    var width = 800, height = 750;

    var san_francisco = {

        projection: d3.geo.mercator()
            .center([-122.4067, 37.7879])
            .scale(850000)
            .translate([width / 2, height / 2])
    };

    var san_jose = {
        projection: d3.geo.mercator()
            .center([-121.895979, 37.340698])
            .scale(1130000)
            .translate([width / 2, height / 2])
    };

    var redwood_city = {
        projection: d3.geo.mercator()
            .center([-122.231061, 37.485701])
            .scale(2000000)
            .translate([width / 2, height / 2])
    };

    var palo_alto_mountain_view = {
        projection: d3.geo.mercator()
            .center([-122.130778, 37.412684])
            .scale(350000)
            .translate([width / 2, height / 2])
    };


    var cities = {
        "San Jose": san_jose, 
        "San Francisco": san_francisco, 
        "Redwood City": redwood_city, 
        "Mountain View": palo_alto_mountain_view, 
        "Palo Alto": palo_alto_mountain_view
    };

    var city;
    var projection;
    var s;
    var labelsGroup;
    var stationsGroup;

    this.drawMap = function (city_name) {

        city = cities[city_name];
        projection = city.projection;

        if (!s){
            s = Snap("#stations-svg");
            
            stationsGroup = s.g();
            labelsGroup = s.g();
        }

        stationsGroup.clear();
        labelsGroup.clear();
    };


    this.drawStation = function (station) {
        var location = projection([station.long, station.lat]); 
        var circle = stationsGroup.circle(location[0], location[1], 8);

        circle.attr({
            fill: "#bada55",
            stroke: "#000",
            strokeWidth: 0,
            zIndex: '9999'
        });

        var marginTop = 44;

        var label = labelsGroup.group();
        var stationName = label.rect();

        var textGroup = label.group();

        var text = textGroup.text(location[0], location[1] - marginTop, station.name);

        text.selectAll("tspan:nth-child(n+2)").attr({
            dy: "1.2em",
            textAnchor: "left",
            x: location[0]
        });

        text.attr({
            width: '100px',
            textAnchor: "middle",
            opacity: "#333",
            fontSize: "16px",
            fontWeight: 'bold'
        });

        var textb = text.getBBox();
        var textDockCount = textGroup.text(textb.x, textb.y2 + textb.height, "Dock Count: " + station.dockcount);

        var bb = textGroup.getBBox(); 

        var paddingX = 10;
        var paddingY = 6;

        stationName.attr({
            fill: "#DDD",
            stroke: "none",
            opacity: 0.7,
            x: bb.x - paddingX,
            y: bb.y - paddingY,
            width: bb.width + (paddingX * 2),
            height: bb.height + (paddingY * 2)
        });

        label.attr({
            display: 'none'
        })

        var hoverIn = function() {
            circle.attr({ fill: 'steelblue' })
            label.attr({ display: 'inherit' });

        };

        var hoverOut = function() {
            circle.attr({ fill: "#bada55" })
            label.attr({ display: 'none' });
        }
        circle.hover(hoverIn, hoverOut);
    };
})