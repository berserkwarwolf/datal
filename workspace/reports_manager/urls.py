from django.conf.urls import patterns, url

urlpatterns = patterns('',
    # url(r'^action_query$', 'junar.workspace.reports_manager.views.action_query', name='action_query'),   
    # url(r'^action_update_visualization_list$', 'junar.workspace.reports_manager.views.action_update_visualization_list', name='action_update_visualization_list'),
    # url(r'^action_update_datastream_list$', 'junar.workspace.reports_manager.views.action_update_datastream_list', name='action_update_datastream_list'),
    url(r'^get_total_hits_chart_data$', 'junar.workspace.reports_manager.views.get_total_hits_chart_data', name='get_total_hits_chart_data'),
    url(r'^get_top_10_chart_data$', 'junar.workspace.reports_manager.views.get_top_10_chart_data', name='get_top_10_chart_data'),
)