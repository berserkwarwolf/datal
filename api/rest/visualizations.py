from core.daos.visualizations import VisualizationDBDAO
from api.rest.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet


class VisualizationSerializer(ResourceSerializer):
    pass


class VisualizationViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'guid'
    dao_get_param = 'guid'
    data_types = ['vz']
    app = 'microsites'
