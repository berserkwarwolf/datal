import logging

from django.http import HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.utils.translation import ugettext
from django.views.decorators.http import require_GET, require_http_methods

from core.shortcuts import render_to_response
from core.auth.decorators import login_required
from core.helpers import remove_duplicated_filters, filters_to_model_fields
from workspace.decorators import *
from workspace.manageDataviews.forms import *
from workspace.templates import *
from workspace.daos.datastreams import DataStreamDBDAO
from core.lifecycle.datastreams import DatastreamLifeCycleManager
from workspace.exceptions import LifeCycleException
from core.models import DatasetRevision, Account, CategoryI18n, DataStreamRevision
from api.http import JSONHttpResponse
from core import engine


logger = logging.getLogger(__name__)

@login_required
@require_GET
def action_view(request, revision_id):
    logger.error('loadin DV %s' % str(revision_id))
    
    language = request.auth_manager.language
    try:
        datastream = DataStreamDBDAO().get(language, datastream_revision_id=revision_id)
    except DataStreamRevision.DoesNotExist:
        raise DataStreamNotFoundException

    account_id = request.auth_manager.account_id
    credentials = request.auth_manager
    categories = CategoryI18n.objects.filter(language=language, category__account=account_id).values('category__id','name')
    status_options = credentials.get_allowed_actions()
    
    return render_to_response('viewDataStream/index.html', locals())

@login_required
# quitarlo por que ya se maneja dentro @requires_any_dataset() #account must have almost one dataset
@require_privilege("workspace.can_query_datastream")
@require_GET
def list(request):
    """ list all dataviews """
    ds_dao = DataStreamDBDAO()

    resources, total_resources = DataStreamDBDAO().query(account_id=request.account.id, language=request.user.language)
    if total_resources == 0 or request.GET.get('test-no-results', None) == '1':
        return render_to_response('manageDataviews/noResults.html', locals())

    for resource in resources:
        resource['url'] = reverse('manageDataviews.view', urlconf='workspace.urls', kwargs={'revision_id': resource['id']})

    filters = ds_dao.query_filters(account_id=request.user.account.id,
                                    language=request.user.language)

    return render_to_response('manageDataviews/index.html', locals())

@login_required
@require_GET
@require_privilege("workspace.can_query_datastream")
def filter(request, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE):
    """ filter resources """
    bb_request = request.GET
    filters = bb_request.get('filters')
    filters_dict = ''
    filter_name= ''
    sort_by='-id'

    if filters is not None and filters != '':
        filters_dict = filters_to_model_fields(json.loads(bb_request.get('filters')))
    if bb_request.get('page') is not None and bb_request.get('page') != '':
        page = int(bb_request.get('page'))
    if bb_request.get('itemxpage') is not None and bb_request.get('itemxpage') != '':
        itemsxpage = int(bb_request.get('itemxpage'))
    if bb_request.get('q') is not None and bb_request.get('q') != '':
        filter_name = bb_request.get('q')
    if bb_request.get('sort_by') is not None and bb_request.get('sort_by') != '':
        if bb_request.get('sort_by') == "title":
            sort_by ="datastreami18n__title"
        if bb_request.get('sort_by') == "dataset_title":
            sort_by ="dataset__last_revision__dataseti18n__title"
        if bb_request.get('sort_by') == "author":
            sort_by ="dataset__user__nick"
        if bb_request.get('order')=="desc":
            sort_by = "-"+ sort_by
    #limit = int(bb_request.get('rp'))
    #sort_by = bb_request.get('sortname')
    #order = bb_request.get('sortorder')
    #filters_dict=filters_dict
    ds_dao = DataStreamDBDAO()
    resources,total_resources = ds_dao.query(
        account_id=request.account.id,
        language=request.user.language,
        page=page,
        itemsxpage=itemsxpage,
        filters_dict=filters_dict,
        sort_by=sort_by,
        filter_name=filter_name
    )

    for resource in resources:
        # resources[i]['url'] = LocalHelper.build_permalink('manageDataviews.view', '&datastream_revision_id=' + str(resources[i]['id']))
        resource['url'] = reverse('manageDataviews.view', urlconf='workspace.urls', kwargs={'revision_id': resource['id']})
        resource['dataset_url'] = reverse('manageDatasets.view', urlconf='workspace.urls', kwargs={'revision_id': resource['dataset__last_revision__id']})

    data = {'total_resources': total_resources, 'resources': resources}
    response = DatastreamList().render(data)
    
    return JSONHttpResponse(response)


@login_required
@require_privilege("workspace.can_query_dataset")
@require_GET
def get_filters_json(request):
    """ List all Filters available """
    filters = DataStreamDBDAO().query_filters(account_id=request.user.account.id,
                                    language=request.user.language)
    return JSONHttpResponse(json.dumps(filters))


@login_required
@require_GET
def related_resources(request):
    language = request.auth_manager.language
    datastream_id = request.GET.get('datastream_id', '')
    resource_type = request.GET.get('type', 'all')
    datastreams = DataStreamDBDAO().query_childs(datastream_id= datastream_id, language=language)['visualizations']

    list_result = [associated_datastream for associated_datastream in datastreams]
    return HttpResponse(json.dumps(list_result), mimetype="application/json")

@login_required
@require_privilege("workspace.can_delete_datastream")
@transaction.commit_on_success
def remove(request, id,type="resource"):
    """ remove resource """
    lifecycle = DatastreamLifeCycleManager(user=request.user, datastream_revision_id=id)

    if type == 'revision':
        lifecycle.remove()
        # si quedan revisiones, redirect a la ultima revision, si no quedan, redirect a la lista.
        if lifecycle.datastream.last_revision_id:
            return JSONHttpResponse(json.dumps({
                'status': True,
                'messages': [ugettext('APP-DELETE-DATASTREAM-REV-ACTION-TEXT')],
                'revision_id': lifecycle.datastream.last_revision_id,
            }))
        else:
            return JSONHttpResponse(json.dumps({
                'status': True,
                'messages': [ugettext('APP-DELETE-DATASTREAM-REV-ACTION-TEXT')],
                'revision_id': -1,
            }))
    else:
        lifecycle.remove(killemall=True)
        return HttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-DELETE-DATASTREAM-ACTION-TEXT')],
            'revision_id': -1,
        }), content_type='text/plain')

@login_required
@require_http_methods(['POST', 'GET'])
@require_privilege("workspace.can_create_datastream")
@requires_dataset()
@requires_published_parent()
@transaction.commit_on_success
def create(request):
    auth_manager = request.auth_manager
    if request.method == 'POST':
        """ save new or update dataset """
        form = CreateDataStreamForm(request.POST)

        if not form.is_valid():
            raise LifeCycleException('Invalid form data: %s' % str(form.errors.as_text()))

        dataset_revision = DatasetRevision.objects.get(pk=form.cleaned_data['dataset_revision_id'])

        dataview = DatastreamLifeCycleManager(user=request.user)
        dataview.create(
            dataset=dataset_revision.dataset,
            language=request.auth_manager.language,
            category_id=form.cleaned_data['category'],
            parameters=[], #TODO: Add parameters to UI
            **form.cleaned_data
        )

        response = dict(
            status='ok',
            datastream_revision_id=dataview.datastream_revision.id,
            messages=[ugettext('APP-DATASET-CREATEDSUCCESSFULLY-TEXT')]
        )

        return JSONHttpResponse(json.dumps(response))

    elif request.method == 'GET':
        form = InitalizeCollectForm(request.GET)

        if form.is_valid():
            is_update = False
            is_update_selection = False
            data_set_id = form.cleaned_data['dataset_revision_id']
            datastream_id = None

            if auth_manager.is_level('level_5'):
                meta_data = Account.objects.get(pk = auth_manager.account_id).meta_data

            dataset_revision = DatasetRevision.objects.get(pk= data_set_id)
            end_point = dataset_revision.end_point
            type = dataset_revision.dataset.type
            impl_type = dataset_revision.impl_type
            impl_details = dataset_revision.impl_details
            bucket_name = request.bucket_name

            return render_to_response('view_manager/insertForm.html', locals())
        else:
            raise Http404

#@login_required
#@privilege_required("workspace.can_create_datastream")
#@require_http_methods(["GET", "POST"])
#def create_steps(request, status=None):

    #auth_manager = request.auth_manager
    #meta_form = None

    #if request.method == 'POST':
        #datastream_form     = CreateDataStreamForm(request.POST, prefix='datastream')
        #ParameterFormSet    = formset_factory(DataStreamParameterForm)
        #parameter_forms     = ParameterFormSet(request.POST, prefix='parameters')
        #TagFormSet          = formset_factory(CreateTagsForm)
        #tag_forms           = TagFormSet(request.POST, prefix='tags')
        #SourceFormSet       = formset_factory(CreateSourcesForm)
        #source_forms        = SourceFormSet(request.POST, prefix='sources')

        #if request.auth_manager.is_level('level_5'):
            #meta_data = Account.objects.get(pk = request.auth_manager.account_id).meta_data
            #if meta_data:
                #meta_form = MetaForm(request.POST, metadata = meta_data)

        #if datastream_form.is_valid():
            #if parameter_forms.is_valid():
                #if tag_forms.is_valid():
                    #if request.auth_manager.is_level('level_5'):
                        #if meta_form and not meta_form.is_valid():
                            #errors      = generate_ajax_form_errors(meta_form)
                            #response    = {'status': 'error', 'messages': errors}
                            #return HttpResponse(json.dumps(response), content_type='application/json')
                        #if source_forms and not source_forms.is_valid():
                            #errors      = generate_ajax_form_errors(source_forms)
                            #response    = {'status': 'error', 'messages': errors}
                            #return HttpResponse(json.dumps(response), content_type='application/json')

                    #response = saveDataStream(datastream_form, parameter_forms, tag_forms, meta_form, source_forms, auth_manager, status)
                #else:
                    #errors      = generate_ajax_form_errors(tag_forms)
                    #response    = {'status': 'error', 'messages': errors}
            #else:
                #errors      = generate_ajax_form_errors(parameter_forms)
                #response    = {'status': 'error', 'messages': errors}
        #else:
            #errors      = generate_ajax_form_errors(datastream_form)
            #response    = {'status': 'error', 'messages': errors}

        #from django.contrib import messages
        #messages.add_message(request, messages.INFO, "save")

        #return HttpResponse(json.dumps(response), content_type='application/json')
    #else:
        #form = InitalizeCollectForm(request.GET)

        #if form.is_valid():
            #is_update       = False
            #is_update_selection = False
            #data_set_id     = form.cleaned_data['dataset_revision_id']
            #datastream_id   = None

            #if auth_manager.is_level('level_5'):
                #meta_data = Account.objects.get(pk = auth_manager.account_id).meta_data

            #dataset_revision    = DatasetRevision.objects.get(pk= data_set_id)
            #end_point           = dataset_revision.end_point
            #type                = dataset_revision.dataset.type
            #impl_type           = dataset_revision.impl_type
            #impl_details        = dataset_revision.impl_details
            #bucket_name         = request.bucket_name

            #return render_to_response('view_manager/insertForm.html', locals())
        #else:
            #raise Http404

@login_required
@require_http_methods(['POST', 'GET'])
@require_privilege("workspace.can_edit_datastream")
@requires_published_parent()
@transaction.commit_on_success
def edit(request, datastream_revision_id=None):
    if request.method == 'GET':
        account_id = request.auth_manager.account_id
        credentials = request.auth_manager
        language = request.auth_manager.language
        categories = CategoryI18n.objects.filter(
            language=language,
            category__account=account_id
        ).values('category__id', 'name')
        status_options = credentials.get_allowed_actions()
        lifecycle = DatastreamLifeCycleManager(user=request.user, datastream_revision_id=datastream_revision_id)
        status = lifecycle.datastream_revision.status
        response = DefaultDataViewEdit(template='datastream_edit_response.json').render(
            categories,status,
            status_options,
            lifecycle.datastream_revision,
            lifecycle.datastreami18n
        )

        return JSONHttpResponse(response)

    elif request.method == 'POST':
        """update dataset """

        form = EditDataStreamForm(request.POST)

        if not form.is_valid():
            raise LifeCycleException('Invalid form data: %s' % str(form.errors.as_text()))

        if form.is_valid():
            dataview = DatastreamLifeCycleManager(user=request.user, datastream_revision_id=datastream_revision_id)

            dataview.edit(
                language=request.auth_manager.language,
                changed_fields=form.changed_data,
                **form.cleaned_data
            )

            response = dict(
                status='ok',
                datastream_revision_id= dataview.datastream_revision.id,
                messages=[ugettext('APP-DATASET-CREATEDSUCCESSFULLY-TEXT')],
            )

            return JSONHttpResponse(json.dumps(response))

@login_required
@require_privilege("workspace.can_review_dataset_revision")
@require_http_methods(['POST', 'GET'])
@transaction.commit_on_success
def review(request, datastream_revision_id=None):

    if request.method == 'POST' and datastream_revision_id != None:

        lifecycle = DatastreamLifeCycleManager(user=request.user, datastream_revision_id=datastream_revision_id)

        action = request.POST.get('action')

        if action == 'approve':

            lifecycle.accept()

            response = {'status': 'ok', 'datastream_status':ugettext('MODEL_STATUS_APPROVED'), 'messages': ugettext('APP-DATAVIEW-APPROVED-TEXT')}

        elif action == 'reject':

            lifecycle.reject()

            response = {'status': 'ok', 'datastream_status':ugettext('MODEL_STATUS_DRAFT'), 'messages': ugettext('APP-DATAVIEW-REJECTED-TEXT')}

        else:

            response = {'status': 'error', 'messages': ugettext('APP-DATAVIEW-NOT-REVIEWED-TEXT')}

    else:

        response = {'status': 'error', 'messages': ugettext('APP-DATAVIEW-NOT-REVIEWED-TEXT')}
    

    return JSONHttpResponse(json.dumps(response))

    
@csrf_exempt
@require_http_methods(["POST"])
def action_preview(request):
    form = PreviewForm(request.POST)
    if form.is_valid():

        query = { 'pEndPoint': form.cleaned_data['end_point'],
                  'pImplType': form.cleaned_data['impl_type'],
                  'pImplDetails': form.cleaned_data['impl_details'],
                  'pBucketName': form.cleaned_data['bucket_name'],
                  'pDataSource': form.cleaned_data['datasource'],
                  'pSelectStatement': form.cleaned_data['select_statement'],
                  'pRdfTemplate': form.cleaned_data['rdf_template'],
                  'pUserId': request.auth_manager.id,
                  'pLimit': form.cleaned_data['limit']
                }

        getdict = request.POST.dict()
        for k in ['end_point', 'impl_type', 'datasource', 'select_statement', 'limit', 'rdf_template']:
            if getdict.has_key(k): getdict.pop(k)
        query.update(getdict)
        response, mimetype = engine.preview(query)
        # return HttpResponse(engine.preview(query), mimetype='application/json;charset=utf-8')
        return HttpResponse(response, mimetype)

    else:
        raise Http400(form.get_error_description())