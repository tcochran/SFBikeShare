angular.module('sf_bikes')

.controller('MapCtrl', function($scope, Stations, Trips, TestDate, TestDateString){

    $scope.filter = {speed: '2', date: TestDateString};

    console.log("load map")
    Stations.all().then(function(stations) {
        $scope.stations = stations;
    });

    Trips.all().then(function(trips) {
        $scope.trips = trips;
    })
    $scope.stats = {testDate: testDate};
})