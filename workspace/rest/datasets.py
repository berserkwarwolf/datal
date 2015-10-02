from rest_framework.decorators import detail_route
from core.rest.views import ResourceViewSet
from core.daos.datasets import DatasetDBDAO
from api.rest.datasets import DataSetSerializer
from workspace.v8.forms import DatasetLoadForm
from core.v8.renderers import HTMLEngineRenderer

class RestDataSetViewSet(ResourceViewSet):
    queryset = DatasetDBDAO()
    serializer_class = DataSetSerializer
    lookup_field = 'id'
    data_types = ['dt']
    dao_get_param = 'dataset_revision_id'
    dao_pk = 'dataset_revision_id'

    @detail_route(methods=['get'], renderer_classes=[HTMLEngineRenderer])
    def tables(self, request, pk=None, *args, **kwargs):
        return self.engine_call( request, 'load', 
            form_class=DatasetLoadForm,
            serialize=False)
