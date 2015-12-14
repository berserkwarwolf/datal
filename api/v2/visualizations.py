from core.daos.visualizations import VisualizationDBDAO, VisualizationHitsDAO
from api.v2.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet
from rest_framework.response import Response


class VisualizationSerializer(ResourceSerializer):
    pass


class VisualizationViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'guid'
    dao_get_param = 'guid'
    data_types = ['vz']
    app = 'microsites'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        VisualizationHitsDAO(instance).add(1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)