function getQueryString() {
  var result = {}, queryString = location.search.substring(1),
      re = /([^&=]+)=([^&]*)/g, m;

  while (m = re.exec(queryString)) {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }

  return result;
}

var EventsManager = Backbone.Model.extend({
    initialize: function(container, selector, analytics) {
        var self = this;
        if (self.get('analytics') != undefined) {
            if (self.get('analytics').dataview_view != undefined) {
                var it = self.get('analytics').dataview_view;
            }
            else if (self.get('analytics').dashboard_view != undefined) {
                var it = self.get('analytics').dashboard_view;
            }
            else if (self.get('analytics').search_view != undefined) {
                var it = new Array();
                var temp = self.get('analytics').search_view;
                $(self.get("container")).trigger(temp[0].trigger, [getQueryString()['q']])                
            }
            
            else {
                var it = new Array();
            }
            $.each(it, function(i, e) {
                
                if (e.event == 'dashboard_details') {
                    $(e.selector).live('click', function() {
                        var id = $(this).attr('id').split('dashboard_widget_link_')[1];
                        $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                    })
                }
                else {
                    $(e.selector).click(function() {
                    
                        switch(e.event) {
                        
                            case 'dashboard_source':
                                var id = $(this).attr('id').split('id_dashboard_dataservice_goToSource_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            case 'dashboard_dv_embed':                        
                                var id = $(this).attr('id').split('id_addEmbedDataServiceButton_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            case 'dashboard_chart_embed':                        
                                var id = $(this).attr('id').split('id_embedChartButton_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            case 'dashboard_spreadsheet':
                                var id = $(this).attr('id').split('id_googlespreadsheetDataStreamButton_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            case 'dashboard_dv_csv':
                                var id = $(this).attr('id').split('id_exportToCSV_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            case 'dashboard_dv_guid':
                                var id = $(this).attr('id').split('id_guidDataStreamButton_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            case 'dashboard_search':
                                $(self.get("container")).trigger(e.trigger, [$('#junar_search_text').val()]);
                                break;
                            case 'dataview_search':
                                $(self.get("container")).trigger(e.trigger, [$('#junar_search_text').val()]);
                                break;
                            case 'dashboard_dv_reload':
                                var id = $(this).attr('id').split('id_resetDashboardDataServiceButton_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            case 'dashboard_chart_reload':
                                var id = $(this).attr('id').split('id_refreshChartButton_')[1];
                                $(self.get("container")).trigger(e.trigger, [$('#id_dashboard_dataservice_container_'+id).data('datastream_permalink')]);
                                break;
                            default:
                                $(self.get("container")).trigger(e.trigger);
                                break;
                        }
                    });
            }
            });
        }
    },
});