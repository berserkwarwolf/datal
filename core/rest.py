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
from api.serializers import DataStreamSerializer, VisualizationSerializer, DataSetSerializer, ResourceSerializer
from core.v8.factories import AbstractCommandFactory
from core.v8.forms import ArgumentForm, RequestFormSet
from core.serializers import EngineSerializer
from workspace.v8.forms import *


import logging
import json

logger = logging.getLogger(__name__)

class ResourceViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin):
    queryset = GuidModel
    lookup_field = 'guid'
    serializer_class = ResourceSerializer
    data_types = ['dt', 'ds', 'vz']
    command_factory = AbstractCommandFactory().create()
    
    def list(self, request, format='json'):
        limit = self.request.query_params.get('limit', None)
        offset = self.request.query_params.get('offset', '0')
        page_num = int(offset)/int(limit) + 1 if limit else 0

        datastreams, time, facets = ElasticFinderManager().search(
            query=request.query_params.get('query', ''),
            slice=int(limit) if limit else None,
            page=page_num,
            account_id=request.auth['account'].id,
            user_id=request.user.id,
            resource=self.get_data_types(),
            order=request.query_params.get('order', ''))

        page = self.paginate_queryset(datastreams)
        if page is not None:
            self.paginator.count = time['count']
            serializer = self.get_serializer(datastreams, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(datastreams, many=True,
            context={'request':request} )

        return Response(serializer.data)

    def get_data_types(self):
        if hasattr(self, 'data_types'):
            return self.data_types
        return []

    def get_queryset(self):
        params = {'language': self.request.auth['language'] }
        params[self.dao_get_param] = self.kwargs[self.lookup_field]
        return super(ResourceViewSet, self).get_queryset().get(**params)

    def get_object(self):
        obj = self.get_queryset()
        if not obj:
            raise Http404

        self.check_object_permissions(self.request, obj)
        return obj

    def engine_call(self, request, engine_method, is_detail=True, form_class=ArgumentForm, serialize=True):
        mutable_get = request.GET.copy()
        resource = {}
        if is_detail:
            resource = self.get_object()
            mutable_get[self.engine_pk] = resource[self.dao_pk]
        items = dict(mutable_get.items())

        formset=formset_factory(form_class, formset=RequestFormSet)
        form = formset( items)
        if not form.is_valid():
            # TODO: correct handling
            raise Exception("Wrong arguments")        

        result = self.command_factory.create(engine_method, form.cleaned_data).run()
        if not result:
            # TODO: correct handling
            raise Exception('Wrong engine answer')

        
        resource['result'] = result[0] if result[0] else {}
        resource['format'] = result[1]

        if serialize:
            serializer = self.get_serializer(resource)
            return Response(serializer.data)
        return Response(result[0])


class RestDataSetViewSet(ResourceViewSet):
    queryset = DatasetDBDAO()
    serializer_class = DataSetSerializer
    lookup_field = 'id'
    data_types = ['dt']
    dao_get_param = 'dataset_revision_id'
    dao_pk = 'dataset_revision_id'
    engine_pk = 'dataset_revision_id'

    @detail_route(methods=['get'])
    def tables(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'load', 
            serialize=False)

class RestDataStreamViewSet(ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'id'
    data_types = ['ds']
    dao_get_param = 'datastream_revision_id'
    dao_pk = 'datastream_revision_id'
    engine_pk = 'datastream_revision_id'

    @detail_route(methods=['get'])
    def data(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'invoke', 
            form_class=DatastreamRequestForm,
            serialize=False)

#    @list_route(methods=['get'])
#    def sample(self, request, pk=None, *args, **kwargs):
#        return self.engine_call( request, 'preview', EngineSerializer)

class RestMapViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'id'
    dao_get_param = 'visualization_revision_id'
    data_types = ['vz']
    dao_pk = 'visualization_revision_id'
    engine_pk = 'visualization_revision_id'    

    @detail_route(methods=['get'])
    def data(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'chart', 
            serialize=False)

#    @detail_route(methods=['get'])
#    def sample(self, request, pk=None, *args, **kwargs):
#        return self.engine_call( request, 'preview_chart', EngineSerializer)

class RestChartViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'id'
    dao_get_param = 'visualization_revision_id'
    data_types = ['vz']
    dao_pk = 'visualization_revision_id'
    engine_pk = 'visualization_revision_id'    

    @detail_route(methods=['get'])
    def data(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'chart', serialize=False)