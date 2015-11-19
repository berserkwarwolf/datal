from django.conf.urls import *
from microsites.viewChart.views import *

urlpatterns = patterns('',
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)?$', 'microsites.viewChart.views.action_view', name='chart_manager.action_view'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).download$', 'microsites.viewDataStream.views.download', name='viewChart.download'),
    url(r'^get_last_30_days_visualization/(?P<vz_id>\d+)$', 'microsites.viewChart.views.hits_stats', name='chart_manager.get_last_30_days_visualization'),
)
