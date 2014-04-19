'use strict';
angular.module('sf_bikes')

.controller('MapCtrl', function($scope, Stations, Trips){

    console.log(L.CRS);

    $scope.filter = {speed: '12', date: '1/21/2014', cities: ['Redwood City'], animate: false};
    $scope.data = {};
    $scope.title = "San Francisco";

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
        
        console.log('date changed')

        Trips.all($scope.filter.date, $scope.filter.cities).then(function(trips) {
            $scope.data.trips = trips;
        }); 

        $scope.stats = {testDate: Date.parse($scope.filter.date)};    
    });

    
    // Trips.dailyTotal().then(function(totals) {
    //     $scope.daily_totals = totals;
    // });

    Trips.dateList().then(function(dateList) {
        $scope.dateList = dateList;
    });



    
});