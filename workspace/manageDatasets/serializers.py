# -*- coding: utf-8 -*-

from rest_framework import serializers
from django.utils.translation import ugettext_lazy as _

#
class ChildDataStreamSerializer(serializers.Serializer):
    title = serializers.CharField(source='datastreami18n__title',
        help_text=_(u'Título del conjunto de datos'))
    description = serializers.CharField(source='datastreami18n__description',
        help_text=_(u'Descripción del conjunto de datos'))
    status= serializers.IntegerField(
        help_text=_(u'ID del datastream_revision publicado'))

    user_name = serializers.CharField(source='datastream__user__name',
        help_text=_(u'Nombre del usuario'))
    user_nick= serializers.CharField(source='datastream__user__nick',
        help_text=_(u'Nick del usuario'))

    guid = serializers.CharField(source='datastream__guid',
        help_text=_(u'GUID del datastream'))
    id = serializers.IntegerField(
        help_text=_(u'ID del datastream_revision'))
    datastream_id = serializers.IntegerField(source='datastream__id',
        help_text=_(u'ID del datastream'))
    last_revision= serializers.IntegerField(source='datastream__last_revision',
        help_text=_(u'ID del último datastream_revision'))
    last_published_revision= serializers.IntegerField(source='datastream__last_published_revision',
        help_text=_(u'ID del datastream_revision publicado'))

    created_at = serializers.DateTimeField(
        help_text=_(u'datetime created_at'))
    modified_at= serializers.DateTimeField(
        help_text=_(u'datetime modified_at'))
