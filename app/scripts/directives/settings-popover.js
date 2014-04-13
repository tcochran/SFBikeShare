angular.module('sf_bikes')

.directive('settingsPopover', function() {
    return {
        scope:{
            'date': '=',
            'dateList': '='
        },
        link: function(scope, element) {

            
            element.popover({
                html: true,
                content: $(".settings-popover-content").html()
            }).on('shown.bs.popover', function () {
                console.log(scope);
                    
                $(".trip-date").datepicker({
                    beforeShowDay: function(date) {
                        return scope.dateList.indexOf(date.getTime()) > -1 
                    }
                });

                $(".trip-date").datepicker("update", new Date(scope.date));

                $('.trip-date').datepicker('show')
                .on('changeDate', function(dateEvent) {
                    console.log("changeDate", dateEvent);
                    scope.date = dateEvent.date.toString();
                    element.popover('hide');
                });
                
            });

        }
    };
});