from django.conf.urls import *
from junar.core.transparency_manager.views import *

urlpatterns = patterns('',
    (r'^categories/create$', action_create_transparency_categories),
    )