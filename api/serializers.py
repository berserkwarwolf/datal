from rest_framework import serializers
from core.models import DataStream
from core.docs import DS


class DataStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataStream
    
    def to_representation(self, obj):
        language = 'en' # TODO: need to get from user
        try:
            datastreamrevision_id =  obj.datastreamrevision_set.latest().id #DataStreamRevision.objects.get_last_published_id(self.id)
            doc = DS(datastreamrevision_id, language)
        except Exception:
            raise


        answer = super(DataStreamSerializer, self).to_representation(obj)

        answer['id']=doc.guid
        answer['title']=doc.title
        answer['description']=doc.description
        answer['user']=doc.created_by_nick
        answer['tags']=doc.get_tags()
        answer['created_at']=str(doc.created_at)
        answer['source']=doc.filename
        answer['link']=doc.permalink()

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