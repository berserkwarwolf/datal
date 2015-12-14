
from rest_framework.response import Response

class RetriveHitsMixin(object):
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        self.hits_dao(instance).add(1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)