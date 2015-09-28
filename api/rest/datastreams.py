from rest_framework.decorators import detail_route
from core.daos.datastreams import DataStreamDBDAO
from api.rest.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet
from rest_framework import serializers


class DataStreamSerializer(ResourceSerializer):
    result = serializers.DictField()

    def to_representation(self, obj):
        answer= super(DataStreamSerializer, self).to_representation(obj)
        self.tryKeysOnDict(answer, 'parameters', obj, ['parameters'])
        return answer

class DataStreamViewSet(ResourceViewSet):
    queryset = DataStreamDBDAO() 
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'
    data_types = ['ds']
    dao_get_param = 'guid'
    dao_pk = 'datastream_revision_id'

    @detail_route(methods=['get'])
    def data(self, request, pk=None, *args, **kwargs):
        return self.engine_call(request, 'invoke')