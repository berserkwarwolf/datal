from django.conf.urls import *
from api.v2.datastreams.views import *
from api.views import DataStreamViewSet
from django.conf.urls.static import static

from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'datastreams', DataStreamViewSet)

urlpatterns = patterns('',
    (r'^datastreams/', include('api.datastreams_manager.urls')),
    (r'^bigdata/', include('api.bigdata_manager.urls')),
    (r'^datasets/', include('api.datasets_manager.urls')),
    (r'^visualizations/', include('api.visualizations_manager.urls')),
    (r'^dashboards/', include('api.dashboards_manager.urls')),
    (r'^sources/', include('api.sources_manager.urls')),
    (r'^users/', include('api.users_manager.urls')),
    (r'^resources/', include('api.resources_manager.urls')),
    #(r'^messages/', include('api.messages_manager.urls')),
    (r'^transparency/', include('api.transparency_manager.urls')),

    # -----------------------------------------------------------------------
    # API v2
    # -----------------------------------------------------------------------

    (r'^api/v2/datastreams/(?P<guid>[A-Z0-9\-]+)$', view), # GET datastreams metadata
    (r'^api/v2/datastreams/(?P<guid>[A-Z0-9\-]+)/rows(\.)?(?P<data_format>[a-z\_]+)?$', invoke), # GET datastreams data & metadata
    (r'^api/v2/datastreams$', action_update), # CREATE | UPDATE | PATCH A DATASTREAM


    (r'^api/v1/', include(router.urls)), 

)

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'api.exceptions.Http404'
handler500 = 'api.exceptions.Http500'