angular.module('sf_bikes')

.service('Weather', function($http){

    var weatherPromise = $http.get('data/weather.json').then(function(response){

        var weather = {};

        response.data.forEach(function(dailyWeather) {

            if (dailyWeather['Cloud_Cover'] == 0) {
                dailyWeather.cloudCoverDesc = 'clear';
            } else if (dailyWeather['Cloud_Cover'] > 0 && dailyWeather['Cloud_Cover'] < 8) {
                dailyWeather.cloudCoverDesc = dailyWeather['Cloud_Cover'] + " / 8";
            } else {
                dailyWeather.cloudCoverDesc = 'complete'
            }

            weather[Date.parse(dailyWeather.Date)] = dailyWeather;

        })

        return weather;
    });

    this.find = function(date) {
        return weatherPromise.then(function(weatherHash) {
            return weatherHash[date];
        })
    };

});

