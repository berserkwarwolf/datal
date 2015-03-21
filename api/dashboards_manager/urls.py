from django.conf.urls import *
from junar.api.dashboards_manager.views import *

urlpatterns = patterns('',
    (r'^(?P<guid>[A-Z0-9\-]+)$', action_view),
    (r'^search?', action_search),
    (r'^last?', action_last),
)