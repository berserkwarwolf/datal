from django.conf.urls import *
from junar.api.datasets_manager.views import *

urlpatterns = patterns('',
    (r'^refresh', action_refresh),
)
