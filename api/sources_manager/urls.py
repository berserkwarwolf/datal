from django.conf.urls import *
from junar.api.sources_manager.views import *

urlpatterns = patterns('',
    (r'^checkfile', checkfileUploaded)
)