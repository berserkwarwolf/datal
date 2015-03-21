from django.conf.urls import *
from junar.core.auth.views import *

urlpatterns = patterns('',
    url(r'^grant_datastream', action_grant_datastream, name='auth.grant_datastream'),
    url(r'^grant_dashboard', action_grant_dashboard, name='auth.grant_dashboard'),
    url(r'^grant_visualization', action_grant_visualization, name='auth.grant_visualization'),
    url(r'^get_email_info', action_get_email_info, name='auth.get_email_info'),
)
