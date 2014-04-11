angular.module('sf_bikes')

.controller('MapCtrl', function($scope, Stations, Trips){

    $scope.filter = {speed: '2', date: '1/1/2014'};
    $scope.data = {}l
    $scope.$watch('filter.date', function(newDate) {

        if (!isNaN(Date.parse(newDate)))
        {

            Trips.all(newDate).then(function(trips) {
                $scope.data.trips = trips;
            }); 

            $scope.stats = {testDate: Date.parse(newDate)};    
        }
    });

    Stations.all().then(function(stations) {
        $scope.stations = stations;
    });
    
});