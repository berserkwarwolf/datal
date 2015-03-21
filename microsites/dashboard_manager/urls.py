from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^$', 'junar.microsites.views.action_dashboards', name='microsite.dashboards'),
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)/$', 'junar.microsites.dashboard_manager.views.action_view', name='dashboard_manager.action_view'),
    url(r'^action_csv$', 'junar.core.dashboard_manager.views.action_csv', name='dashboard_manager.action_csv'),
)
