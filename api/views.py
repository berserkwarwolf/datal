from django.http import Http404
from django.forms.formsets import formset_factory
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework import status, mixins
from rest_framework.settings import api_settings
from core.models import DataStream, DataStreamRevision, DataStreamParameter
from core.models import GuidModel
from core.daos.datasets import DatasetDBDAO
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO
from core.search.elastic import ElasticFinderManager
from api.serializers import *
from core.v8.factories import AbstractCommandFactory
from core.v8.forms import ArgumentForm, InvokeFormSet
from core.rest import ResourceViewSet

import logging
import json

logger = logging.getLogger(__name__)


class DataStreamViewSet(ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'
    data_types = ['ds']
    dao_get_param = 'guid'
    dao_pk = 'datastream_revision_id'

    @detail_route(methods=['get'])
    def data(self, request, pk=None, *args, **kwargs):
        return self.engine_call(request, 'invoke')

class DataSetViewSet(ResourceViewSet):
    queryset = DatasetDBDAO()
    serializer_class = DataSetSerializer
    lookup_field = 'guid'
    dao_get_param = 'guid'
    data_types = ['dt']

class VisualizationViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'guid'
    dao_get_param = 'guid'
    data_types = ['vz']
