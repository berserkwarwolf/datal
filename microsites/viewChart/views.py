from django.conf import settings
from django.http import HttpResponse, Http404
from django.views.decorators.clickjacking import xframe_options_exempt
from core.helpers import RequestProcessor
from core.choices import ChannelTypes
from core.models import *
from core.docs import VZ, DS
from core.engine import invoke, invoke_chart
from core.helpers import get_domain_with_protocol
from core.shortcuts import render_to_response
from core.daos.visualizations import VisualizationHitsDAO
from microsites.viewChart import forms
from microsites.helpers import set_dataset_impl_type_nice
from core.daos.visualizations import VisualizationHitsDAO
from django.template import loader, Context

import urllib
import json
import logging

def hits_stats(request, vz_id, channel_type=None):
    """
    hits stats for chart visualization
    """

    try:
        vz = Visualization.objects.get(pk=int(vz_id))
    except Visualization.DoesNotExist:
        raise Http404


    dao=VisualizationHitsDAO(vz)
    hits=dao.count_by_days(31, channel_type)

    field_names=[unicode(ugettext_lazy('REPORT-CHART-DATE')),unicode(ugettext_lazy('REPORT-CHART-TOTAL_HITS'))]


    t = loader.get_template('viewChart/chart_hits_stats.html') 
    c = Context({'data':hits, 'field_names': field_names, "request": request})
    return HttpResponse(t.render(c), content_type="application/json")


def action_charttest(request):
    """
    Test Show for a chart visualization
    """

    base_uri = get_domain_with_protocol('microsites')
    preferences = request.preferences

    return render_to_response('viewChart/chart_test.html', locals())

def action_view(request, id, slug):
    """
    Show a microsite view
    """
    try:
        account = request.account
        is_free = False
    except AttributeError:
        try:
            account_id = Visualization.objects.values('user__account_id').get(pk=id)['user__account_id']
            account = Account.objects.get(pk=account_id)
            is_free = True
        except (Visualization.DoesNotExist, Account.DoesNotExist), e:
            return HttpResponse("Viz doesn't exist!")  # TODO

    preferences = request.preferences
    if not is_free:
        base_uri = 'http://' + preferences['account_domain']
    else:
        base_uri = get_domain_with_protocol('microsites')

    try:
        visualizationrevision_id    = VisualizationRevision.objects.get_last_published_id(id)
        visualization_revision      = VZ(visualizationrevision_id, preferences['account_language'])
        # verify if this account is the owner of this viz
        vis = Visualization.objects.get(pk=id)
        if account.id != vis.user.account.id:
            raise Http404

        #for datastream sidebar functions (downloads and others)
        datastream = DS(visualization_revision.datastreamrevision_id, preferences['account_language'])
        impl_type_nice = set_dataset_impl_type_nice(datastream.impl_type).replace('/',' ')
    except VisualizationRevision.DoesNotExist:
        return HttpResponse("Viz-Rev doesn't exist!")  # TODO
    else:

        #url_query = urllib.urlencode(RequestProcessor(request).get_arguments(datastream.parameters))
        chartSizes = settings.DEFAULT_MICROSITE_CHART_SIZES
        chartWidth = chartSizes["embed"]["width"]
        chartHeight = chartSizes["embed"]["height"]
        url_query = "width=%d&height=%d" % (chartWidth, chartHeight)

        can_download    = preferences['account_dataset_download'] == 'on' or preferences['account_dataset_download'] or preferences['account_dataset_download'] == 'True'
        can_export      = True
        can_share       = False

        VisualizationHitsDAO(visualization_revision.visualization).add(ChannelTypes.WEB)


        visualization_revision_parameters = RequestProcessor(request).get_arguments(visualization_revision.parameters)

        chart_type = json.loads(visualization_revision.impl_details).get('format').get('type')

        try:
            if chart_type != "mapchart":
                visualization_revision_parameters['pId'] = visualization_revision.datastreamrevision_id
                result, content_type = invoke(visualization_revision_parameters)
                #logger = logging.getLogger(__name__)
                #logger.debug(result)

            else:
                join_intersected_clusters = request.GET.get('joinIntersectedClusters',"1")
                #visualization_revision_parameters['pId'] = visualization_revision.visualizationrevision_id
                #visualization_revision_parameters['pLimit'] = 1000
                #visualization_revision_parameters['pPage'] = 0
                # mapCharts are loaded by ajax after
                # result, content_type = invoke_chart(visualization_revision_parameters)
        except:
            result = '{fType="ERROR"}'

        visualization_revision_parameters = urllib.urlencode(visualization_revision_parameters)

        return render_to_response('viewChart/index.html', locals())

@xframe_options_exempt
def action_embed(request, guid):
    """
    Show an embed microsite view
    """
    account     = request.account
    preferences = request.preferences
    base_uri = 'http://' + preferences['account_domain']

    try:
        visualizationrevision_id = VisualizationRevision.objects.get_last_published_by_guid(guid)
        visualization_revision = VZ(visualizationrevision_id, preferences['account_language'])

        datastream = DS(visualization_revision.datastreamrevision_id, preferences['account_language'])
    except:
        return render_to_response('viewChart/embed404.html',{'settings': settings, 'request' : request})

    VisualizationHitsDAO(visualization_revision.visualization).add(ChannelTypes.WEB)
    width     = request.REQUEST.get('width', False) # TODO get default value from somewhere
    height    = request.REQUEST.get('height', False) # TODO get default value from somewhere

    visualization_revision_parameters = RequestProcessor(request).get_arguments(visualization_revision.parameters)
    visualization_revision_parameters['pId'] = visualization_revision.datastreamrevision_id
    json, type = invoke(visualization_revision_parameters)
    visualization_revision_parameters = urllib.urlencode(visualization_revision_parameters)

    return render_to_response('viewChart/embed.html', locals())

def action_invoke(request):
    form = forms.RequestForm(request.GET)
    if form.is_valid():
        preferences = request.preferences
        try:
            visualizationrevision_id    = form.cleaned_data.get('visualization_revision_id')
            visualization_revision      = VZ(visualizationrevision_id, preferences['account_language'])
        except VisualizationRevision.DoesNotExist:
            return HttpResponse("Viz doesn't exist!") # TODO
        else:
            query        = RequestProcessor(request).get_arguments(visualization_revision.parameters)
            query['pId'] = visualizationrevision_id

            zoom = form.cleaned_data.get('zoom')
            if zoom is not None:
                query['pZoom'] = zoom

            bounds = form.cleaned_data.get('bounds')
            if bounds is not None:
                query['pBounds'] = bounds
            else:
                query['pBounds'] = ""

            limit = form.cleaned_data.get('limit')
            if limit is not None:
                query['pLimit'] = limit

            page = form.cleaned_data.get('page')
            if page is not None:
                query['pPage'] = page

            #query["ver"] = 6
            #return HttpResponse(str(query) + str(request.GET), "json")

            result, content_type = invoke_chart(query)
            if not result:
                result = "SIN RESULTADO para %s" % query
            return HttpResponse(result, mimetype=content_type)
    else:
        return HttpResponse('Form Error!')
