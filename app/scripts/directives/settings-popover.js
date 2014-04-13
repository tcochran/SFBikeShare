angular.module('sf_bikes')

.directive('settingsPopover', function() {
    return {
        scope:{
            'date': '='
        },
        link: function(scope, element) {

            element
            .popover({
                html: true,
                content: $(".settings-popover-content").html()
            }).on('shown.bs.popover', function () {
                console.log(new Date(scope.date));
                $(".trip-date").datepicker("update", new Date(scope.date));
                
                $('.trip-date').datepicker('show').on('changeDate', function(dateEvent) {
                    scope.date = dateEvent.date.toString();
                    element.popover('hide');
                });

                

                
            });

        }
    };
});