# -*- coding: utf-8 -*-
from rest_framework.decorators import detail_route
from core.daos.datastreams import DataStreamDBDAO
from django.utils.translation import ugettext_lazy as _
from api.rest.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet
from rest_framework import serializers
from api.rest.auth import (DatalApiPrivateForWritePermission, 
    DatalApiPermission)


class DataStreamSerializer(ResourceSerializer):
    title = serializers.CharField(
        label=ugettext_lazy( 'APP-TITLE-TEXT' ),
        help_text=_(u'Título del conjunto de datos'))
    description = serializers.CharField(
        label=ugettext_lazy( 'APP-DESCRIPTION-TEXT' ),
        help_text=_(u'Descripción del conjunto de datos'))
    category = serializers.ChoiceField(
        label=ugettext_lazy( 'APP-CATEGORY-TEXT'),
        help_text=_(u'Nombre de la categoría para clasificar los recursos. Debe coincidir con alguna de las categorías de la cuenta'))
    notes = serializers.CharField(
        required=False,
        label=ugettext_lazy( 'APP-NOTES-TEXT' ),
        help_text=_(u'Texto de la nota del conjunto de datos'))
    table_id = serializers.IntegerField(
        required=False, 
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

        # TODO: ver como se levantan las categorias de la cuenta
        self.fields['category'].choices=map(lambda x: (x.valor, x.name),
            self.context['request']['account'].category_set.all())
        

    def to_representation(self, obj):
        answer= super(DataStreamSerializer, self).to_representation(obj)
        self.tryKeysOnDict(answer, 'parameters', obj, ['parameters'])
        return answer

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