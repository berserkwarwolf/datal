import json
import urllib

from django.http import HttpResponse, Http404
from django.db import transaction
from django.utils.translation import ugettext
from django.views.decorators.http import require_GET, require_http_methods
from django.template.loader import render_to_string

from api.http import JSONHttpResponse
from core.shortcuts import render_to_response
from core.auth.decorators import login_required,privilege_required
from core.helpers import unset_visualization_revision_nice
from core.lifecycle.visualizations import VisualizationLifeCycleManager
from core.exceptions import *
from core.engine import invoke, preview_chart
from core.helpers import RequestProcessor
from core.choices import *
from core.docs import VZ, DT, DS
from core.models import VisualizationRevision,DatasetRevision
from core import helpers as LocalHelper
from microsites.daos.visualizations import VisualizationDAO
from workspace.decorators import *
from workspace.settings import *
from workspace.manageVisualizations.forms import *
from core.daos.visualizations import VisualizationDBDAO

logger = logging.getLogger(__name__)


@login_required
@requires_any_dataset()
@requires_any_datastream()
@require_GET
def index(request):
    """ list all dataviews """
    dao = VisualizationDBDAO()

    resources, total_resources = dao.query(account_id=request.account.id, language=request.user.language)
    logger.info(resources)
    for resource in resources:
        resource['url'] = reverse('manageVisualizations.view', urlconf='workspace.urls', kwargs={'revision_id': resource['id']})

    filters = dao.query_filters(account_id=request.user.account.id,
                                    language=request.user.language)

    return render_to_response('manageVisualizations/index.html', locals())


@login_required
@require_GET
#@require_privilege("workspace.can_query_visualization")
def filter(request, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE):
    """ filter resources """
    bb_request = request.GET
    filters = bb_request.get('filters')
    filters_dict = ''
    filter_name= ''
    sort_by='-id'

    if filters is not None and filters != '':
        filters_dict = unset_visualization_revision_nice(json.loads(bb_request.get('filters')))
    if bb_request.get('page') is not None and bb_request.get('page') != '':
        page = int(bb_request.get('page'))
    if bb_request.get('itemxpage') is not None and bb_request.get('itemxpage') != '':
        itemsxpage = int(bb_request.get('itemxpage'))
    if bb_request.get('q') is not None and bb_request.get('q') != '':
        filter_name = bb_request.get('q')
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

    vs_dao = VisualizationDBDAO()
    resources,total_resources = vs_dao.query(
        account_id=request.account.id,
        language=request.user.language,
        page=page,
        itemsxpage=itemsxpage,
        filters_dict=filters_dict,
        sort_by=sort_by,
        filter_name=filter_name
    )

    for resource in resources:
        print(resource)
        resource['url'] = reverse('manageVisualizations.view', kwargs=dict(revision_id=resource['id']))
        resource['datastream_url'] = reverse('manageDataviews.view', kwargs={'revision_id': resource['visualization__datastream__last_revision__id']})

    data = render_to_string('manageVisualizations/filter.json', dict(items=resources, total_entries=total_resources))
    return HttpResponse(data, mimetype="application/json")

@login_required
#@require_privilege("workspace.can_delete_datastream")
#@requires_review
@transaction.commit_on_success
def remove(request, visualization_revision_id, type="resource"):
    """ remove resource """
    lifecycle = VisualizationLifeCycleManager(user=request.user, visualization_revision_id=visualization_revision_id)

    if type == 'revision':
        lifecycle.remove()
        # si quedan revisiones, redirect a la ultima revision, si no quedan, redirect a la lista.
        if lifecycle.visualization.last_revision_id:
            return JSONHttpResponse(json.dumps({
                'status': True,
                'messages': [ugettext('APP-DELETE-VISUALIZATION-REV-ACTION-TEXT')],
                'revision_id': lifecycle.visualization.last_revision_id,
            }))
        else:
            return JSONHttpResponse(json.dumps({
                'status': True,
                'messages': [ugettext('APP-DELETE-VISUALIZATION-REV-ACTION-TEXT')],
                'revision_id': -1,
            }))
    else:
        lifecycle.remove(killemall=True)
        return HttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-DELETE-VISUALIZATION-ACTION-TEXT')],
            'revision_id': -1,
        }), content_type='text/plain')

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
    
    if request.method == 'GET':
        datastream_revision_id = request.GET.get('datastream_revision_id', None)
        datastream_rev = DataStreamDBDAO().get(
            request.user.language,
            datastream_revision_id=datastream_revision_id,
            published=False
        )

        return render_to_response('createVisualization/index.html', dict(
            request=request,
            datastream_revision=datastream_rev
        ))

    elif request.method == 'POST':
        """ save new or update dataset """
        # Valido que llegue el ID de la revision del datastream
        datastream_rev_id = request.GET.get('datastream_revision_id', None)
        if not datastream_rev_id:
            raise Http404
        datastream_rev = DataStreamRevision.objects.get(pk=datastream_rev_id)

        # Formulario
        form = VisualizationForm(request.POST)
        if not form.is_valid():
            raise DatastreamSaveException('Invalid form data: %s' % str(form.errors.as_text()))

        lifecycle = VisualizationLifeCycleManager(user=request.user)
        visualization_rev = lifecycle.create(
            datastream_rev=datastream_rev,
            language=request.auth_manager.language,
            **form.cleaned_data
        )

        response = dict(
            status='ok',
            revision_id=visualization_rev.id,
            messages=[ugettext('APP-VISUALIZATION-CREATEDSUCCESSFULLY-TEXT')]
        )

        return JSONHttpResponse(json.dumps(response))
    

@login_required
@require_GET
def related_resources(request):
    visualization_revision_id = request.GET.get('revision_id', '')
    visualization_id = request.GET.get('visualization_id', '')
    visualizations = VisualizationDBDAO().query_childs(
        visualization_id=visualization_id,
        language=request.auth_manager.language
    )['dashboards']

    list_result = [associated_visualization for associated_visualization in visualizations]
    return HttpResponse(json.dumps(list_result), mimetype="application/json")

@login_required
@require_GET
def action_view(request, revision_id):
    datastream_rev = VisualizationDBDAO().get(request.auth_manager.language, visualization_revision_id=revision_id)
    return render_to_response('viewVisualization/index.html', locals())


@login_required
@require_http_methods(['POST', 'GET'])
@require_privilege("workspace.can_edit_datastream")
@requires_published_parent()
@requires_review
@transaction.commit_on_success
def edit(request, datastream_revision_id=None):
    pass


@login_required
def preview(request):

    form = PreviewForm(request.GET)
    logger.error("entering preview handler")
    if form.is_valid():
        logger.error("form is valid")
        preferences = request.preferences

        datastreamrevision_id  = request.GET.get('datastream_revision_id', None)

        try:
            datastream = DS(datastreamrevision_id, request.auth_manager.language)
        except Exception, e:
            logger.debug(e)
            raise Http404
        else:

            query = RequestProcessor(request).get_arguments(datastream.parameters)

            query['pId'] = int(datastreamrevision_id)

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

            query['pNullValueAction'] = form.cleaned_data.get('null_action')
            query['pNullValuePreset'] = form.cleaned_data.get('null_preset')

            query['pData'] = form.cleaned_data.get('data')

            labels = form.cleaned_data.get('labels')
            if labels is not None:
                query['pLabelSelection'] = labels

            headers = form.cleaned_data.get('headers')
            if headers is not None:
                query['pHeaderSelection'] = headers

            lat = form.cleaned_data.get('lat')
            if lat is not None:
                query['pLatitudSelection'] = lat

            lon = form.cleaned_data.get('long')
            if lon is not None:
                query['pLongitudSelection'] = lon

            traces = form.cleaned_data.get('traces')
            if traces is not None:
                query['pTraceSelection'] = traces

            query['pType'] = 'chart'
            logger.error(query)
            result, content_type = preview_chart(query)

            return HttpResponse(result, mimetype=content_type)
    else:
        return HttpResponse('Error!')

