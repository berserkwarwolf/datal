from django.conf import settings
from django.forms.formsets import formset_factory
from rest_framework.response import Response
from core.v8.factories import AbstractCommandFactory
from core.v8.forms import RequestFormSet, RequestForm
from core.v8.serializers import EngineSerializer

import logging

logger = logging.getLogger(__name__)

class EngineViewSetMixin(object):
    def engine_call(self, request, engine_method, format=None, is_detail=True, form_class=RequestForm, serialize=True):
        mutable_get = request.GET.copy()
        mutable_get.update(request.POST.copy())
        mutable_get['output'] = format or 'json'
        
        resource = {}
        if is_detail:
            resource = self.get_object()
            mutable_get['revision_id'] = resource[self.dao_pk]
        items = dict(mutable_get.items())

        # flexigrid uses RP (results per page), no LIMIT
        if items.get('rp', None) and not items.get('limit', None):
            items['limit'] = items['rp']
            del items['rp']
            
        if settings.DEBUG: logger.info('Engine_CALL %s %s' % (str(items), engine_method))
        
        formset=formset_factory(form_class, formset=RequestFormSet)
        form = formset( items)
        if not form.is_valid():
            logger.info("form errors: %s" % form.errors)
            # TODO: correct handling
            raise Exception("Wrong arguments")        

        datos = form.get_cleaned_data_plain()
        command = AbstractCommandFactory().create(engine_method, 
            self.data_types[0], form.cleaned_data)
        result = command.run()
        if not result:
            # TODO: correct handling
            raise Exception('Wrong engine answer')

        
        resource['result'] = result[0] if result[0] else {}
        resource['format'] = result[1]

        if serialize:
            serializer = self.get_serializer(resource)
            return Response(serializer.data)

        serializer = EngineSerializer(resource)
        if 'redirect' in serializer.data and serializer.data['redirect']:
            redirect = Response(serializer.data['result'],
                02, content_type='application/vnd.ms-excel')
            redirect['Location'] = serializer.data['result']['fUri']
            return redirect

        return Response(serializer.data['result'], content_type=result[1])
