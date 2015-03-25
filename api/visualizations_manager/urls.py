from django.conf.urls import *
from api.visualizations_manager.views import *

urlpatterns = patterns('',
    (r'^last?', action_last),
    (r'^top?', action_top),
)
