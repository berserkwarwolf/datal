# -*- coding: utf-8 -*-
from rest_framework.decorators import detail_route
from core.daos.datastreams import DataStreamDBDAO
from django.utils.translation import ugettext_lazy as _
from api.rest.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet
from core.models import CategoryI18n
from rest_framework import serializers
from rest_framework import mixins

class DataStreamSerializer(ResourceSerializer):
    title = serializers.CharField(
        help_text=_(u'Título del conjunto de datos'))
    description = serializers.CharField(
        help_text=_(u'Descripción del conjunto de datos'))
    category = serializers.ChoiceField(tuple(),
        help_text=_(u'Nombre de la categoría para clasificar los recursos. Debe coincidir con alguna de las categorías de la cuenta'))
    notes = serializers.CharField(
        required=False,
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

        self.fields['category'].choices=map(lambda x: (x.slug, x.name),
            CategoryI18n.objects.filter(
                language=self.context['request'].auth['language'],
                category__account=self.context['request'].auth['account']
            )
        )
        

    def to_representation(self, obj):
        answer= super(DataStreamSerializer, self).to_representation(obj)
        self.tryKeysOnDict(answer, 'parameters', obj, ['parameters'])
        return answer

    def create(self, validated_data):
        dao = DataStreamDBDAO()
        if 'table_id' in validated_data:
            table_id = validated_data.pop('table_id')
            validated_data['select_statement'] = ('<selectStatement><Select>' + 
                                        '<Column>*</Column></Select>' +
                                        '<From><Table>%s</Table></From>' +
                                        '<Where/>' + 
                                        '</selectStatement>' ) % table_id
        dao.create(**validated_data)
    #def update(self, instance, validated_data):
    #    pass

class DataStreamViewSet(mixins.CreateModelMixin, ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'
    data_types = ['ds']
    dao_get_param = 'guid'
    dao_pk = 'datastream_revision_id'

    @detail_route(methods=['get'])
    def data(self, request, pk=None, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer
        return self.engine_call(request, 'invoke')

    def update(self, request, pk=None, *args, **kwargs):
        pass

    def partial_update(self, request, pk=None, *args, **kwargs):
        pass