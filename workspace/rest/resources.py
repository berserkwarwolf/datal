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
from rest_framework_extensions.key_constructor.constructors import DefaultKeyConstructor
from rest_framework_extensions.key_constructor.bits import QueryParamsKeyBit, PaginationKeyBit
from django.conf import settings


import logging

logger = logging.getLogger(__name__)

class ResourceSerializer(serializers.Serializer):
    resources = ['dataset', 'datastream', 'visualization']
    resource_type = serializers.CharField()
    created_at = serializers.DateTimeField()

    @classmethod
    def get_mapping_dict(cls):
        return {
            'title': map(lambda x: x + 'i18n__title', cls.resources),
            'description': map(lambda x: x + 'i18n__description', cls.resources),
            'user': map(lambda x: x + '__user__name', cls.resources),
            'category': ['category__categoryi18n__slug', 'visualization__datastream__last_revision__category__categoryi18n__slug']

        }

    @classmethod
    def tryKeysOnDict(cls, toDict, toKey, fromDict, fromKeys):
        toDict[toKey] = None
        for key in fromKeys:
            if key in fromDict:
                toDict[toKey] = fromDict[key]

    def get_status_name(self, status_id):
        for id, valor in STATUS_CHOICES_REST:
            if id == status_id:
                return valor

    def to_representation(self, obj):
        answer = super(ResourceSerializer, self).to_representation(obj)
        for key, value in self.get_mapping_dict().items():
            self.tryKeysOnDict(answer, key, obj, value)

        answer['status'] = self.get_status_name(obj['status'])

        return OrderedDict(answer)


def order_method(lista):
    def order_inner(obj):
        for ele in lista:
            if ele in obj:
                return obj[ele]
        return ele['id']
    return order_inner

class CacheKeyConstructor(DefaultKeyConstructor):
    params = QueryParamsKeyBit()
    pagination = PaginationKeyBit()

class MultipleResourceViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ResourceSerializer
    resources_types = (
        (DatasetDBDAO, settings.TYPE_DATASET),
        (DataStreamDBDAO, settings.TYPE_DATASTREAM),
        (VisualizationDBDAO, settings.TYPE_VISUALIZATION)
    )
        
    def get_queryset(self):
        return map(lambda x: x(), dict(self.resources_types).keys())

    def get_status_id(self, status):
        if status:
            for id, valor in STATUS_CHOICES_REST:
                if status == valor:
                    return id

    def order_queryset(self, queryset):
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            reverse = False
            if ordering[0] == '-':
                reverse = True
                ordering = ordering.strip('-')
            mapping_dict = ResourceSerializer.get_mapping_dict()
            order_list = []
            if ordering in mapping_dict.keys():
                order_list = mapping_dict[ordering]
            else:
                order_list = [ordering]
            return sorted(queryset, key=order_method(order_list), reverse=reverse)
        return queryset

    def filter_queryset(self, querysets):
        status = self.request.query_params.get('status', None)
        status_id = self.get_status_id(status)
        category = self.request.query_params.get('category', None)
        query = self.request.query_params.get('query', None)
        

        types = dict(self.resources_types)
        resources_types = (self.request.query_params.get('resources', None) or 
                           types.values())

        answer=[]
        for queryset in querysets:
            res_type = types[type(queryset)]
            if  res_type in resources_types:
                queryset, total = queryset.query(
                    account_id=self.request.auth['account'].id,
                    language=self.request.auth['language'],
                    filter_status=status_id,
                    filter_category=category,
                    filter_text=query
                )
                for result in list(queryset):
                    result['resource_type'] = res_type
                    answer.append(result)


        return self.order_queryset(answer)

    @cache_response(60 * 5, cache_errors=False, key_func=CacheKeyConstructor())
    def list(self, request, *args, **kwargs):
        return super(MultipleResourceViewSet, self).list(request, *args, **kwargs)