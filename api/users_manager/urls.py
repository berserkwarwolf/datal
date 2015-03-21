from django.conf.urls import *
from junar.api.users_manager.views import *

urlpatterns = patterns('',
    (r'^(?P<ticket>[A-Za-z0-9\-]+)$', action_view),
)