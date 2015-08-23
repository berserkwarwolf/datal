from django.conf.urls import *
from api.datastreams_manager.views import *

urlpatterns = patterns('',
    #(r'^history/(?P<guid>[A-Z0-9\-]+)$', actionHistory),
    #(r'^history/list/(?P<guid>[A-Z0-9\-]+)/(?P<uid>[0-9]+)$', actionHistoryList),
    #(r'^publish_webservice', action_publish_webservice),
    (r'^publish', action_publish),

)