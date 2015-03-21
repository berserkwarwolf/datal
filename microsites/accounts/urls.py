from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^activate', 'junar.microsites.accounts.views.activate', name='accounts.activate'),
)
