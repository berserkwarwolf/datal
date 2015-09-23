from rest_framework.decorators import list_route
from core.serializers import EngineSerializer
from core import rest
from workspace.v8.forms import *

import logging
import json

logger = logging.getLogger(__name__)


class RestDataStreamViewSet(rest.RestDataStreamViewSet):
    @list_route(methods=['get'])
    def sample(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'preview', form_class=DatastreamPreviewForm,
            serialize=False,
            is_detail=False)

class RestMapViewSet(rest.RestMapViewSet):
    @list_route(methods=['get'])
    def sample(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'preview_chart', format,
            form_class=VisualizationPreviewMapForm,
            serialize=False,
            is_detail=False)

class RestChartViewSet(rest.RestChartViewSet):
    @list_route(methods=['get'])
    def sample(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'preview_chart', format,
            form_class=VisualizationPreviewForm,
            serialize=False,
            is_detail=False)