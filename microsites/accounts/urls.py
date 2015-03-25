from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^activate', 'microsites.accounts.views.activate', name='accounts.activate'),
)
