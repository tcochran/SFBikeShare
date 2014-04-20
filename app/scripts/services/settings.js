angular.module('sf_bikes')

.service('Settings', function() {


    this.save = function(settings) {

        localStorage.setItem("settings", JSON.stringify(settings));
    }

    this.load = function() {
        var settingsItem = localStorage.getItem("settings");
        if (!settingsItem) {
            return {speed: '2', date: '1/21/2014', cities: ['San Francisco'], animate: true};
        } else {
            return JSON.parse(settingsItem);
        }
    }

});