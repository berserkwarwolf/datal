from rest_framework.decorators import detail_route
from core.daos.visualizations import VisualizationDBDAO
from core.v8.serializers import EngineSerializer
from core.rest.views import ResourceViewSet
from microsites.v8.forms import VisualizationRequestForm

class RestMapViewSet(ResourceViewSet):
    queryset = VisualizationDBDAO()
    serializer_class = EngineSerializer
    lookup_field = 'id'
    dao_get_param = 'visualization_revision_id'
    data_types = ['vz']
    dao_pk = 'visualization_revision_id'

    @detail_route(methods=['get'])
    def data(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'invoke', format,
            form_class=VisualizationRequestForm,
            serialize=False)