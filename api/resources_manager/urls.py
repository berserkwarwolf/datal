from django.conf.urls import *
from junar.api.resources_manager.views import *

urlpatterns = patterns('',
    (r'^search', action_search),
    (r'^explore', action_explore),
)