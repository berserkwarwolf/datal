from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^$', 'microsites.transparency_manager.views.action_view', name='transparency_manager.action_view'),
)
