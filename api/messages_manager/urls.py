from django.conf.urls import *
from api.messages_manager.views import *

urlpatterns = patterns('',
    (r'^feed', action_feed),
)
