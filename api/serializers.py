from rest_framework import serializers
from core.models import DataStream
from core.docs import DS
from api.helpers import add_domain_to_datastream_link


class DataStreamSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    user = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
    created_at = serializers.DateTimeField()
    endpoint = serializers.CharField()
    link = serializers.CharField()
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    result = serializers.DictField()

    def tryKeysOnDict(self, toDict, toKey, fromDict, fromKeys):
        toDict[toKey] = None
        for key in fromKeys:
            if key in fromDict:
                toDict[toKey]=fromDict[key]


    def to_representation(self, obj):
        answer={}

        self.tryKeysOnDict(answer, 'id', obj, ['guid'])
        self.tryKeysOnDict(answer, 'title', obj, ['title'])
        self.tryKeysOnDict(answer, 'description', obj, ['description'])
        self.tryKeysOnDict(answer, 'user', obj, ['author', 'owner_nick'])
        self.tryKeysOnDict(answer, 'tags', obj, ['tags'])
        self.tryKeysOnDict(answer, 'created_at', obj, ['created_at', 'timestamp'])
        self.tryKeysOnDict(answer, 'endpoint', obj, ['endpoint', 'end_point'])
        self.tryKeysOnDict(answer, 'link', obj, ['permalink'])
        self.tryKeysOnDict(answer, 'category_id', obj, ['category_id', 'category'])
        self.tryKeysOnDict(answer, 'category_name', obj, ['category_name'])
        self.tryKeysOnDict(answer, 'parameters', obj, ['parameters'])

        answer['link'] = self.context['request'].auth['microsite_domain'] + answer['link']
        return answer