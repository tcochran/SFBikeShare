'use strict';
angular.module('sf_bikes')

.controller('MapCtrl', function($scope, Stations, Trips){

    console.log(L.CRS);

    $scope.filter = {speed: '12', date: '1/21/2014', cities: ['Redwood City']};
    $scope.data = {};

    $scope.$watch('filter.cities', function(cities) {

        Stations.find(cities).then(function(stations) {
            $scope.stations = stations;
        });

    });

    $scope.$watch('filter', function(filter) {
        Trips.all(filter.date, filter.city).then(function(trips) {
            $scope.data.trips = trips;
        }); 

        $scope.stats = {testDate: Date.parse(filter.date)};    
    }, true);

    
    // Trips.dailyTotal().then(function(totals) {
    //     $scope.daily_totals = totals;
    // });

    Trips.dateList().then(function(dateList) {
        $scope.dateList = dateList;
    });



    
});