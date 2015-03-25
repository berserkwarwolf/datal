from django.conf.urls import *
from api.bigdata_manager.views import *

urlpatterns = patterns('',
    (r'^mint/(?P<guid>[A-Z0-9\-]+)$', action_mint),
    (r'^(?P<namespace>\w+)/mint/(?P<guid>[A-Z0-9\-]+)$', action_mint),
    (r'^query(?:/(?P<guid>[A-Z0-9_-]+))?$', action_query),
    (r'^delete/(?P<guid>[A-Z0-9\-]+)$', action_delete),
    (r'^list_namespaces/$', action_list_namespaces),
    (r'^get_namespace/(?P<namespace>[a-zA-Z0-9\-_]+)$', action_get_namespace),
    (r'^create_namespace/(?P<namespace>[a-zA-Z0-9\-_]+)$', action_create_namespace),
    (r'^delete_namespace/(?P<namespace>[a-zA-Z0-9\-_]+)$', action_delete_namespace),
    (r'^check_namespace/(?P<namespace>[a-zA-Z0-9\-_]+)$', action_check_namespace),
    (r'^check_context/(?P<guid>[A-Z0-9\-]+)$', action_check_context),
)