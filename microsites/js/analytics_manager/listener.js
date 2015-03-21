var ListenerManager = Backbone.Model.extend({
    initialize: function(container, selector, analytics) {
        var self = this;
        if (self.get('analytics') != undefined) {
            if (self.get('analytics').dataview_view != undefined) {
                var it = self.get('analytics').dataview_view;
                var category = 'Dataview';
            }
            else if (self.get('analytics').dashboard_view != undefined) {
                var it = self.get('analytics').dashboard_view;
                var category = 'Dashboard';
            }
            else if (self.get('analytics').search_view != undefined) {
                var it = self.get('analytics').search_view;
                var category = 'Search';            
            }
            else {
                var it = new Array();
            }
            $.each(it, function(i, e) {
                $(self.get("container")).bind(e.trigger, function(event, parameter) {
                    if (_gaq) {
                        if (parameter != undefined) {
                            _gaq.push(['_trackEvent', category, e.ga, parameter]);
                        }
                        else {
                            _gaq.push(['_trackEvent', category, e.ga, window.location.href]);
                        }
                    }
                });
            
            });
        }
    },
});