from django.conf.urls import patterns, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import routers
from djangoplugins.utils import include_plugins

from core.plugins import DatalPluginPoint
from api.rest.datastreams import DataStreamViewSet
from api.rest.datasets import DataSetViewSet
from api.rest.visualizations import VisualizationViewSet

router = routers.DefaultRouter()
router.register(r'datastreams', DataStreamViewSet, base_name='datastreams')
router.register(r'datasets', DataSetViewSet, base_name='datasets')
router.register(r'visualizations', VisualizationViewSet, base_name='visualizations')

urlpatterns = patterns('',
    (r'^', include_plugins(DatalPluginPoint, urls='microsites_urls')),
    (r'^api/v1/', include(router.urls)),
)

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)