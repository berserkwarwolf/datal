from core.models import Source
from rest_framework import serializers, viewsets

class SourceSerializer(serializers.ModelSerializer):

    def to_representation(self, obj):
        return obj.name

    class Meta:
        model = Source 
        fields = ('name',)