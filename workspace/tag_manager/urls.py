from django.conf.urls import *
from junar.workspace.tag_manager.views import *

urlpatterns = patterns('',
    url(r'^action_search$', action_search, name='tag_manager.action_search'),
)
