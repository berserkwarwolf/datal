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
        title = resource[self.dao_title]
        filename = resource[self.dao_filename].split('/')[-1:][0].encode('utf-8')

        if settings.DEBUG: logger.info('Engine_CALL %s, %s, %s, %s' % (filename, title, str(items), engine_method))
        
        formset=formset_factory(form_class, formset=RequestFormSet)
        form = formset( items)
        if not form.is_valid():
            logger.info("form errors: %s" % form.errors)
            # TODO: correct handling
            raise Exception("Wrong arguments")        

        datos = form.get_cleaned_data_plain() # es lo mismo que items pero sin unicode

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
            # No hay datos, el motor me da una URL a la que redirigir
            redirect_to = serializer.data['result']['fUri']
            filename2 = redirect_to.split('/')[-1:][0].encode('utf-8')
            extension = redirect_to.split('.')[-1:][0]
            # evitar ugly names en las referencias locales a nuestro datastore
            if filename2.startswith('temp_'):
                # el filename origina puede ser un CSV y esta una descarga de XLSX. Asegurarse
                # la extension real
                name = filename if len(filename.split('.')) == 1 else '.'.join(filename.split('.')[:-1])
                filename2 = '{}.{}'.format(name, extension)
            
            if settings.DEBUG: logger.info('Redirect %s %s %s' % (redirect_to, filename, filename2))

            # OLD WAY, WORKING 
            
            from django.http import HttpResponse
            import urllib2
            response = HttpResponse(mimetype='application/force-download')
            # response['Content-Disposition'] = 'attachment; filename="{0}.{1}"'.format(title.encode('utf-8'), serializer.data['result']['output'])
            response['Content-Disposition'] = 'attachment; filename="{0}"'.format(filename2)
            redir = urllib2.urlopen(redirect_to)
            status = redir.getcode()
            resp = redir.read()
            if settings.DEBUG: logger.info('REDIR %d %s -- %s' % (status, redir.geturl(), redir.info()))
            response.write(resp)
            return response
            
            # Not working
            """
            # headers = {'Content-Disposition': 'attachment; filename="{}"'.format(filename2)}
            # redirect = Response(data=None, status=302, headers=headers, content_type='application/force-download')
            # redirect = Response(data=None, status=302, content_type='application/force-download')
            redirect = Response(status=302)
            redirect['Content-Disposition'] = 'attachment; filename="{}"'.format(filename2)
            redirect['Location'] = redirect_to
            return redirect
            """

        # mejorar el nombre si es una descarga
        response = Response(serializer.data['result'], content_type=result[1])
        #TODO hacer una lista de los formatos que esperan forzar una descarga y los que se mostraran en pantalla
        output = mutable_get['output']
        if output != 'json' and output != 'html': 
            # reemplazar la extension si la tuviera
            name = filename if len(filename.split('.')) == 1 else '.'.join(filename.split('.')[:-1])
            final_filename = '{}.{}'.format(name, output)
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(final_filename)
            
        return response
