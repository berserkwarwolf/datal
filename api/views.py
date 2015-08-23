from api.http import HttpResponseNotFound, HttpResponseServerError
from rest_framework.response import Response
from core.models import DataStream, DataStreamRevision, DataStreamParameter
from rest_framework import viewsets
from api.serializers import DataStreamSerializer
from rest_framework.decorators import detail_route, list_route
from core.datastream_manager import forms
from core.engine import invoke
from django.shortcuts import get_object_or_404
from core.helpers import RequestProcessor
from core.daos.datastreams import DataStreamDBDAO
from rest_framework import status, mixins
from core.models import Category
from core.search.elastic import ElasticFinderManager
import logging
import json
from core import engine

logger = logging.getLogger(__name__)

def action404(p_request):
    return HttpResponseNotFound('{"error": 404, "message": "API Not Found"}')

def action500(p_request):
    return HttpResponseServerError('{"error": 500, "message": "API Internal Server Error"}')

class ResourceViewSet(viewsets.GenericViewSet):
    def list(self, request):
        search_form = forms.SearchForm(request.GET)
        if search_form.is_valid():
            query = search_form.cleaned_data['query']
            max_results = search_form.cleaned_data['max_results']
            order = search_form.cleaned_data['order']
            if order and order=='top':
                order = "hits: desc"
            elif order and order=='last':
                order =  "timestamp:asc"

            user_id = request.user.id
            account_id = request.auth['account'].id
            datastreams, time, facets = ElasticFinderManager().search(query=query,
                                                               max_results=max_results,
                                                               account_id=account_id,
                                                               user_id=user_id,
                                                               resource=[self.data_type],
                                                               order=order)
            page = self.paginate_queryset(datastreams)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(datastreams, many=True, context={'request':request} )

            return Response(serializer.data)
        else:
            raise Response('{"Error":"No invoke"}', status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, guid=None, format='json'):
        datastream = get_object_or_404(self.get_queryset(), guid=guid)
        serializer = self.get_serializer(datastream, context={'request':request})
        return Response(serializer.data)

class DataStreamViewSet(ResourceViewSet):
    queryset = DataStream.objects.all() # solo esta para que lo levante el router, no se usa
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'
    data_type = 'ds'

    @detail_route(methods=['get'])
    def rows(self, request, guid=None, pk=None, format='json'):
        datastream = self.get_object()
        mutable_get = request.GET.copy()
        mutable_get['datastream_revision_id'] = datastream.last_published_revision_id
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


    def get_queryset(self):
        datastream = DataStream.objects.get(guid=self.kwargs['guid'])
        return DataStreamDBDAO().get(
            language='en',
            datastream_revision_id=datastream.last_published_revision.id)

    

    