from django.conf.urls import *
from microsites.chart_manager.views import *

urlpatterns = patterns('',
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)/$', 'microsites.chart_manager.views.action_view', name='chart_manager.action_viewb'),
    url(r'^invoke$', 'microsites.chart_manager.views.action_invoke', name='chart_manager.action_invokeb'),
    url(r'^get_last_30_days_visualization/(?P<id>\d+)$', hits_stats, name='chart_manager.get_last_30_days_visualizationb'),
)
