from api.views import ResourceViewSet 
from api.serializers import EngineSerializer, DataStreamSerializer, VisualizationSerializer
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO
from rest_framework.decorators import detail_route

class RestDataStreamViewSet(ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'id'
    data_types = ['ds']
    dao_get_param = 'datastream_id'
    dao_pk = 'datastream_revision_id'
    engine_pk = 'datastream_revision_id'

    @detail_route(methods=['get'])
    def invoke(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'invoke', EngineSerializer)

class RestVisualizationViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'id'
    dao_get_param = 'visualization_revision_id'
    data_types = ['vz']
    dao_pk = 'visualization_revision_id'
    engine_pk = 'visualization_revision_id'    

    @detail_route(methods=['get'])
    def chart(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'chart',EngineSerializer)