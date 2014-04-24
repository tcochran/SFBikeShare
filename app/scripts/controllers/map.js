'use strict';
angular.module('sf_bikes')

.controller('MapCtrl', function($scope, Stations, Trips, Weather, Settings, Rebalances, $q){

    $scope.filter = Settings.load();

    $scope.data = {};
    $scope.title = "San Jose";

    $scope.$watch('filter.cities', function(cities, oldCities) {
        if (cities == oldCities)
            return;

        $scope.title = cities.join(" / ");

        Stations.find(cities).then(function(stations) {
            $scope.stations = stations;
        });
        $q.all([Rebalances.find($scope.filter.cities, new Date($scope.filter.date)), Trips.all($scope.filter.date, $scope.filter.cities)]).then(function(data){

            $scope.data = {rebalances: data[0], trips: data[1]};

        }); 
    });

    $scope.$watch('filter.date', function(date, olddate) {
        console.log(date, olddate)
        if (date == olddate)
            return;

        $q.all([Rebalances.find($scope.filter.cities, new Date(date)), Trips.all($scope.filter.date, $scope.filter.cities)]).then(function(data){
            $scope.data = {rebalances: data[0], trips: data[1]};
        });

        Weather.find(Date.parse(date)).then(function(weather) {
            $scope.weather = weather;
        });
        

        $scope.stats = {testDate: Date.parse($scope.filter.date)};    
    });

    $scope.$watch('filter', function(filter) {
        Settings.save(filter);
    }, true);

    var loadEverything = function() {

        $scope.title = $scope.filter.cities.join(" / ");

        $scope.stats = {testDate: Date.parse($scope.filter.date)};

        Weather.find(Date.parse($scope.filter.date)).then(function(weather) {
            $scope.weather = weather;
        });
        console.log($scope.cities)
        Stations.find($scope.filter.cities).then(function(stations) {
            $scope.stations = stations;
        });

        $q.all([Rebalances.find($scope.filter.cities, new Date($scope.filter.date)), Trips.all($scope.filter.date, $scope.filter.cities)]).then(function(data){
            $scope.data = {rebalances: data[0], trips: data[1]};
        });
    };
    loadEverything();
    
    // Trips.dailyTotal().then(function(totals) {
    //     $scope.daily_totals = totals;
    // });

    Trips.dateList().then(function(dateList) {
        $scope.dateList = dateList;
    });    
});