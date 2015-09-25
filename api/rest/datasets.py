from rest_framework.decorators import detail_route
from core.daos.datasets import DatasetDBDAO
from api.rest.serializers import ResourceSerializer
from core.rest.views import ResourceViewSet

class DataSetSerializer(ResourceSerializer):
    pass

class DataSetViewSet(ResourceViewSet):
    queryset = DatasetDBDAO()
    serializer_class = DataSetSerializer
    lookup_field = 'guid'
    dao_get_param = 'guid'
    data_types = ['dt']