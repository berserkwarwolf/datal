from core.models import Source
from rest_framework import serializers, viewsets

class SourceSerializer(serializers.ModelSerializer):

    def to_representation(self, obj):
        return obj.name

    class Meta:
        model = Source 
        fields = ('name',)

# ViewSets define the view behavior.
class RestSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer

    def get_queryset(self):
        queryset = self.queryset
        term = self.request.query_params.get('term', None)
        if term is not None:
            queryset = queryset.filter(name__icontains=term)
        return queryset