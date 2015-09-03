import logging
import urllib

from django.core.serializers.json import DjangoJSONEncoder
from django.core.urlresolvers import reverse
from django.db.models import Count
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_http_methods
from django.views.decorators.clickjacking import xframe_options_exempt
from django.shortcuts import get_object_or_404, HttpResponsePermanentRedirect
from django.utils.translation import ugettext_lazy
from core.lib.datastore import *
from core.cache import Cache
from core.datastream_manager import forms
from core.daos.datastreams import DataStreamDBDAO
from core.engine import invoke
from core.helpers import jsonToGrid, Day, RequestProcessor
from core.models import DataStreamRevision, DataStreamHits, DataStream
from core.shortcuts import render_to_response
from datetime import date, timedelta
from core.decorators import *



@require_http_methods(["GET"])
@datal_cache_page()
def action_invoke(request):
    form = forms.RequestForm(request.GET)
    if form.is_valid():
        query = RequestProcessor(request).get_arguments_no_validation()
        query['pId'] = form.cleaned_data.get('datastream_revision_id')
        limit = form.cleaned_data.get('limit')
        if limit:
            query['pLimit'] = limit

        ivk = invoke(query)
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
def action_csv(request, id, slug):

    contents, type = export_to(id, request, 'csv')

    return HttpResponse(contents, mimetype=type)


@require_http_methods(["GET"])
def action_xls(request, id, slug):

    contents, type = export_to(id, request, 'xls')

    argument = json.loads(contents)

    if argument.get('fType') == 'REDIRECT':
        redirect = HttpResponse(status=302, mimetype='application/vnd.ms-excel')
        redirect['Location'] = argument.get('fUri')
        return redirect
    else:
        return HttpResponse(contents, mimetype=type)


@require_http_methods(["GET"])
def action_download(request, id, slug):
    """ download internal dataset file """
    try:
        datastreamrevision_id = DataStreamRevision.objects.get_last_published_id(id)
        datastream = DataStreamDBDAO().get(request.auth_manager.language, datastream_revision_id=datastreamrevision_id)
    except:
        raise Http404
    else:
        url = active_datastore.build_url(
            request.bucket_name,
            datastream.end_point.replace("file://", ""),
            {'response-content-disposition': 'attachment; filename={0}'.format(datastream.filename.encode('utf-8'))}
        )

        content_type = settings.CONTENT_TYPES.get(settings.IMPL_TYPES.get(datastream.impl_type))
        redirect = HttpResponse(status=302, mimetype=content_type)
        redirect['Location'] = url

        return redirect


@require_http_methods(["GET"])
def action_html(request, id, slug):
    contents, type = export_to(id, request, 'html')
    return HttpResponse(contents)


def export_to(datastream_id, request, output):

    try:
        datastreamrevision_id = DataStreamRevision.objects.get_last_published_id(datastream_id)
        datastream = DataStreamDBDAO().get(request.auth_manager.language, datastream_revision_id=datastreamrevision_id)
    except:
        raise Http404
    else:
        uri = request.build_absolute_uri()
        
        query = {'pId': datastreamrevision_id, 'pOutput': output.upper()}

        arguments = RequestProcessor(request).get_arguments(datastream.parameters)
        if arguments:
            query.update(arguments)

        filter = request.REQUEST.get('pFilter0', None)
        if filter:
            query['pFilter0'] = unicode(filter).encode('utf-8')

        return invoke(query, output)


@xframe_options_exempt
@require_http_methods(["GET"])
def action_legacy_embed(request):
    form = forms.LegacyEmbedForm(request.GET)
    if form.is_valid():
        datastream_id = form.cleaned_data.get('dataservice_id')
        end_point = form.cleaned_data.get('end_point')
        header_row = form.cleaned_data.get('header_row', 0)
        fixed_column = form.cleaned_data.get('fixed_column', 0)

        datastream = get_object_or_404(DataStream, pk = datastream_id)
        query = urllib.urlencode({'end_point': end_point, 'header_row': header_row, 'fixed_column' : fixed_column})
        url = reverse('datastream_manager.action_embed', kwargs={'guid' : datastream.guid}) + '?' + query
        return HttpResponsePermanentRedirect(url)
    else:
        return render_to_response('datastream_manager/embed404.html', {'settings': settings, 'request' : request})


@require_http_methods(["GET"])
def action_updategrid(request):
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

    contents, mimetype = invoke(RequestProcessor(request).get_arguments_no_validation(query))
    if not contents:
        contents = {"rows": [], "total": 1, "page": 1}
        mimetype = "application/json"
    return HttpResponse(jsonToGrid(contents, query['pPage'] + 1), mimetype=mimetype)


def hits_stats(request, ds_id, channel_type=None):
    """ hits stats for chart datastreams """

    try:
        ds = Datastream.objects.get(pk=int(ds_id))
    except Visualization.DoesNotExist:
        raise Http404
    
    
    dao=DatastreamHitsDAO(ds)
    hits=dao.count_by_days(30, channel_type)
    
    field_names=[unicode(ugettext_lazy('REPORT-CHART-DATE')),unicode(ugettext_lazy('REPORT-CHART-TOTAL_HITS'))]
    
    
    t = loader.get_template('datastream_manager/hits_stats.json')
    c = Context({'data': list(hits), 'field_names': field_names, "request": request, "cache": dao.from_cache})
    return HttpResponse(t.render(c), content_type="application/json")

#def get_last_30_days_datastream(request, id):
#    try:
#        int(id)
#    except ValueError:
#        response = {'status': 'error'}
#    else:
#        redis_key = 'get_last_30_days_datastream_' + str(id)
#        c = Cache(db=0)
#        first_chart = c.get(redis_key)
#        if not first_chart:
#            last_30_days = date.today() - timedelta(days=30)
#            total_datastream_hits = DataStreamHits.objects.filter(
#                created_at__gte=last_30_days,
#                datastream__id=id).annotate(
#                date=Day('created_at')).annotate(
#                count=Count('created_at')).values(
#                'date', 'count')
#
#            total_datastream_hits.query.group_by = ['date']
#            first_chart = []
#            new_item = []
#            new_item.insert(0, unicode(ugettext_lazy('REPORT-CHART-DATE')))
#            new_item.insert(1, unicode(ugettext_lazy('REPORT-CHART-TOTAL_HITS')))
#            first_chart.append(new_item)
#            base = date.today()
#            dateList = [ base - timedelta(days=x) for x in range(0, 31) ]
#            dateList.reverse()
#            for day in dateList:
#                new_item = []
#                new_item.insert(0, day.isoformat())
#                new_item.insert(1, 0)
#                for item in list(total_datastream_hits):
#                    if item['date'] == day:
#                        new_item[1] = new_item[1] + item['count']
#                        break
#                first_chart.append(new_item)
#
#            c.set(redis_key, json.dumps(first_chart, cls=DjangoJSONEncoder), settings.REDIS_STATS_TTL)
#            from_redis = False
#        else:
#            first_chart = json.loads(first_chart)
#            from_redis = True
#        response = {'status': 'ok', 'chart': first_chart, 'from_redis': from_redis}
#
#    return HttpResponse(json.dumps(response), mimetype='application/json')
