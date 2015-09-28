from rest_framework.decorators import detail_route, list_route
from core.rest.views import ResourceViewSet
from workspace.v8.forms import VisualizationRequestForm, VisualizationPreviewForm
from core.daos.visualizations import VisualizationDBDAO
from api.rest.visualizations import VisualizationSerializer

class RestChartViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = VisualizationSerializer
    lookup_field = 'id'
    dao_get_param = 'visualization_revision_id'
    data_types = ['vz']
    dao_pk = 'visualization_revision_id' 

    @detail_route(methods=['get'])
    def data(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'invoke', format,
            form_class=VisualizationRequestForm,
            serialize=False)

    @list_route(methods=['get'])
    def sample(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'preview', format,
            form_class=VisualizationPreviewForm,
            serialize=False,
            is_detail=False)