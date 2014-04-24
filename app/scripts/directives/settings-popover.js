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
                    console.log(scope.filter.cities, $(element).data('cities').split(','));
                    if (scope.filter.cities.toString() == $(element).data('cities').split(',').toString())
                    {
                        $(element).addClass("active");
                        console.log('add')
                    } else {
                        $(element).removeClass("active");
                        console.log('remove')
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