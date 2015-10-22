from django.conf.urls import *
from .views import action_search_source, validate_source_url

urlpatterns = patterns(
    '',
    url(r'^action_search$', action_search_source, name='source_manager.action_search'),
    url(r'^validate_source_url/$', validate_source_url, name='source_manager.validate_source_url'),
)
