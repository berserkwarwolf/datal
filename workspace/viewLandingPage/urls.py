from django.conf.urls import *
from junar.workspace.viewLandingPage.views import *

urlpatterns = patterns('',
    url(r'^load$', load, name='viewLandingPage.load')
)