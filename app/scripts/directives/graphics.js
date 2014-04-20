angular.module('sf_bikes')

.service('graphics', function() {

    var width = 800, height = 750;

    var clearBaseMap = function() {
        if ($('#map svg')) {
            $("#map svg").remove();
        }
    }

    var san_francisco = {

        projection: d3.geo.mercator()
            .center([-122.4067, 37.7879])
            .scale(850000)
            .translate([width / 2, height / 2])
        ,
        drawBaseMap: function() {

            var svg = d3.select("#map").append("svg")
                .attr("width", width)
                .attr("height", height);

            d3.json("data/bayarea.geojson", function(error, uk) {
                svg.append("path")
                    .attr("id", "states")
                    .datum(uk)
                    .attr("d", d3.geo.path().projection(san_francisco.projection));
            });
        }
    };



    var san_jose = {
        projection: d3.geo.mercator()
            .center([-121.895979, 37.340698])
            .scale(1130000)
            .translate([width / 2, height / 2])
        ,
        drawBaseMap: function() {
            
        }
    };

    var redwood_city = {
        projection: d3.geo.mercator()
            .center([-122.231061, 37.485701])
            .scale(2000000)
            .translate([width / 2, height / 2])
        ,
        drawBaseMap: function() {

        }
    };

    var palo_alto_mountain_view = {
        projection: d3.geo.mercator()
            .center([-122.130778, 37.412684])
            .scale(350000)
            .translate([width / 2, height / 2])
        ,
        drawBaseMap: function() {
            

            var svg = d3.select("#map").append("svg")
                .attr("width", width)
                .attr("height", height);

            d3.json("data/bayarea.geojson", function(error, uk) {
                svg.append("path")
                    .attr("id", "states")
                    .datum(uk)
                    .attr("d", d3.geo.path().projection(palo_alto_mountain_view.projection));
            });
        }
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
    var tripsGroup;



    this.drawMap = function (city_name) {

        city = cities[city_name];
        projection = city.projection;

        if (!s){
            s = Snap("#stations-svg");
            
            tripsGroup = s.g();
            stationsGroup = s.g();
            labelsGroup = s.g();
        }

        tripsGroup.clear();
        stationsGroup.clear();
        labelsGroup.clear();

        clearBaseMap();

        city.drawBaseMap();
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

    this.clearTrips = function() {
        tripsGroup.clear();
    };

    this.drawTrip = function(trip, duration, animate) {

        // var projection = function(longlat) {
            
        //     var point = map.latLngToLayerPoint(L.latLng(longlat[1], longlat[0]))
        //     return [point.x, point.y];
        // }

        var location1 = projection([trip.startStation.long, trip.startStation.lat]);
        var location2 = projection([trip.endStation.long, trip.endStation.lat]);

        if(animate) {
            var line = tripsGroup.line(location1[0], location1[1], location1[0], location1[1]);
        } else {
            var line = tripsGroup.line(location1[0], location1[1], location2[0], location2[1]);
        }

        line.attr({
            stroke: "#333333",
            strokeWidth: 2,
            opacity: 0.25,
            strokeOpacity: 0.25,
        });

        if (!animate)
            return; 

        var circle = tripsGroup.circle(location1[0], location1[1], 4);

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