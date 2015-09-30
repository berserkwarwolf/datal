from rest_framework.decorators import detail_route
from core.daos.datastreams import DataStreamDBDAO
from core.v8.serializers import EngineSerializer
from core.rest.views import ResourceViewSet
from core.v8.forms import DatastreamRequestForm
from rest_framework import renderers
from core.v8.renderers import (CSVEngineRenderer, XLSEngineRenderer, 
                               HTMLEngineRenderer, GridEngineRenderer)

class RestDataStreamViewSet(ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = EngineSerializer
    lookup_field = 'id'
    data_types = ['ds']
    dao_get_param = 'datastream_revision_id'
    dao_pk = 'datastream_revision_id'

    @detail_route(methods=['get'], renderer_classes=[
        renderers.JSONRenderer,
        renderers.BrowsableAPIRenderer,
        CSVEngineRenderer,
        XLSEngineRenderer,
        HTMLEngineRenderer,
        GridEngineRenderer])
    def data(self, request, format=None, *args, **kwargs):
        if format == 'grid':
            return self.engine_call( request, 'invoke', 'json',
                form_class=DatastreamRequestForm,
                serialize=False)    
        return self.engine_call( request, 'invoke', format,
            form_class=DatastreamRequestForm,
            serialize=False)