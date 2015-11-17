from rest_framework import viewsets
from rest_framework import mixins
from rest_framework import serializers
from rest_framework.response import Response
from core.daos.datasets import DatasetDBDAO
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO
from core.choices import STATUS_CHOICES_REST
from rest_framework.compat import OrderedDict
from rest_framework_extensions.cache.decorators import cache_response


import logging

logger = logging.getLogger(__name__)

class ResourceSerializer(serializers.Serializer):
    resources = ['dataset', 'datastream', 'visualization']

    def tryKeysOnDict(self, toDict, toKey, fromDict, fromKeys):
        toDict[toKey] = None
        for key in fromKeys:
            if key in fromDict:
                toDict[toKey] = fromDict[key]

    def to_representation(self, obj):
        answer = {}
        self.tryKeysOnDict(answer, 'title', obj, 
            map(lambda x: x + 'i18n__title', self.resources))
        self.tryKeysOnDict(answer, 'description', obj, 
            map(lambda x: x + 'i18n__description', self.resources))
        self.tryKeysOnDict(answer, 'user', obj, 
            map(lambda x: x + '__user__name', self.resources))
        self.tryKeysOnDict(answer, 'created_at', obj, ['created_at'])

        return OrderedDict(answer)


class MultipleResourceViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    querysets = [DatasetDBDAO, DataStreamDBDAO, VisualizationDBDAO]
    serializer_class = ResourceSerializer
        
    def get_queryset(self):
        return map(lambda x: x(), self.querysets)

    def get_status_id(self, status):
        if status:
            for id, valor in STATUS_CHOICES_REST:
                if status == valor:
                    return id

    def filter_queryset(self, querysets):
        status = self.request.query_params.get('status', None)
        status_id = self.get_status_id(status)
        filters = None
        if status_id is not None:
            filters = {'status': [status_id]}
        
        answer=[]
        for queryset in querysets:
            queryset, total = queryset.query(
                account_id=self.request.auth['account'].id,
                language=self.request.auth['language'],
                filters_dict=filters
            )
            answer.extend(list(queryset))
        return answer

    @cache_response(60 * 5, cache_errors=False)
    def list(self, request):
        return super(MultipleResourceViewSet, self).list(request)