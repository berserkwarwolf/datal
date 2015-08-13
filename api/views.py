from api.http import HttpResponseNotFound, HttpResponseServerError
from core.models import DataStream, DataStreamRevision
from rest_framework import viewsets
from api.serializers import DataStreamSerializer

def action404(p_request):
    return HttpResponseNotFound('{"error": 404, "message": "API Not Found"}')

def action500(p_request):
    return HttpResponseServerError('{"error": 500, "message": "API Internal Server Error"}')

class DataStreamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DataStream.objects.all()
    serializer_class = DataStreamSerializer
    lookup_field = 'guid'
