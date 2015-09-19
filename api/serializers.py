from rest_framework import serializers
from core.models import DataStream
from rest_framework.compat import OrderedDict

class EngineSerializer(serializers.Serializer):
    def to_representation(self, obj):
        return obj['result']

class ResourceSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    user = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
    created_at = serializers.DateTimeField()
    endpoint = serializers.CharField()
    link = serializers.CharField()
    category_name = serializers.CharField()

    def tryKeysOnDict(self, toDict, toKey, fromDict, fromKeys):
        toDict[toKey] = None
        for key in fromKeys:
            if key in fromDict:
                toDict[toKey]=fromDict[key]


    def to_representation(self, obj):
        answer={}

        self.tryKeysOnDict(answer, 'guid', obj, ['guid'])
        self.tryKeysOnDict(answer, 'title', obj, ['title'])
        self.tryKeysOnDict(answer, 'description', obj, ['description'])
        self.tryKeysOnDict(answer, 'user', obj, ['author', 'owner_nick'])
        self.tryKeysOnDict(answer, 'tags', obj, ['tags'])
        self.tryKeysOnDict(answer, 'created_at', obj, ['created_at', 'timestamp'])
        self.tryKeysOnDict(answer, 'endpoint', obj, ['endpoint', 'end_point'])
        self.tryKeysOnDict(answer, 'link', obj, ['permalink'])
        self.tryKeysOnDict(answer, 'category_name', obj, ['category_name'])
        self.tryKeysOnDict(answer, 'parameters', obj, ['parameters'])
        self.tryKeysOnDict(answer, 'result', obj, ['result'])

        if answer['link']:
            domain = self.context['request'].auth['microsite_domain']
            answer['link'] = domain + answer['link']
        return OrderedDict(answer)

class DataStreamSerializer(ResourceSerializer):
    result = serializers.DictField()

    def to_representation(self, obj):
        answer= super(DataStreamSerializer, self).to_representation(obj)
        self.tryKeysOnDict(answer, 'parameters', obj, ['parameters'])

        return answer

class DataSetSerializer(ResourceSerializer):
    pass

class VisualizationSerializer(ResourceSerializer):
    pass