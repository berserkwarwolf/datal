from django.conf.urls import *
from junar.api.v2.datastreams.views import *

urlpatterns = patterns('',
    (r'^datastreams/', include('junar.api.datastreams_manager.urls')),
    (r'^bigdata/', include('junar.api.bigdata_manager.urls')),
    (r'^datasets/', include('junar.api.datasets_manager.urls')),
    (r'^visualizations/', include('junar.api.visualizations_manager.urls')),
    (r'^dashboards/', include('junar.api.dashboards_manager.urls')),
    (r'^sources/', include('junar.api.sources_manager.urls')),
    (r'^users/', include('junar.api.users_manager.urls')),
    (r'^resources/', include('junar.api.resources_manager.urls')),
    (r'^messages/', include('junar.api.messages_manager.urls')),
    (r'^transparency/', include('junar.api.transparency_manager.urls')),

    # -----------------------------------------------------------------------
    # API v2
    # -----------------------------------------------------------------------

    (r'^api/v2/datastreams/(?P<guid>[A-Z0-9\-]+)$', action_view), # GET datastreams metadata
    (r'^api/v2/datastreams/(?P<guid>[A-Z0-9\-]+)/rows(\.)?(?P<data_format>[a-z\_]+)?$', action_invoke), # GET datastreams data & metadata
    (r'^api/v2/datastreams$', action_update), # CREATE | UPDATE | PATCH A DATASTREAM

)

handler404 = 'junar.api.exceptions.Http404'
handler500 = 'junar.api.exceptions.Http500'