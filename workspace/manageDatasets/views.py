import urllib2, logging

from django.db import transaction
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.core.urlresolvers import reverse
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.translation import ugettext
from django.http import Http404, HttpResponse

from core.http import JSONHttpResponse
from core import engine
from core.shortcuts import render_to_response
from core.auth.decorators import login_required
from core.choices import *
from core.exceptions import DatasetSaveException
from core.utils import filters_to_model_fields
from core.models import DatasetRevision
from workspace.decorators import *
from workspace.templates import DatasetList
from workspace.manageDatasets.forms import *
from core.daos.datasets import DatasetDBDAO


logger = logging.getLogger(__name__)


@login_required
@require_privilege("workspace.can_query_dataset")
@require_GET
def action_request_file(request):
    form = RequestFileForm(request.GET)

    if form.is_valid():
        dataset_revision = DatasetRevision.objects.get(pk=form.cleaned_data['dataset_revision_id'])
        try:
            response = HttpResponse(mimetype='application/force-download')
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(dataset_revision.filename.encode('utf-8'))
            response.write(urllib2.urlopen(dataset_revision.get_endpoint_full_url()).read())
        except Exception:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(dataset_revision.end_point)
    else:
        response = dict(
            status='error',
            messages=[ugettext('URL-RETRIEVE-ERROR')]
        )

    return response


@login_required
@require_privilege("workspace.can_query_dataset")
@require_GET
def index(request):
    """ List all Datasets """
    account_domain = request.preferences['account.domain']
    ds_dao = DatasetDBDAO()
    filters = ds_dao.query_filters(account_id=request.user.account.id, language=request.user.language)
    datastream_impl_valid_choices = DATASTREAM_IMPL_VALID_CHOICES

    return render_to_response('manageDatasets/index.html', locals())


@login_required
@require_GET
def action_view(request, revision_id):
    account_id = request.auth_manager.account_id
    credentials = request.auth_manager
    user_id = request.auth_manager.id
    language = request.auth_manager.language
    try:
        dataset = DatasetDBDAO().get(language=language, dataset_revision_id=revision_id)
    except DatasetRevision.DoesNotExist:
        raise DatasetNotFoundException()

    datastream_impl_not_valid_choices = DATASTREAM_IMPL_NOT_VALID_CHOICES
    return render_to_response('viewDataset/index.html', locals())


@login_required
@require_privilege("workspace.can_query_dataset")
@require_GET
def filter(request, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE):
    """ filter resources """
    bb_request = request.GET
    filters = bb_request.get('filters')
    filters_dict= ''
    filter_name= ''
    sort_by='-id'
    exclude=None

    if filters is not None and filters != '':
        filters_dict = filters_to_model_fields(json.loads(bb_request.get('filters')))
    if bb_request.get('page') is not None and bb_request.get('page') != '':
        page = int(bb_request.get('page'))
    if bb_request.get('q') is not None and bb_request.get('q') != '':
        filter_name = bb_request.get('q')
    if bb_request.get('itemxpage') is not None and bb_request.get('itemxpage') != '':
        itemsxpage = int(bb_request.get('itemxpage'))


    if bb_request.get('collect_type', None) is not None:
        # If File Dataset, set impl_types as valid ones. File = 0
        if bb_request.get('collect_type') == '0':
            exclude = {
                'dataset__type': bb_request.get('collect_type'),
                'impl_type__in': DATASTREAM_IMPL_NOT_VALID_CHOICES
            }

    if bb_request.get('sort_by') is not None and bb_request.get('sort_by') != '':
        if bb_request.get('sort_by') == "category":
            sort_by ="category__categoryi18n__name"
        if bb_request.get('sort_by') == "title":
            sort_by ="dataseti18n__title"
        if bb_request.get('sort_by') == "author":
            sort_by ="dataset__user__nick"
        if bb_request.get('order')=="desc":
            sort_by = "-"+ sort_by

    resources,total_resources = DatasetDBDAO().query(
        account_id=request.account.id,
        language=request.user.language,
        page=page,
        itemsxpage=itemsxpage,
        filters_dict = filters_dict,
        sort_by=sort_by,
        filter_name=filter_name,
        exclude=exclude
    )

    for resource in resources:
        resource['url'] = reverse('manageDatasets.view', urlconf='workspace.urls', kwargs={'revision_id': resource['id']})

    data = {'total_resources': total_resources, 'resources': resources}
    response = DatasetList().render(data)

    mimetype = "application/json"

    return HttpResponse(response, mimetype=mimetype)


@login_required
@require_privilege("workspace.can_query_dataset")
@require_GET
def get_filters_json(request):
    """ List all Filters available """
    filters = DatasetDBDAO().query_filters(account_id=request.user.account.id,
                                    language=request.user.language)
    return JSONHttpResponse(json.dumps(filters))


@requires_review
@login_required
@require_privilege("workspace.can_delete_dataset")
@transaction.commit_on_success
def remove(request, dataset_revision_id, type="resource"):

    """ remove resource """
    lifecycle = DatasetLifeCycleManager(user=request.user, dataset_revision_id=dataset_revision_id)

    if type == 'revision':
        lifecycle.remove()
        # si quedan revisiones, redirect a la ultima revision, si no quedan, redirect a la lista.
        if lifecycle.dataset.last_revision_id:
            last_revision_id = lifecycle.dataset.last_revision_id
        else:
            last_revision_id = -1

        return JSONHttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-DELETE-DATASET-REV-ACTION-TEXT')],
            'revision_id': last_revision_id
        }))

    else:
        lifecycle.remove(killemall=True)
        return HttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-DELETE-DATASET-ACTION-TEXT')],
            'revision_id': -1,
        }), content_type='text/plain')


@requires_review
@login_required
#@require_privilege("workspace.can_delete_dataset")
@transaction.commit_on_success
def unpublish(request, dataset_revision_id, type="resource"):

    """ unpublish resource """
    lifecycle = DatasetLifeCycleManager(user=request.user, dataset_revision_id=dataset_revision_id)

    if type == 'revision':
        lifecycle.unpublish()
        # si quedan revisiones, redirect a la ultima revision, si no quedan, redirect a la lista.
        if lifecycle.dataset.last_revision_id:
            last_revision_id = lifecycle.dataset.last_revision_id
        else:
            last_revision_id = -1

        return JSONHttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-UNPUBLISH-DATASET-REV-ACTION-TEXT')],
            'revision_id': last_revision_id
        }))

    else:
        lifecycle.unpublish(killemall=True)
        return HttpResponse(json.dumps({
            'status': True,
            'messages': [ugettext('APP-UNPUBLISH-DATASET-ACTION-TEXT')],
            'revision_id': -1,
        }), content_type='text/plain')


@login_required
@require_privilege("workspace.can_create_dataset")
@requires_if_publish('dataset') #
@require_http_methods(['POST', 'GET'])
@transaction.commit_on_success
def create(request, collect_type='index'):

    auth_manager = request.auth_manager
    account_id = auth_manager.account_id
    language = auth_manager.language

    # TODO: Put line in a common place
    collect_types = {'index': -1, 'file': 0, 'url': 1, 'webservice': 2}

    collect_type_id = collect_types[collect_type]

    if request.method == 'GET':
        form = DatasetFormFactory(collect_type_id).create(
            account_id=account_id,
            language=language,
            status_choices=auth_manager.get_allowed_actions()
        )
        form.label_suffix = ''
        url = 'createDataset/{0}.html'.format(collect_type)
        return render_to_response(url, locals())

    elif request.method == 'POST':
        """update dataset """
        form = DatasetFormFactory(collect_type_id).create(request, account_id=account_id, language=language,
                                                          status_choices=auth_manager.get_allowed_actions())

        if form.is_valid():
            lifecycle = DatasetLifeCycleManager(user=request.user)
            dataset_revision = lifecycle.create(collect_type=request.POST.get('collect_type'), language=language,
                                                **form.cleaned_data)

            # TODO: Create a CreateDatasetResponse object
            data = dict(status='ok', messages=[ugettext('APP-DATASET-CREATEDSUCCESSFULLY-TEXT')],
                        dataset_revision_id=dataset_revision.id)
            return HttpResponse(json.dumps(data), content_type='text/plain')
        else:
            raise DatasetSaveException(form)


@login_required
@require_privilege("workspace.can_edit_dataset")
@requires_if_publish('dataset')
@requires_review
@require_http_methods(['POST', 'GET'])
@transaction.commit_on_success
def edit(request, dataset_revision_id=None):
    account_id = request.auth_manager.account_id
    auth_manager = request.auth_manager
    language = request.auth_manager.language
    user_id = request.auth_manager.id

    # TODO: Put line in a common place
    collect_types = {0: 'file', 1: 'url', 2: 'webservice'}

    # TODO: Review. Category was not loading options from form init.
    category_choices = [[category['category__id'], category['name']] for category in CategoryI18n.objects.filter(language=language, category__account=account_id).values('category__id', 'name')]

    if request.method == 'GET':
        status_options = auth_manager.get_allowed_actions()
        # Get data set and the right template depending on the collected type
        dataset = DatasetDBDAO().get(language=language, dataset_revision_id=dataset_revision_id)
        url = 'editDataset/{0}.html'.format(collect_types[dataset['collect_type']])


        # Import the form that we really need
        if collect_types[dataset['collect_type']] is not 'url':
            className = [collect_types[dataset['collect_type']].capitalize(), "Form"]
        else:
            className = ['Dataset', "Form"]

        className = ''.join(str(elem) for elem in className)
        mod = __import__('workspace.manageDatasets.forms', fromlist=[className])

        initial_values = dict(
            # Dataset Form
            dataset_id=dataset.get('id'), title=dataset.get('title'), description=dataset.get('description'),
            category=dataset.get('category_id'), status=dataset.get('status'),
            notes=dataset.get('notes'), file_name=dataset.get('filename'), end_point=dataset.get('end_point'),
            impl_type=dataset.get('impl_type'), license_url=dataset.get('license_url'), spatial=dataset.get('spatial'),
            frequency=dataset.get('frequency'), mbox=dataset.get('mbox'), sources=dataset.get('sources'),
            tags=dataset.get('tags')
        )

        form = getattr(mod, className)(status_options=status_options)

        form.label_suffix = ''
        form.fields['category'].choices = category_choices
        form.initial = initial_values

        return render_to_response(url, locals())
    elif request.method == 'POST':
        """ Update dataset """
        form = DatasetFormFactory(request.POST.get('collect_type')).create(
            request, account_id=account_id, language=language, status_choices=auth_manager.get_allowed_actions()
        )

        if form.is_valid():
            lifecycle = DatasetLifeCycleManager(user=request.user, dataset_revision_id=dataset_revision_id)

            dataset_revision = lifecycle.edit(collect_type=request.POST.get('collect_type'),
                                              changed_fields=form.changed_data, language=language,  **form.cleaned_data)

            data = dict(status='ok', messages=[ugettext('APP-DATASET-CREATEDSUCCESSFULLY-TEXT')],
                        dataset_revision_id=dataset_revision.id)
            return HttpResponse(json.dumps(data), content_type='text/plain')
        else:
            raise DatasetSaveException(form.errors)


@login_required
@require_GET
def related_resources(request):
    language = request.auth_manager.language
    dataset_id = request.GET.get('dataset_id', '')

    # For now, we'll fetch datastreams
    associated_datastreams = DatasetDBDAO().query_childs(dataset_id=dataset_id, language=language)['datastreams']

    list_result = []
    for associated_datastream in associated_datastreams:
        associated_datastream['type'] = 'dataview'
        list_result.append(associated_datastream) 

    dump = json.dumps(list_result, cls=DjangoJSONEncoder)
    return HttpResponse(dump, mimetype="application/json")


@login_required
@require_POST
@transaction.commit_on_success
def change_status(request, dataset_revision_id=None):
    """
    Change dataset status
    :param request:
    :param dataset_revision_id:
    :return: JSON Object
    """
    if request.method == 'POST' and dataset_revision_id:
        lifecycle = DatasetLifeCycleManager(
            user=request.user,
            dataset_revision_id=dataset_revision_id
        )
        action = request.POST.get('action')

        if action == 'approve':
            lifecycle.accept()
            response = dict(
                status='ok',
                dataset_status=StatusChoices.APPROVED,
                messages={
                    'title': ugettext('APP-DATASET-APPROVED-TITLE'),
                    'description': ugettext('APP-DATASET-APPROVED-TEXT')
                }
            )
        elif action == 'reject':
            lifecycle.reject()
            response = dict(
                status='ok',
                dataset_status=StatusChoices.DRAFT,
                messages={
                    'title': ugettext('APP-DATASET-REJECTED-TITLE'),
                    'description': ugettext('APP-DATASET-REJECTED-TEXT')
                }
            )
        elif action == 'publish':
            lifecycle.publish()
            response = dict(
                status='ok',
                dataset_status=StatusChoices.PUBLISHED,
                messages={
                    'title': ugettext('APP-DATASET-PUBLISHED-TITLE'),
                    'description': ugettext('APP-DATASET-PUBLISHED-TEXT')
                }
            )
        elif action == 'unpublish':
            killemall = request.POST.get('killemall', False)
            killemall = True if killemall == 'true' else False
            lifecycle.unpublish(killemall=killemall)
            response = dict(
                status='ok',
                dataset_status=StatusChoices.DRAFT,
                messages={
                    'title': ugettext('APP-DATASET-UNPUBLISH-TITLE'),
                    'description': ugettext('APP-DATASET-UNPUBLISH-TEXT')
                }
            )
        elif action == 'send_to_review':
            lifecycle.send_to_review()
            response = dict(
                status='ok',
                dataset_status=StatusChoices.PENDING_REVIEW,
                messages={
                    'title': ugettext('APP-DATASET-SENDTOREVIEW-TITLE'),
                    'description': ugettext('APP-DATASET-SENDTOREVIEW-TEXT')
                }
            )
        else:
            raise NoStatusProvidedException()

        return JSONHttpResponse(json.dumps(response))


@login_required
@require_GET
def action_load(request):

    form = LoadForm(request.GET)
    if form.is_valid():
        # check ownership
        dataset_revision_id = form.cleaned_data['dataset_revision_id']
        page = form.cleaned_data['page']
        limit = form.cleaned_data['limit']
        tableid = form.cleaned_data['tableid']
        query = {'pId': dataset_revision_id}
        getdict = request.GET.dict()
        for k in ['dataset_revision_id', 'page', 'limit', 'tableid']:
            if getdict.has_key(k): getdict.pop(k)
        query.update(getdict)
        if page:
            query['pPage'] = page
        if limit:
            query['pLimit'] = limit
        if tableid:
            query['pTableid'] = tableid
        response, mimetype = engine.load(query)

        """ detect error
        if response.find("It was not possible to dispatch the request"):
            import logging
            logger = logging.getLogger(__name__)
            logger.error("Error finding tables on dataset [%s]" % query)
        """
        return HttpResponse(response, mimetype=mimetype)
    else:
        raise Http404(form.get_error_description())


@login_required
@require_privilege("workspace.can_create_datastream")
@require_http_methods(["GET"])
def check_source_url(request):

    mimetype_form = MimeTypeForm(request.GET)
    status = ''

    if mimetype_form.is_valid():
        url = mimetype_form.cleaned_data['url']
        mimetype, status, url = mimetype_form.get_mimetype(url)
        sources = {"mimetype" : mimetype, "status" : status, "url" : url }

        return HttpResponse(json.dumps(sources), content_type='application/json')
    else:
        raise Http404
