from django.conf.urls import *
from microsites.share_manager.views import *

urlpatterns = patterns('',
    url(r'^linkedin', action_linkedin, name='share_manager.action_linkedin')
)