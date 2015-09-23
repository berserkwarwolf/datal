from rest_framework.decorators import list_route
from core.serializers import EngineSerializer
from core import rest

import logging
import json

logger = logging.getLogger(__name__)


class RestDataStreamViewSet(rest.RestDataStreamViewSet):
    @list_route(methods=['get'])
    def sample(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'preview', is_detail=False, serializer_class=EngineSerializer)

class RestMapViewSet(rest.RestMapViewSet):
    @list_route(methods=['get'])
    def sample(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'preview_chart', is_detail=False, serializer_class=EngineSerializer)

class RestChartViewSet(rest.RestChartViewSet):
    @list_route(methods=['get'])
    def sample(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'preview_chart', is_detail=False, serializer_class=EngineSerializer)