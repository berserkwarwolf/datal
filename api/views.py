from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework import status, mixins
from rest_framework.settings import api_settings
from core.models import DataStream, DataStreamRevision, DataStreamParameter
from core.models import GuidModel
from core.datastream_manager import forms
from core.engine import invoke
from core.helpers import RequestProcessor
from core.daos.datasets import DatasetDBDAO
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO
from core.search.elastic import ElasticFinderManager
from api.serializers import *

import logging
import json

logger = logging.getLogger(__name__)

class ResourceViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin):
    queryset = GuidModel
    lookup_field = 'guid'
    serializer_class = ResourceSerializer
    data_types = ['dt', 'ds', 'vt']

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
        return super(ResourceViewSet, self).get_queryset().get(
            language=self.request.auth['language'],
            guid=self.kwargs['guid']
        )

class DataStreamViewSet(ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'
    data_types = ['ds']

    @detail_route(methods=['get'])
    def data(self, request, guid=None, pk=None, format='json'):
        datastream = self.get_object()
        mutable_get = request.GET.copy()
        mutable_get['datastream_revision_id'] = datastream['last_published_revision_id']
        form = forms.RequestForm(mutable_get)
        if form.is_valid():
            query = RequestProcessor(request).get_arguments_no_validation()
            query['pId'] = form.cleaned_data.get('datastream_revision_id')
            limit = form.cleaned_data.get('limit')
            query['pLimit'] = limit or 50

            ivk = invoke(query)
            if ivk:
                return Response(json.loads(ivk[0]))
        return Response('{"Error":"No invoke"}', status=status.HTTP_400_BAD_REQUEST)


class DataSetViewSet(ResourceViewSet):
    queryset = DatasetDBDAO()
    serializer_class = DataSetSerializer
    lookup_field = 'guid'
    data_types = ['dt']

class VisualizationViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'guid'
    data_types = ['vt']