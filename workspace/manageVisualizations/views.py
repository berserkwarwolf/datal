import json
import urllib

from django.http import HttpResponse
from django.db import transaction
from django.utils.translation import ugettext
from django.views.decorators.http import require_GET, require_http_methods
from django.core.serializers.json import DjangoJSONEncoder

from api.http import JSONHttpResponse
from core.shortcuts import render_to_response
from core.auth.decorators import login_required,privilege_required
from core.helpers import remove_duplicated_filters, unset_visualization_revision_nice
from core.lifecycle.visualizations import VisualizationLifeCycleManager
from core.exceptions import *
from core.engine import invoke
from core.helpers import RequestProcessor
from core.choices import *
from core.docs import VZ, DT
from core.models import VisualizationRevision,DatasetRevision
from core import helpers as LocalHelper
from microsites.daos.datastreams import DatastreamDAO
from workspace.decorators import *
from workspace.settings import *
from workspace.manageVisualizations.forms import *
from core.daos.visualizations import VisualizationDBDAO


@login_required
@requires_any_dataset()
@requires_any_datastream()
@require_GET
def list(request):
    """ list all dataviews """
    total_resources = 0
    account_domain = request.preferences['account.domain']
    #vs_dao = VisualizationDBDAO()
    if total_resources == 0 or request.GET.get('test-no-results', None) == '1':
        return render_to_response('manageVisualizations/noResults.html', locals())

    return render_to_response('manageVisualizations/index.html', locals())

@login_required
@require_GET
def filter(request, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE):
    """ filter resources """
    bb_request = request.GET
    filters = bb_request.get('filters')
    filters_dict = ''
    sort_by='-id'

    if filters is not None and filters != '':
        filters_dict = unset_visualization_revision_nice(json.loads(bb_request.get('filters')))
    if bb_request.get('page') is not None and bb_request.get('page') != '':
        page = int(bb_request.get('page'))
    if bb_request.get('itemxpage') is not None and bb_request.get('itemxpage') != '':
        itemsxpage = int(bb_request.get('itemxpage'))
    if bb_request.get('sort_by') is not None and bb_request.get('sort_by') != '':
        if bb_request.get('sort_by') == "title":
            sort_by ="visualizationi18n__title"
        if bb_request.get('sort_by') == "dataset_title":
            sort_by ="visualization__datastream__datastreamrevision__dataset__datasetrevision__dataseti18n__title"
        if bb_request.get('sort_by') == "author":
            sort_by ="visualization__user__nick"
        if bb_request.get('order')=="desc":
            sort_by = "-"+ sort_by
    #limit = int(bb_request.get('rp'))
    #sort_by = bb_request.get('sortname')
    #order = bb_request.get('sortorder')
    #filters_dict=filters_dict

    vs_dao = VisualizationDAO(user_id=request.user.id)
    resources,total_resources = vs_dao.query(account_id=request.account.id,
                                              language=request.user.language,
                                              page=page, itemsxpage=itemsxpage
                                              ,filters_dict = filters_dict, order= sort_by)

    for i in xrange(len(resources)):
        resources[i]['url'] = LocalHelper.build_permalink('manageVisualizations.view', '&visualization_revision_id=' + str(resources[i]['id']))

    mimetype = "application/json"

    return HttpResponse(json.dumps({'items':resources,'total_entries':total_resources}
                        ,cls=DjangoJSONEncoder), mimetype=mimetype)

@login_required
@require_privilege("workspace.can_delete_datastream")
@transaction.commit_on_success
def remove(request, id,type="resource"):

    """ remove resource """
    my_resource = VisualizationLifeCycleManager(user_id=request.user.id, resource_revision_id=id)
    if type == 'revision':
        removes = my_resource.remove_revision()
        if removes:
            return JSONHttpResponse(json.dumps({'status': True, 'messages': [ugettext('APP-DELETE-VISUALIZATION-REV-ACTION-TEXT')]}))
        else:
            return JSONHttpResponse(json.dumps({'status': False, 'messages': [ugettext('APP-DELETE-VISUALIZATION-REV-ACTION-ERROR-TEXT')]}))
    else:
        removes = my_resource.remove()
        if removes:
            return HttpResponse(json.dumps({'status': 'ok', 'messages': [ugettext('APP-DELETE-VISUALIZATION-ACTION-TEXT')]}), content_type='text/plain')
        else:
            return HttpResponse(json.dumps({'status': False, 'messages': [ugettext('APP-DELETE-VISUALIZATION-ACTION-ERROR-TEXT')]}), content_type='text/plain')

@login_required
@privilege_required("workspace.can_view_visualization")
@require_http_methods(["GET"])
def view(request):

    auth_manager = request.auth_manager
    form = ViewChartForm(request.GET)

    if form.is_valid():
        try:
            visualization_revision = VZ(form.cleaned_data['visualization_revision_id'], auth_manager.language)
            if visualization_revision.account_id != auth_manager.account_id:
                raise Http404
        except VisualizationRevision.DoesNotExist:
            raise Http404
        else:
            visualization_revision_parameters = RequestProcessor(request).get_arguments(visualization_revision.parameters)
            visualization_revision_parameters['pId'] = visualization_revision.datastreamrevision_id

            impl_details = json.loads(visualization_revision.impl_details)
            format = impl_details.get('format')
            if format.get('type') != 'mapchart':
                contents, content_type = invoke(visualization_revision_parameters)
            else:
                visualization_revision_parameters['pId'] = visualization_revision.visualizationrevision_id
                # visualization_revision_parameters['pLimit'] = 10000
                # visualization_revision_parameters['pPage'] = 0
                visualization_revision_parameters['pBounds'] = ""
                # visualization_revision_parameters['pZoom'] = 5
                contents, content_type = invoke_chart(visualization_revision_parameters)

            visualization_revision_parameters = urllib.urlencode(visualization_revision_parameters)

            ds_revision = DatasetRevision.objects.filter(dataset=visualization_revision.dataset_id)[0]
            if ds_revision.user.account.id == auth_manager.account_id:
                editing = True
            elif visualization_revision.status == StatusChoices.PUBLISHED:
                editing = False
            else:
                raise Http404

            dataset_revision = DT(ds_revision.id, auth_manager.language)

            status = STATUS_CHOICES[int(visualization_revision.status)][1]

            return render_to_response('viewChart/index.html', locals())
    else:
        raise Http404

@login_required
@require_http_methods(['POST','GET'])
@require_privilege("workspace.can_create_visualization")
@requires_published_parent()
@transaction.commit_on_success
def create(request, viz_type='index'):
    auth_manager = request.auth_manager
    
    if request.method == 'GET':
        #if not index the load related view
        if viz_type != 'index':
            form = InitializeChartForm(request.GET)
            if not form.is_valid():
                raise DatastreamRequiredException("Can't create visualization without related dataview")
                
            dao = DatastreamDAO(user_id=reques.user.id, datastream_revision_id=request.GET['datastream_revision_id'])
            dataview = dao.get()
            
        return render_to_response('createVisualization/%s.html' % viz_type, locals())
    elif request.method == 'POST':
        """ save new or update dataset """
        form = CreateVisualizationForm(request.POST, prefix='visualization')

        if not form.is_valid():
            raise VisualizationSaveException('Invalid form data: %s' % str(form.errors.as_text()))

        datastream_revision = VisualizationRevision.objects.get(pk=form.cleaned_data['dataset_revision_id'])

        visualization = VisualizationLifeCycleManager(user_id=request.user.id)
        visualization.create(datastream=datastream_revision.datastream, title=form.cleaned_data['title']
                    , data_source=form.cleaned_data['data_source']
                    , select_statement=form.cleaned_data['select_statement']
                    , category_id=form.cleaned_data['category']
                    , description=form.cleaned_data['description']
                    , status = form.cleaned_data['status'])

        response = {'status': 'ok', 'visualization_revision_id': visualization.visualization_revision.id
            , 'messages': [ugettext('APP-DATASET-CREATEDSUCCESSFULLY-TEXT')]}

        return JSONHttpResponse(json.dumps(response))

    

@login_required
@require_GET
def related_resources(request):
    params = request.GET
    visualization_revision_id = params.get('revision_id','')
    visualization_id = params.get('visualization_id','')
    resource_type = params.get('type','all');
    resource = VisualizationLifeCycleManager(user_id=request.user.id
                , visualization_id=visualization_id, visualization_revision_id=visualization_revision_id)

    associated_visualizations =resource.related_resources_simple(types=resource_type)
    return JSONHttpResponse(json.dumps(associated_visualizations))
