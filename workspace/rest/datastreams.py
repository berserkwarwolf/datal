from rest_framework.decorators import detail_route, list_route
from core.daos.datastreams import DataStreamDBDAO
from api.rest.datastreams import DataStreamSerializer
from core.rest.views import ResourceViewSet
from core.v8.forms import DatastreamRequestForm
from workspace.v8.forms import DatastreamPreviewForm

class RestDataStreamViewSet(ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'id'
    data_types = ['ds']
    dao_get_param = 'datastream_revision_id'
    dao_pk = 'datastream_revision_id'

    @detail_route(methods=['get'])
    def data(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'invoke',
            form_class=DatastreamRequestForm,
            serialize=False)

    @list_route(methods=['get'])
    def sample(self, request, format=None, *args, **kwargs):
        return self.engine_call( request, 'preview', 
            form_class=DatastreamPreviewForm,
            serialize=False,
            is_detail=False)
