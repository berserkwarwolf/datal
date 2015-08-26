from django.conf.urls import *
from api.datastreams_manager.views import *

urlpatterns = patterns('',
    (r'^(?P<guid>[A-Z0-9\-]+)$', action_view),
    (r'^invoke/(?P<guid>[A-Z0-9\-]+)$', action_invoke),
    (r'^search?', action_search),
    (r'^last?', action_last),
    (r'^publish', action_publish),

)