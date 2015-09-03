from django.conf.urls import patterns, include
from api.views import DataStreamViewSet, DataSetViewSet, VisualizationViewSet
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'datastreams', DataStreamViewSet, base_name='datastreams')
router.register(r'datasets', DataSetViewSet, base_name='datasets')
router.register(r'visualizations', VisualizationViewSet, base_name='visualizations')

urlpatterns = patterns('',
    (r'^api/v1/', include(router.urls)), 
)

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)