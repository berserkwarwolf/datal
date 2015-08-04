from django.conf.urls.defaults import *
from junar.api.messages_manager.views import *

urlpatterns = patterns('',
    (r'^feed', action_feed),
)
