from django.conf.urls import *
from microsites.viewChart.views import *

urlpatterns = patterns('',
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)/$', 'microsites.viewChart.views.action_view', name='chart_manager.action_view'),

    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).download$', 'microsites.viewDataStream.views.download', name='viewChart.download'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).csv$', 'microsites.viewDataStream.views.csv', name='viewChart.csv'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).html$', 'microsites.viewDataStream.views.html', name='viewChart.html'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).xls(?:$|x$)', 'microsites.viewDataStream.views.xls', name='viewChart.xls'),
    
    url(r'^invoke$', 'microsites.viewChart.views.action_invoke', name='chart_manager.action_invoke'),

    url(r'^get_last_30_days_visualization/(?P<vz_id>\d+)$', 'microsites.viewChart.views.hits_stats', name='chart_manager.get_last_30_days_visualization'),
)
