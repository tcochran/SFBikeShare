angular.module('sf_bikes')

.directive('settingsPopover', function() {
    return {
        scope:{
            'filter': '=',
            'dateList': '=',
        },
        link: function(scope, element) {



            
            element.popover({
                html: true,
                content: $(".settings-popover-content").html()
            }).on('shown.bs.popover', function () {

                $(".city-button").each(function(index, element) {
                    if (scope.filter.cities.toString() == $(element).data('cities').split(',').toString())
                    {
                        $(element).addClass("active");
                    } else {
                        $(element).removeClass("active");
                    }
                })
                $(".trip-date").datepicker({
                    beforeShowDay: function(date) {
                        return scope.dateList.indexOf(date.getTime()) > -1 
                    }
                });

                $(".trip-date").datepicker("update", new Date(scope.filter.date));

                $(".city-button").click(function(event) {
                    scope.filter.cities = $(event.target).data('cities').split(',');
                    element.popover('hide');
                    scope.$apply();
                    
                });

                $('.trip-date').datepicker('show')
                .on('changeDate', function(dateEvent) {
                    scope.filter.date = dateEvent.date.toString();
                    element.popover('hide');
                    scope.$apply();
                    
                });
                
            });

        }
    };
});