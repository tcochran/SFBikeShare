'use strict';
angular.module('sf_bikes')

.controller('MapCtrl', function($scope, Stations, Trips, Weather, Settings){

    $scope.filter = Settings.load();

    $scope.data = {};
    $scope.title = "San Jose";

    $scope.$watch('filter.cities', function(cities) {

        $scope.title = cities.join(" / ");

        Stations.find(cities).then(function(stations) {
            $scope.stations = stations;
        });

        Trips.all($scope.filter.date, $scope.filter.cities).then(function(trips) {
            $scope.data.trips = trips;
        }); 
    });

    $scope.$watch('filter.date', function(date) {

        Trips.all($scope.filter.date, $scope.filter.cities).then(function(trips) {
            $scope.data.trips = trips;
        }); 
        Weather.find(Date.parse(date)).then(function(weather) {
            $scope.weather = weather;
        });
        

        $scope.stats = {testDate: Date.parse($scope.filter.date)};    
    });

    $scope.$watch('filter', function(filter) {
        Settings.save(filter);
    }, true);

    
    // Trips.dailyTotal().then(function(totals) {
    //     $scope.daily_totals = totals;
    // });

    Trips.dateList().then(function(dateList) {
        $scope.dateList = dateList;
    });



    
});