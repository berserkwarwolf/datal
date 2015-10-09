# -*- coding: utf-8 -*-
from rest_framework.decorators import detail_route
from core.daos.datasets import DatasetDBDAO
from api.rest.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet
from core.choices import ODATA_LICENSES, ODATA_FREQUENCY
from core.lifecycle.datasets import DatasetLifeCycleManager
from rest_framework import serializers
from rest_framework import mixins
from django.utils.translation import ugettext_lazy as _


class DataSetSerializer(ResourceSerializer):
    title = serializers.CharField(
        help_text=_(u'Título del conjunto de datos'))
    description = serializers.CharField(
        help_text=_(u'Descripción del conjunto de datos'))
    category = serializers.ChoiceField(tuple(),
        help_text=_(u'Nombre de la categoría para clasificar los recursos. Debe coincidir con alguna de las categorías de la cuenta'))
    notes = serializers.CharField(required=False, allow_null=True,
        help_text=_(u'Texto de la nota del conjunto de datos'))
    end_point = serializers.URLField(required=False,
        help_text=_(u'Url apuntando al recurso con los datos (archivos o página web).'))
    file = serializers.FileField(allow_null=True,
        required=False,
        help_text='Archivo a subir a la plataforma')
    license = serializers.ChoiceField(ODATA_LICENSES,
        allow_null=True, required=False,
        help_text='Tipo de licencia que aplica sobre el conjunto de datos')
    spatial = serializers.CharField(
        help_text=_(u'Zona geográfica a la cual aplica el conjunto de datos'))
    frequency = serializers.ChoiceField(ODATA_FREQUENCY,
        allow_null=True, required=False,
        help_text='Tipo de licencia que aplica sobre el conjunto de datos')
    mbox = serializers.EmailField(
        allow_null=True, required=False)

    def __init__(self, *args, **kwargs):
        super(DataStreamSerializer, self).__init__(*args, **kwargs)

        self.fields['category']= serializers.ChoiceField(
            self.getAccountCategoriesChoices(),
            help_text=self.fields['category'].help_text
        )

    def create(self, validated_data):
        lcycle = DatasetLifeCycleManager(self.context['request'].user)
        validated_data['status'] = StatusChoices.PENDING_REVIEW
        validated_data['file_data'] = validated_data['file']
        lcycle.create(**validated_data)

class DataSetViewSet(mixins.CreateModelMixin, ResourceViewSet):
    queryset = DatasetDBDAO()
    serializer_class = DataSetSerializer
    lookup_field = 'guid'
    dao_get_param = 'guid'
    data_types = ['dt']