from rest_framework import serializers
from core.models import DataStream
from core.docs import DS
from api.helpers import add_domain_to_datastream_link


class DataStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataStream
        fields = ()

    def to_representation(self, obj):
        language = 'en'
        if 'request' in self.context:
            request = self.context['request']
            passticket = request.GET.get('passticket', None)
            if passticket:
                language = Account.objects.get(pk=request.account_id).get_preference('account.language')
        
        datastreamrevision_id =  obj.datastreamrevision_set.latest().id #DataStreamRevision.objects.get_last_published_id(self.id)
        doc = DS(datastreamrevision_id, language)
        
        answer = super(DataStreamSerializer, self).to_representation(obj)

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