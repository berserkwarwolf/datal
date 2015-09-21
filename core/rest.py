from api.views import ResourceViewSet 
from api.serializers import EngineSerializer, DataStreamSerializer, VisualizationSerializer, DataSetSerializer
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO
from core.daos.datasets import DatasetDBDAO
from rest_framework.decorators import detail_route

class RestDataSetViewSet(ResourceViewSet):
    queryset = DatasetDBDAO()
    serializer_class = DataSetSerializer
    lookup_field = 'id'
    data_types = ['dt']
    dao_get_param = 'dataset_revision_id'
    dao_pk = 'dataset_revision_id'
    engine_pk = 'dataset_revision_id'

    @detail_route(methods=['get'])
    def load(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'load', EngineSerializer)

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

    @detail_route(methods=['get'])
    def preview(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'preview', EngineSerializer)

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

    @detail_route(methods=['get'])
    def preview(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'preview_chart', EngineSerializer)
