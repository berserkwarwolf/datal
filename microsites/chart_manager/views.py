from django.conf import settings
from django.http import HttpResponse, Http404
from django.views.decorators.clickjacking import xframe_options_exempt
from core.helpers import RequestProcessor
from core.choices import ChannelTypes
from core.models import *
from core.docs import VZ
from core.http import get_domain_with_protocol
from core.shortcuts import render_to_response
from core.daos.visualizations import VisualizationHitsDAO
from core.v8.factories import AbstractCommandFactory
from microsites.chart_manager import forms
import urllib
import json

def action_view(request, id, slug):
    
    try:
        account = request.account
        is_free = False
    except AttributeError:
        try:
            account_id = Visualization.objects.values('user__account_id').get(pk=id)['user__account_id']
            account = Account.objects.get(pk=account_id)
            is_free = True
        except (Visualization.DoesNotExist, Account.DoesNotExist), e:
            raise Http404

    preferences = request.preferences
    if not is_free:
        base_uri = 'http://' + preferences['account_domain']
    else:
        base_uri = get_domain_with_protocol('microsites')

    try:
        visualizationrevision_id    = VisualizationRevision.objects.get_last_published_id(id)
        visualization_revision      = VZ(visualizationrevision_id, preferences['account_language'])
    except VisualizationRevision.DoesNotExist:
        raise Http404
    else:
        can_download    = preferences['account_dataset_download'] == 'on'
        can_export      = True
        can_share       = False
        
        VisualizationHitsDAO(visualization_revision.visualization).add(ChannelTypes.WEB)

        visualization_revision_parameters = RequestProcessor(request).get_arguments(visualization_revision.parameters) 
        
        chart_type = json.loads(visualization_revision.impl_details).get('format').get('type') 
        try:
            if chart_type != "mapchart":
                visualization_revision_parameters['pId'] = visualization_revision.datastreamrevision_id
                command_factory = AbstractCommandFactory().create() 
                result, content_type = command_factory.create(
                    "invoke", visualization_revision_parameters).run()
            else:
                join_intersected_clusters = request.GET.get('joinIntersectedClusters',"1")
#                visualization_revision_parameters['pId'] = visualization_revision.visualizationrevision_id
#                visualization_revision_parameters['pLimit'] = 1000
#                visualization_revision_parameters['pPage'] = 0                   
#                result, content_type = invoke_chart(visualization_revision_parameters)
        except:
            result = '{fType="ERROR"}'
            

        visualization_revision_parameters = urllib.urlencode(visualization_revision_parameters)
        
        return render_to_response('chart_manager/viewForm.html', locals())

@xframe_options_exempt
def action_embed(request, guid):

    account     = request.account
    preferences = request.preferences
    base_uri = 'http://' + preferences['account_domain']

    try:
        visualizationrevision_id = VisualizationRevision.objects.get_last_published_by_guid(guid)
        visualization_revision = VZ(visualizationrevision_id, preferences['account_language'])
    except:
        return render_to_response('chart_manager/embed404.html',{'settings': settings, 'request' : request})

    VisualizationHitsDAO(visualization_revision.visualization).add(ChannelTypes.WEB)
    width     = request.REQUEST.get('width', False)
    height    = request.REQUEST.get('height', False)

    visualization_revision_parameters = RequestProcessor(request).get_arguments(visualization_revision.parameters)
    visualization_revision_parameters['pId'] = visualization_revision.datastreamrevision_id
    command_factory = AbstractCommandFactory().create() 
    json, type = command_factory.create("invoke", visualization_revision_parameters).run()
    visualization_revision_parameters = urllib.urlencode(visualization_revision_parameters)

    return render_to_response('chart_manager/embed.html', locals())

def action_invoke(request):

    form = forms.RequestForm(request.GET)
    if form.is_valid():
        preferences = request.preferences
        
        try:
            visualizationrevision_id    = form.cleaned_data.get('visualization_revision_id')
            visualization_revision      = VZ(visualizationrevision_id, preferences['account_language'])
        except VisualizationRevision.DoesNotExist:
            raise Http404
        else:
            query        = RequestProcessor(request).get_arguments(visualization_revision.parameters) 
            query['pId'] = visualizationrevision_id
            
            limit = form.cleaned_data.get('limit')
            if limit is not None:
                query['pLimit'] = limit
                
            page = form.cleaned_data.get('page')
            if page is not None:
                query['pPage'] = page     
                
            bounds = form.cleaned_data.get('bounds')
            if bounds is not None:
                query['pBounds'] = bounds   
                
            zoom = form.cleaned_data.get('zoom')
            if zoom is not None:
                query['pZoom'] = zoom                                           
    
            command_factory = AbstractCommandFactory().create() 
            result, content_type = command_factory.create("chart", query).run()
    
            return HttpResponse(result, mimetype=content_type)
    else:
        return HttpResponse('Error!')

