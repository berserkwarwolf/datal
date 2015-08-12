from rest_framework import serializers
from core.models import DataStream


class DataStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataStream
        depth = 1
    