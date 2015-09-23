from rest_framework import serializers
import json

class EngineSerializer(serializers.Serializer):
    def to_representation(self, obj):
        if 'result' in obj:
            if ('format' in obj 
                and obj['format'].startswith('application/json') and
                obj['result']):
                return json.loads(obj['result'])
            else:
                return obj['result']
        return {}
