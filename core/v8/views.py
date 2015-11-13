from django.conf import settings
from django.forms.formsets import formset_factory
from rest_framework.response import Response
from core.v8.factories import AbstractCommandFactory
from core.v8.forms import RequestFormSet, RequestForm
from core.v8.serializers import EngineSerializer
from django.http import HttpResponse
import urllib2
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
        
        formset=formset_factory(form_class, formset=RequestFormSet)
        form = formset(items)
        if not form.is_valid():
            logger.info("form errors: %s" % form.errors)
            # TODO: correct handling
            raise Exception("Wrong arguments")        

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

        serializer = EngineSerializer(resource, 
            context={'dao_filename': self.dao_filename})
        if 'redirect' in serializer.data and serializer.data['redirect']:
            response = HttpResponse(mimetype='application/force-download')
            response['Content-Disposition'] = 'attachment; filename="{0}"'.format(serializer.data['filename'])
            redir = urllib2.urlopen(serializer.data['result']['fUri'])
            status = redir.getcode()
            resp = redir.read()
            if settings.DEBUG: logger.info('REDIR %d %s -- %s' % (status, redir.geturl(), redir.info()))
            response.write(resp)
            return response

        response = Response(serializer.data['result'], content_type=result[1])
        
        #TODO hacer una lista de los formatos que esperan forzar una descarga y los que se mostraran en pantalla
        output = mutable_get['output']
        if output != 'json' and output != 'html': 
            # reemplazar la extension si la tuviera
            filename = serializer.data['filename']
            name = filename if len(filename.split('.')) == 1 else '.'.join(filename.split('.')[:-1])
            final_filename = '{}.{}'.format(name, output)
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(final_filename)
            
        return response
