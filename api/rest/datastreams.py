# -*- coding: utf-8 -*-
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import detail_route
from core.daos.datastreams import DataStreamDBDAO
from core.daos.datasets import DatasetDBDAO
from core.lifecycle.datastreams import DatastreamLifeCycleManager
from django.utils.translation import ugettext_lazy as _
from api.rest.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet
from core.choices import DATASTREAM_IMPL_VALID_CHOICES
from core.models import Dataset
from rest_framework import serializers
from rest_framework import mixins
from core.choices import StatusChoices
from core.v8.forms import DatastreamRequestForm
from rest_framework import renderers
from core.builders.datastreams import SelectStatementBuilder, DataSourceBuilder
from core.v8.renderers import *

class DataStreamSerializer(ResourceSerializer):
    title = serializers.CharField(
        help_text=_(u'Título del conjunto de datos'))
    description = serializers.CharField(
        help_text=_(u'Descripción del conjunto de datos'))
    category = serializers.ChoiceField(tuple(),
        help_text=_(u'Nombre de la categoría para clasificar los recursos. Debe coincidir con alguna de las categorías de la cuenta'))
    notes = serializers.CharField(
        required=False,
        allow_null=True,
        help_text=_(u'Texto de la nota del conjunto de datos'))
    table_id = serializers.IntegerField(
        required=False, 
        allow_null=True,
        default=0,
        help_text=_(u'Indice de la tabla en el conjunto de datos, comenzando de cero.'))
    header_row = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text=_(u'Indice de la fila a usar como cabecera de la tabla comenzando de cero. Por defecto es vacio'))
    dataset = serializers.CharField(
        help_text=_(u'GUID del conjunto de datos asociado a la vista'))

    def __init__(self, *args, **kwargs):
        super(DataStreamSerializer, self).__init__(*args, **kwargs)

        self.fields['category']= serializers.ChoiceField(
            self.getAccountCategoriesChoices(),
            help_text=self.fields['category'].help_text
        )
        

    def to_representation(self, obj):
        answer= super(DataStreamSerializer, self).to_representation(obj)
        self.tryKeysOnDict(answer, 'parameters', obj, ['parameters'])
        return answer

    def validate(self, data):
        try:
            guid = data.pop('dataset')
            self.dataset = DatasetDBDAO().get(
                self.context['request'].auth['language'],
                guid=guid)
            data['dataset']=Dataset.objects.get(id=self.dataset['dataset_id'])
        except ObjectDoesNotExist:
            # TODO: mejorar errores
            raise serializers.ValidationError('Dataset no existe')

        if data['dataset'].last_revision.impl_type not in DATASTREAM_IMPL_VALID_CHOICES:
            raise serializers.ValidationError('El tipo de archivo no permite creacion de vistas')

        if 'table_id' in data:
            table_id = data.pop('table_id')
            data['select_statement'] = SelectStatementBuilder().build(table_id)
            data['data_source'] = DataSourceBuilder().build(table_id,
                self.dataset['last_published_revision_id'])

        if 'category' in data and data['category']:
            data['category'] = self.getCategory(data['category'])

        data['status'] = StatusChoices.PENDING_REVIEW

        data['language'] = self.context['request'].auth['language']

        return data

    def getDao(self, datastream_revision):
        return DataStreamDBDAO().get(
            datastream_revision_id=datastream_revision.id,
            language=self.context['request'].auth['language'])

    def create(self, validated_data):
        return self.getDao(DatastreamLifeCycleManager(self.context['request'].user).create(
            **validated_data)
        )

class DataStreamViewSet(mixins.CreateModelMixin, ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'
    data_types = ['ds']
    dao_get_param = 'guid'
    dao_pk = 'datastream_revision_id'

    @detail_route(methods=['get'], renderer_classes=[
        renderers.JSONRenderer,
        renderers.BrowsableAPIRenderer,
        CSVEngineRenderer,
        XLSEngineRenderer,
        TSVEngineRenderer,
        XMLEngineRenderer,
        PJSONEngineRenderer,
        AJSONEngineRenderer,])
    def data(self, request, pk=None, format=None,  *args, **kwargs):
        if format == 'json':
            return self.engine_call(request, 'invoke')
        return self.engine_call(request, 'invoke', format, 
            serialize=False,
            form_class=DatastreamRequestForm)
