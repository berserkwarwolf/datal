# -*- coding: utf-8 -*-
import json
import urllib

from django.http import HttpResponse
from django.db import transaction
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.template.loader import render_to_string
from django.utils.translation import ugettext


from core.http import JSONHttpResponse
from core.shortcuts import render_to_response
from core.auth.decorators import login_required,privilege_required
from core.helpers import RequestProcessor
from core.utils import DateTimeEncoder
from core.choices import *
from core.models import VisualizationRevision
from core.daos.visualizations import VisualizationDBDAO
from core.lifecycle.visualizations import VisualizationLifeCycleManager
from core.v8.factories import AbstractCommandFactory
from core.exceptions import DataStreamNotFoundException
from workspace.manageVisualizations import forms
from workspace.decorators import *
from .forms import VisualizationForm, ViewChartForm

logger = logging.getLogger(__name__)


@login_required
@requires_any_dataset()
@requires_any_datastream()
@require_GET
def index(request):
    """ list all dataviews """
    dao = VisualizationDBDAO()

    resources, total_resources = dao.query(account_id=request.account.id, language=request.user.language)

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
        item = json.loads(bb_request.get('filters'))
        
        filters_dict = dict()
        filters_dict['dataset__user__nick'] = item.get('author_filter')
        if item.get('status_filter'):
            filters_dict['status'] = []
            for x in item.get('status_filter'):
                filters_dict['status'].append([status[0] for status in settings.STATUS_CHOICES if status[1] == x][0])

        
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

        if lifecycle.dataset.last_revision_id:
            last_revision_id = lifecycle.visualization.last_revision_id
        else:
            last_revision_id = -1

        return JSONHttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-DELETE-VISUALIZATION-REV-ACTION-TEXT')],
            'revision_id': last_revision_id
        }))
        
    else:
        lifecycle.remove(killemall=True)
        return HttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-DELETE-VISUALIZATION-ACTION-TEXT')],
            'revision_id': -1,
        }), content_type='text/plain')


@login_required
@require_privilege("workspace.can_review_visualization_revision")
@require_POST
@transaction.commit_on_success
def change_status(request, visualization_revision_id=None):
    """
    Change visualization status
    :param request:
    :param visualization_revision_id:
    :return: JSON Object
    """
    if request.method == 'POST' and visualization_revision_id:
        lifecycle = VisualizationLifeCycleManager(
            user=request.user,
            visualization_revision_id=visualization_revision_id
        )
        action = request.POST.get('action')

        if action == 'approve':
            lifecycle.accept()
            response = dict(
                status='ok',
                messages={
                    'title': ugettext('APP-VISUALIZATION-APPROVED-TITLE'),
                    'description': ugettext('APP-VISUALIZATION-APPROVED-TEXT')
                }
            )
        elif action == 'reject':
            lifecycle.reject()
            response = dict(
                status='ok',
                messages={
                    'title': ugettext('APP-VISUALIZATION-REJECTED-TITLE'),
                    'description': ugettext('APP-VISUALIZATION-REJECTED-TEXT')
                }
            )
        elif action == 'publish':
            lifecycle.publish()
            response = dict(
                status='ok',
                messages={
                    'title': ugettext('APP-VISUALIZATION-PUBLISHED-TITLE'),
                    'description': ugettext('APP-VISUALIZATION-PUBLISHED-TEXT')
                }
            )
        elif action == 'unpublish':
            killemall = True if request.POST.get('killemall', False) == 'true' else False
            lifecycle.unpublish(killemall=killemall)
            response = dict(
                status='ok',
                messages={
                    'title': ugettext('APP-VISUALIZATION-UNPUBLISH-TITLE'),
                    'description': ugettext('APP-VISUALIZATION-UNPUBLISH-TEXT')
                }
            )
        elif action == 'send_to_review':
            lifecycle.send_to_review()
            response = dict(
                status='ok',
                messages={
                    'title': ugettext('APP-VISUALIZATION-SENDTOREVIEW-TITLE'),
                    'description': ugettext('APP-VISUALIZATION-SENDTOREVIEW-TEXT')
                }
            )
        else:
            raise NoStatusProvidedException()

        # Limpio un poco
        response['result'] = VisualizationDBDAO().get(request.user.language, visualization_revision_id=visualization_revision_id)
        response['result'].pop('parameters')
        response['result'].pop('tags')
        response['result'].pop('sources')
        response['result'].pop('visualization')

        return JSONHttpResponse(json.dumps(response, cls=DateTimeEncoder))

@login_required
@require_http_methods(['POST','GET'])
@require_privilege("workspace.can_create_visualization")
@requires_published_parent()
@transaction.commit_on_success
def create(request):
    
    if request.method == 'GET':
        datastream_revision_id = request.GET.get('datastream_revision_id', None)
        try:
            datastream_rev = DataStreamDBDAO().get(
                request.user.language,
                datastream_revision_id=datastream_revision_id,
                published=False
            )
        except DataStreamRevision.DoesNotExist:
            raise DataStreamNotFoundException()

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
            logger.info(form._errors)
            raise VisualizationSaveException('Invalid form data: %s' % str(form.errors.as_text()))

        response = form.save(request, datastream_rev=datastream_rev)

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

    visualization_revision = VisualizationDBDAO().get(
        request.auth_manager.language,
        visualization_revision_id=revision_id
    )

    return render_to_response('viewVisualization/index.html', locals())


@login_required
@require_http_methods(['POST', 'GET'])
@require_privilege("workspace.can_edit_datastream")
@requires_published_parent()
@requires_review
@transaction.commit_on_success
def edit(request, revision_id=None):
    if request.method == 'GET':
        visualization_rev = VisualizationDBDAO().get(
            request.auth_manager.language,
            visualization_revision_id=revision_id
        )
        datastream_rev = DataStreamDBDAO().get(
            request.auth_manager.language,
            datastream_revision_id=visualization_rev['datastream_revision_id'])
        return render_to_response('createVisualization/index.html', dict(
            request=request,
            datastream_revision=datastream_rev,
            visualization_revision=visualization_rev
        ))

    elif request.method == 'POST':
        """ save new or update dataset """
        # Formulario
        form = VisualizationForm(request.POST)
        if not form.is_valid():
            logger.info(form._errors)
            raise VisualizationSaveException('Invalid form data: %s' % str(form.errors.as_text()))

        visualization_rev = VisualizationDBDAO().get(
            request.auth_manager.language,
            visualization_revision_id=revision_id
        )
        response = form.save(request, visualization_rev=visualization_rev)

        return JSONHttpResponse(json.dumps(response))


@login_required
def preview(request):

    form = forms.PreviewForm(request.GET)

    if form.is_valid():

        preferences = request.preferences
        datastream_revision_id  = request.GET.get('datastream_revision_id', None)

        try:
            datastream = DataStreamDBDAO().get(
                request.user.language,
                datastream_revision_id=datastream_revision_id,
                published=False
            )
        except Exception, e:
            logger.error(e)
            raise Http404
        else:
            query = RequestProcessor(request).get_arguments(datastream["parameters"])
            chart_type = form.cleaned_data.get('type')

            query.update({
                'pId': int(datastream_revision_id),
                'pType': chart_type,
                'pNullValueAction': form.cleaned_data.get('nullValueAction'),
                'pNullValuePreset': form.cleaned_data.get('nullValuePreset'),
                'pData': form.cleaned_data.get('data'),
                'pLabelSelection': form.cleaned_data.get('labels'),
                'pHeaderSelection': form.cleaned_data.get('headers'),
                'pInvertedAxis': form.cleaned_data.get('invertedAxis'),
                'pInvertData': form.cleaned_data.get('invertData')
            })

            page = form.cleaned_data.get('page')
            if page is not None:
                query['pPage'] = page

            limit = form.cleaned_data.get('limit')
            if limit is not None:
                query['pLimit'] = form.cleaned_data.get('limit')

            command_factory = AbstractCommandFactory().create() 
            result, content_type = command_factory.create("preview_chart", query).run()
            return HttpResponse(result, mimetype=content_type)

            return HttpResponse(result, mimetype=content_type)
    else:
        return HttpResponse('Error!')


@login_required
def preview_map(request, datastream_revision_id):

    preferences = request.preferences
    form = forms.PreviewMapForm(request.GET)

    if form.is_valid():
        try:
            datastream = DataStreamDBDAO().get(
                request.user.language,
                datastream_revision_id=datastream_revision_id,
                published=False
            )
        except Exception, e:
            logger.error(e)
            raise Http404
        else:
            query = RequestProcessor(request).get_arguments(datastream["parameters"])

            query.update({
                'pId': int(datastream_revision_id),
                'pType': 'mapchart',
                'pNullValueAction': form.cleaned_data.get('nullValueAction', 'exclude'),
                'pNullValuePreset': form.cleaned_data.get('nullValuePreset', ''),
                'pData': form.cleaned_data.get('data', ''),
                'pLatitudSelection': form.cleaned_data.get('lat', ''),
                'pLongitudSelection': form.cleaned_data.get('lon', ''),
                'pHeaderSelection': '',
                'pTraceSelection': '',
            })

            # Optional
            bounds = form.cleaned_data.get('bounds')
            if bounds is not None:
                query['pBounds'] = bounds

            zoom = form.cleaned_data.get('zoom')
            if zoom is not None:
                query['pZoom'] = zoom

            query['pType'] = 'chart'
            command_factory = AbstractCommandFactory().create() 
            result, content_type = command_factory.create("preview_chart", query).run()
            return HttpResponse(result, mimetype=content_type)
    else:
        return HttpResponse('Error!')


def action_invoke(request):
    form = forms.RequestForm(request.GET)
    if form.is_valid():
        preferences = request.preferences
        try:
            visualizationrevision_id = form.cleaned_data.get('visualization_revision_id')
            visualization_revision = VisualizationDBDAO().get(
                preferences['account_language'],
                visualization_revision_id=visualizationrevision_id
            )
        except VisualizationRevision.DoesNotExist:
            return VisualizationNotFoundException()
        else:
            query = RequestProcessor(request).get_arguments(visualization_revision['parameters'])
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

            command_factory = AbstractCommandFactory().create() 
            result, content_type = command_factory.create("chart", query).run()
            if not result:
                result = "SIN RESULTADO para %s" % query
            return HttpResponse(result, mimetype=content_type)
    else:
        return HttpResponse('Form Error!')
