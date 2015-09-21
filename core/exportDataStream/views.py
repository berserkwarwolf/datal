import urllib

from django.core.urlresolvers import reverse
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_http_methods
from django.views.decorators.clickjacking import xframe_options_exempt
from django.shortcuts import get_object_or_404, HttpResponsePermanentRedirect
from core.lib.datastore import *
from core.exportDataStream import forms
from core.daos.datastreams import DataStreamDBDAO
from core.engine import invoke as engine_invoke
from core.helpers import jsonToGrid, RequestProcessor
from core.models import DataStream
from core.shortcuts import render_to_response
from core.decorators import *


@require_http_methods(["GET"])
@datal_cache_page()
def invoke(request):
    form = forms.RequestForm(request.GET)
    if form.is_valid():
        query = RequestProcessor(request).get_arguments_no_validation()
        query['pId'] = form.cleaned_data.get('datastream_revision_id')
        limit = form.cleaned_data.get('limit')
        if limit:
            query['pLimit'] = limit

        ivk = engine_invoke(query)
        # Sometimes there is no answer. Maybe engine is down
        if ivk is None:
            contents = '{"Error":"No invoke"}'
            typen = "json"
        else:
            contents, typen = ivk

        return HttpResponse(contents, mimetype=typen)
    else:
        return HttpResponse('Error! No valid form')


@require_http_methods(["GET"])
def csv(request, id, slug):

    contents, type = export_to(id, request, 'csv')

    return HttpResponse(contents, mimetype=type)


@require_http_methods(["GET"])
def xls(request, id, slug):

    logger = logging.getLogger(__name__)
        
    contents, type = export_to(id, request, 'xls')
    if not contents: # probably an engine error
        logger.error('Error al exportar XLS. No hay archivo')
        return HttpResponse('No existe el archivo', mimetype='text/html', status=500)
        
    try:
        argument = json.loads(contents)
    except Exception, e:
        logger.error('Error al exportar XML %s. Parse: %s' % (str(e), str(contents) ))
        return HttpResponse('Error parsing', mimetype='text/html', status=500)

    if settings.DEBUG: logger.info('XLS Arguments %s' % str(argument))
    if argument.get('fType') == 'REDIRECT':
        redirect = HttpResponse(status=302, mimetype='application/vnd.ms-excel')
        redirect['Location'] = argument.get('fUri')
        return redirect
    else:
        return HttpResponse(contents, mimetype=type)


@require_http_methods(["GET"])
def html(request, id, slug):
    contents, type = export_to(id, request, 'html')
    return HttpResponse(contents)


def export_to(datastream_id, request, output):

    try:
        datastream = DataStreamDBDAO().get(request.auth_manager.language, datastream_id=datastream_id, published=True)
    except:
        raise Http404
    else:
        uri = request.build_absolute_uri()
        
        query = {'pId': datastream['datastream_revision_id'], 'pOutput': output.upper()}

        arguments = RequestProcessor(request).get_arguments(datastream["parameters"])
        if arguments:
            query.update(arguments)

        filter = request.REQUEST.get('pFilter0', None)
        if filter:
            query['pFilter0'] = unicode(filter).encode('utf-8')

        return engine_invoke(query, output)


@xframe_options_exempt
@require_http_methods(["GET"])
def legacy_embed(request):
    form = forms.LegacyEmbedForm(request.GET)
    if form.is_valid():
        datastream_id = form.cleaned_data.get('dataservice_id')
        end_point = form.cleaned_data.get('end_point')
        header_row = form.cleaned_data.get('header_row', 0)
        fixed_column = form.cleaned_data.get('fixed_column', 0)

        datastream = get_object_or_404(DataStream, pk = datastream_id)
        query = urllib.urlencode({'end_point': end_point, 'header_row': header_row, 'fixed_column' : fixed_column})
        url = reverse('exportDataStream.action_embed', kwargs={'guid' : datastream.guid}) + '?' + query
        return HttpResponsePermanentRedirect(url)
    else:
        return render_to_response('datastream_manager/embed404.html', {'settings': settings, 'request' : request})


@require_http_methods(["GET"])
def updategrid(request):
    query = dict()
    query['pId'] = request.REQUEST.get('datastream_id')
    query['pLimit'] = request.REQUEST.get('rp')
    query['pPage'] = int(request.REQUEST.get('page')) - 1

    search = request.REQUEST.get('query', None)
    if search:
        query['pFilter0'] = '%s[contains]%s' % (request.REQUEST.get('qtype', 'column0'), search)

    sortname = request.REQUEST.get('sortname', None)
    sortorder = request.REQUEST.get('sortorder', None)
    if sortname:
        query['pOrderBy'] = sortname
        query['pOrderType'] = {None: 'A', 'asc': 'A', 'desc': 'D'}[sortorder]

    contents, mimetype = engine_invoke(RequestProcessor(request).get_arguments_no_validation(query))
    if not contents:
        contents = {"rows": [], "total": 1, "page": 1}
        mimetype = "application/json"
    return HttpResponse(jsonToGrid(contents, query['pPage'] + 1), mimetype=mimetype)


