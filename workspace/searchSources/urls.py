from django.conf.urls import *
from .views import action_search_source

urlpatterns = patterns(
    '',
    url(r'^action_search$', action_search_source, name='source_manager.action_search'),
)
