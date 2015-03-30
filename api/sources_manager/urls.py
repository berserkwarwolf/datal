from django.conf.urls import *
from api.sources_manager.views import *

urlpatterns = patterns('',
    (r'^checkfile', checkfileUploaded)
)