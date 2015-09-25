from rest_framework import serializers
import json

class EngineSerializer(serializers.Serializer):
    def to_representation(self, obj):
        if 'result' in obj:
            if ('format' in obj and obj['format'].startswith('application/json') and obj['result']):
                json_data = json.loads(obj['result'])
                redirect = False
                if json_data.get('fType') == 'REDIRECT':
                    redirect = True
                return {'result': json_data, 'redirect': redirect }
            else:
                return {'result': obj['result']}
        return {}
