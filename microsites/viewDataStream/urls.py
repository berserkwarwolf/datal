from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)/$', 'microsites.viewDataStream.views.action_view',
        name='viewDataStream.action_view'),
)