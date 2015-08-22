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
from rest_framework import status
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

class DataStreamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DataStream.objects.all() # solo esta para que lo levante el router, no se usa
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'

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


    def retrieve(self, request, guid=None, format='json'):
        datastream = get_object_or_404(self.get_queryset(), guid=guid)
        datastream = DataStreamDBDAO().get(
            language='en',
            datastream_revision_id=datastream.last_published_revision.id)
        serializer = DataStreamSerializer(datastream)
        return Response(serializer.data)

    def list(self, request):
        ## Todo ver de donde saco la categoria
        account = request.auth['account']
        #language = request.auth['language'] 
        #category = Category.objects.get_for_browse(category_slug, account.id, preferences['account_language'])

        results, search_time, facets = ElasticFinderManager().search(
            resource='dt',
            account_id = account.id)

        serializer = DataStreamSerializer(results, many=True)
        return Response(serializer.data)
    