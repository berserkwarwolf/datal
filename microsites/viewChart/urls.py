from django.conf.urls import *
from microsites.viewChart.views import *

urlpatterns = patterns('',
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)/$', 'microsites.viewChart.views.action_view', name='chart_manager.action_view'),

    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).download$', 'core.datastream_manager.views.action_download', name='datastream_manager.action_download'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).csv$', 'core.datastream_manager.views.action_csv', name='datastream_manager.action_csv'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).html$', 'core.datastream_manager.views.action_html', name='datastream_manager.action_html'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).xls(?:$|x$)', 'core.datastream_manager.views.action_xls', name='datastream_manager.action_xls'),
    
    url(r'^invoke$', 'microsites.viewChart.views.action_invoke', name='chart_manager.action_invoke'),

    url(r'^get_last_30_days_visualization/(?P<vz_id>\d+)$', hits_stats, name='chart_manager.get_last_30_days_visualization'),
)
