from rest_framework import serializers
from core.models import DataStream
from core.docs import DS
from api.helpers import add_domain_to_datastream_link


class DataStreamSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    user = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
    created_at = serializers.DateTimeField()
    source = serializers.CharField()
    link = serializers.CharField()
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    result = serializers.DictField()

    def to_representation_model(self, obj):
        pass

    def to_representation_search(self, obj):
        pass

    def to_representation_dao(self, obj):
        pass

    def to_representation(self, obj):
        answer = super(DataStreamSerializer, self).to_representation(obj)

        answer['']

        answer['id']=doc.guid
        answer['title']=doc.title
        answer['description']=doc.description
        answer['user']=doc.created_by_nick
        answer['tags']=doc.get_tags()
        answer['created_at']=str(doc.created_at)
        answer['source']=doc.filename
        answer['link']=doc.permalink()
        add_domain_to_datastream_link(answer)

        if doc.parameters:
            parameters = []
            for param in doc.parameters:
                parameters.append({
                                   "name": param.name,
                                   "position": param.position,
                                   "description": param.description,
                                  })
            answer['parameters'] = parameters
        return answer