from core.daos.visualizations import VisualizationDBDAO
from api.v2.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet
from core.plugins import DatalPluginPoint
from django.conf import settings
from rest_framework.exceptions import NotFound

class APIResourceSerializer(ResourceSerializer):
    def to_representation(self, obj):
        answer = super(APIResourceSerializer, self).to_representation(obj)
        answer['type'] = obj['type']
        return answer
                

class APIResourceViewSet(ResourceViewSet):
    serializer_class = APIResourceSerializer
    data_types = [settings.TYPE_DATASET, settings.TYPE_DATASTREAM, settings.TYPE_VISUALIZATION]
    app = 'microsites'

    def get_data_types(self):
        answer = []
        if hasattr(self, 'data_types'):
            answer = self.data_types
        for finder in DatalPluginPoint.get_active_with_att('finder'):
            answer.append(finder.doc_type)
        return answer

    def get_object(self):
        raise NotFound()