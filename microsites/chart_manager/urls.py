from django.conf.urls import *
from junar.microsites.chart_manager.views import *

urlpatterns = patterns('',
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)/$', 'junar.microsites.chart_manager.views.action_view', name='chart_manager.action_viewb'),
    url(r'^invoke$', 'junar.microsites.chart_manager.views.action_invoke', name='chart_manager.action_invokeb'),    
    url(r'^get_last_30_days_visualization/(?P<id>\d+)$', 'junar.core.chart_manager.views.get_last_30_days_visualization', name='chart_manager.get_last_30_days_visualizationb'),
)
