var ResourceTabManager = TabManager.extend({
    initialize: function(container, selector, datastream_container, visualization_container, dashboard_container, datastream_selector, visualization_selector, dashboard_selector) {
        $("ul", this.get("selector")).click(_.bind(this.clickHandler, this));
        $(this.get("container")).bind('tab:set:refresh', _.bind(this.setRefresh, this));
        
        $(this.get("visualization_selector")).hide();
        $(this.get('dashboard_selector')).hide();
    },
    hideVisualization: function() {
        if ($('.tab-visualizations', this.get("selector")).parent().parent().hasClass("tab-selected")) {
            $('.tab-visualizations', this.get("selector")).parent().parent().toggleClass("tab-selected");
            $(this.get("visualization_selector")).hide();
        }
    },
    hideDashboard: function() {
        if ($('.tab-dashboards', this.get("selector")).parent().parent().hasClass("tab-selected")) {
            $('.tab-dashboards', this.get("selector")).parent().parent().toggleClass("tab-selected");
            $(this.get('dashboard_selector')).hide();            
        }
    },
    hideDatastream: function() {
        if ($('.tab-datastreams', this.get("selector")).parent().parent().hasClass("tab-selected")) {
            $('.tab-datastreams', this.get("selector")).parent().parent().toggleClass("tab-selected");
            $(this.get('datastream_selector')).hide();            
        }
    },
    clickHandler: function(event) {
        var $Target = $(event.target);
        
        if ($Target.hasClass("tab-datastreams") && ! $Target.parent().parent().hasClass("tab-selected")) {
            $(this.get("datastream_container")).trigger("datatable:get:tab_refresh");
            if (this.get("refresh")) {
                $(this.get("datastream_container")).trigger("datatable:refresh:tab_manager");
            }
            this.hideVisualization();
            this.hideDashboard();
            $(this.get('datastream_selector')).show();
            $Target.parent().parent().toggleClass("tab-selected");
        }
        else if ($Target.hasClass("tab-visualizations") && ! $Target.parent().parent().hasClass("tab-selected")) {
            $(this.get("visualization_container")).trigger("datatable:get:tab_refresh");
            if (this.get("refresh")) {
                $(this.get("visualization_container")).trigger("datatable:refresh:tab_manager");
            }
            this.hideDatastream();
            this.hideDashboard();
            $(this.get('visualization_selector')).show();
            $Target.parent().parent().toggleClass("tab-selected");
        }
        else if ($Target.hasClass("tab-dashboards") && ! $Target.parent().parent().hasClass("tab-selected")) {
            $(this.get("dashboard_container")).trigger("datatable:get:tab_refresh");
            if (this.get("refresh")) {            
                $(this.get("dashboard_container")).trigger("datatable:refresh:tab_manager");                
            }
            this.hideVisualization();
            this.hideDatastream();
            $(this.get('dashboard_selector')).show();
            $Target.parent().parent().toggleClass("tab-selected");
        }
    }
});