from django.utils.translation import ugettext
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from django.db import transaction
from core.reports_manager.helpers import create_report
from core.daos.datasets import DatasetDBDAO
from core.lib.datastore import *
from core.choices import CollectTypeChoices, StatusChoices
from core.exceptions import *
from core.lifecycle.datasets import DatasetLifeCycleManager
from core.lifecycle.datastreams import DatastreamLifeCycleManager
from core.builders.datastreams import DatastreamBuilder
from api.models import *
from api.http import JSONHttpResponse, HttpResponse
from api.managers import *
from api.datastreams_manager import forms as formsw #TODO fix moving to core or someting similar
from api.decorators import public_access_forbidden
from api.helpers import add_domain_to_datastream_link
from api.v2.datastreams import forms
from api.sources_manager.utils import *
from api.exceptions import Http400

import json
import logging

def action_view(request, guid):
    is_method_get_or_405(request)
    datastream  = get_object_or_404(DataStream, guid=guid)
    passticket = request.GET.get('passticket', None)
    user_id = UserPassTickets.objects.resolve_user_id(passticket, request.user_id)
    language = Account.objects.get(pk=request.account_id).get_preference('account.language')
    response = datastream.as_dict(user_id, language)
    add_domain_to_datastream_link(response)
    return JSONHttpResponse(json.dumps(response))

def action_invoke(request, guid):
    """invoke the datastream data by datastream-GUID"""
    is_method_get_or_405(request)
    form = forms.InvokeForm(request.GET)

    if form.is_valid():
        output = form.cleaned_data['output']
        passticket = form.cleaned_data['passticket']
        user_id = UserPassTickets.objects.resolve_user_id(passticket, request.user_id)
        # (andres) always returns None, maybe we need the following lines
        # if not user_id:
        #     user_id = request.user_id

        page = form.cleaned_data['page']
        limit = form.cleaned_data['limit']
        if_modified_since = form.cleaned_data['if_modified_since']
        # get the related datastream (by GUID)
        datastream = get_object_or_404(DataStream, guid=guid)

        # count this HITS (? it's a new DataStreamHits)
        create_report(datastream.id, DataStreamHits, ChannelTypes.API)
        # get the data
        contents, mimetype = datastream.invoke(request, output, user_id, page, limit, if_modified_since)
        return HttpResponse(contents, mimetype=mimetype)

    else:
        raise Http400(form.get_error_description())

def action_search(request):
    is_method_get_or_405(request)
    search_form = forms.SearchForm(request.GET)
    if search_form.is_valid():
        query = search_form.cleaned_data['query']
        max_results = search_form.cleaned_data['max_results']
        user_id = request.user_id
        account_id = request.account_id
        datastreams, time, facets = FinderManager().search(query=query,
                                                           max_results=max_results,
                                                           account_id=account_id,
                                                           user_id=user_id,
                                                           resource=['ds'])

        account_domain = get_domain(account_id)
        for item in datastreams:
            link = item['link']
            item['link'] = account_domain + link

        return JSONHttpResponse(json.dumps(datastreams))
    else:
        raise Http400

def action_last(request):
    is_method_get_or_405(request)
    form = forms.LastForm(request.GET)
    if form.is_valid():
        max_results = form.cleaned_data['max_results']
        account_id = request.account_id

        datastream_ids = DataStream.objects.get_last(account_id = account_id
                                                     , limit = max_results)

        datastreams_objects = DataStream.objects.filter(id__in = datastream_ids).order_by('-id')
        datastreams = []
        account_domain = get_domain(account_id)
        language = Account.objects.get(pk=account_id).get_preference('account.language')
        for datastream in datastreams_objects:
            datastream_dict = datastream.as_dict(language)
            link = datastream_dict['link']
            datastream_dict['link'] = account_domain + link
            datastreams.append(datastream_dict)

        return JSONHttpResponse(json.dumps(datastreams))
    else:
        raise Http400


@public_access_forbidden
def action_history(request, guid):
    is_method_get_or_405(request)
    alert = get_object_or_404(Alert, task__guid = guid)

    return JSONHttpResponse(json.dumps(alert.get_history()))

@public_access_forbidden
def action_history_list(request, guid, uid):
    is_method_get_or_405(request)
    history_list = HistoryManager().get_history_list(guid, uid)
    return JSONHttpResponse(json.dumps(history_list))


@require_POST
@transaction.autocommit
def action_publish(request):
    """
    create a resource based on junar-uploader call
    Detect if is a webservice definition and redirect this to action_publish_webservice
    """
    logger = logging.getLogger(__name__)
    req_type = request.POST.get("type","")
    
    if req_type == "webservice": # validate dependieng on resource type
        form = forms.PublishFormWebservice(request.POST)
    else:
        form = forms.PublishFormFile(request.POST, request.FILES) # also includes URL
    
    # validate post, clean some fields
    if not form.is_valid():
        error = "NOFRM: " + form.get_error_description()
        logger.error(error)
        raise Http400(error)

    # mix cleaned form an the full POST request(could have more extra data)
    data = dict(request.POST.copy().items() + form.cleaned_data.items())
    data['user_id'] = request.user_id # for avoid pass request as param
    data['account_id'] = request.account_id 
    data['bucket_name'] = request.bucket_name
    
    if req_type == "webservice":
        return action_publish_webservice(data)
    else:
        return action_publish_file(data) # also includes URL

        
@transaction.autocommit
def action_publish_file(data):
    """
    publish a file-or-url dataset from junar-uploader
    """
    logger = logging.getLogger(__name__)

    guid = data.get('guid', None) # base resource to reuse
    # clone = data.get('clone', None) # reuse al data from previous datastream revision, do not start it an empty revision again

    # ------------------------------- detect SELF_PUBLISH vs URL dataset type
    file_data = data['file_data'] 
    if file_data == None:
        #TODO ugly, check for full replacements
        data['end_point'] = data['filename'] = data['source'].replace(' ', '%20') #it's a file on a web server, not a local one
        mimetype, http_status, url = get_mimetype(data['end_point'])
        data['impl_type'] = get_impl_type(mimetype, data['end_point'])
        data['size'] = 0
        typec = choices.CollectTypeChoices.URL
    else:
        data['filename'] = file_data.name
        data['end_point'] = 'file://' + active_datastore.create(file_data=file_data
            , account_id=data['account_id'], user_id=data['user_id'], bucket_name= data['bucket_name'])
        extension = data['filename'].split('.')[-1]
        data['impl_type'] = get_file_type_from_extension(extension)
        data['size'] = file_data.size
        typec = choices.CollectTypeChoices.SELF_PUBLISH

    data['dataset_type'] = typec
    data['status'] = data.get('status', StatusChoices.PENDING_REVIEW)
    
    # ------------------------------- define dataset and datastream
    if guid: #use previous dataset and datastream
        datastream_life = DatastreamLifeCycleManager(user=data['user_id'], guid=guid)
        for tag_name in data['tags']:
            tag, is_new = Tag.objects.get_or_create(name = tag_name, defaults={'status': 0})
            datastream_life.datastream_revision.tagdatastream_set.add(tag)

        user = User.objects.get(pk=data['user_id'])
        dataset_life = DatasetLifeCycleManager(user=user, resource = datastream_life.datastream.dataset)
        #update new info on dataset
        dataset_life.edit(fields=data)
        #in LifeCycleManager we always clone before edit. #TODO notify user we always "clone"
        #if clone: datastream_life.datastream_revision.clone()
        #update new info on datastream
        datastream_life.edit(fields=data)

        response = {"status": "ok", "messages": 'Resource updated OK' , 'data': data, 'user_id': data['user_id']
                    , 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id, 'datastream_id': datastream_life.datastream.id}

        return HttpResponse(json.dumps(response), mimetype='application/json')

    # ---------------------------------------------------------------------
    # If you don't provide the guid we try to detect it by dataset filename
    dataset_dao = DatasetDBDAO()
    # dataset_search = dataset_dao.query(filters_dict={'filename': data['filename']})
    dataset_search, total_resources = dataset_dao.query(account_id=data['account_id'], filters_dict={'end_point': data['end_point']})
    if total_resources > 0:
        result = dataset_search[0]
        # open ...
        user = User.objects.get(pk=data['user_id'])
        dataset_life = DatasetLifeCycleManager(user=user, dataset_id=result['dataset__id'])
        # and update ... 
        dataset_life.edit(fields=data)
    else:
        #test and create the dataset
        if typec == choices.CollectTypeChoices.URL:
            form = formsw.CreateDatasetURLForm(data) #TODO redefine form
        elif typec == choices.CollectTypeChoices.SELF_PUBLISH:
            form = formsw.CreateDatasetFileForm(data) #TODO redefine form
             
        if not form.is_valid():
            logger.error("Fail to publish dataset[%d]: %s" % (typec, form.get_error_description()))
            raise DatasetSaveException(form=form)
        else:
            #merge "cleaned data"
            data = dict(data.items() + form.cleaned_data.items())

        # logger.error('impl_type %s' % data['impl_type'])
        user = User.objects.get(pk=data['user_id'])
        dataset_life = DatasetLifeCycleManager(user=user)
        # dataset_life.create(title=data.get('title'), dataset_type=typec, **data)
        dataset_life.create(**data) #aleready include title and dataset_type

    # --------------------- check if datastream must be created
    create_ns = data.get("create_datastream", False)
    if create_ns == 'False' or create_ns == '0':
        create_ns = False
        
    # check if we're asked for add a datastream
    if not create_ns:
        response = {"status": "ok", "messages": 'Resource created OK', 'user_id': data['user_id']
                , 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id}
        return HttpResponse(json.dumps(response), mimetype='application/json')

    # --------------------------- Create datastream
    try:
        #create the related datastream
        response = create_datastream(user_id=data['user_id'], dataset_revision_id=dataset_life.dataset_revision.id, data=data)
    except Exception, e:
        raise
        error = 'Unexpected error creating datastream: %s' % (str(e) )
        logger.error(error)
        response = {"status": "error", "messages": error, 'user_id': data['user_id'], 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id}
        return HttpResponse(json.dumps(response), mimetype='application/json')

    try:
        datastream_life = DatastreamLifeCycleManager(user=data['user_id'], resource_id=response['datastream_id'])
    except Exception, e:
        error = 'Unexpected error cycling datastream: %s' % str(e)
        logger.error(error)
        response = {"status": "error", "messages": error, 'user_id': data['user_id'], 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id}
        return HttpResponse(json.dumps(response), mimetype='application/json')

    if response["status"] != "ok":
        error = "Creating view failed: [%s]" % response['error']
        logger.error(error)
        response = {"status": "error", "messages": error, 'data': data, 'user_id': data['user_id'], 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id}
        
    else:
        # creating tags if exists
        for tag_name in data['tags']:
            tag, is_new = Tag.objects.get_or_create(name = tag_name, defaults={'status': 0})
            datastream_life.datastream_revision.tagdatastream_set.add(tag)
        #TODO the API must allow parameters and sources?
        
        response = {"status": "ok", "messages": 'Resource DT+DS created OK', 'user_id': data['user_id']
            , 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id, 'datastream_id': response['datastream_id']}

    return HttpResponse(json.dumps(response), mimetype='application/json')

        
@transaction.autocommit
def action_publish_webservice(data):
    """
    publish a webservice-dataset from junar-uploader
    """
    logger = logging.getLogger(__name__)
    
    # find the category ID
    data['category_name'] = data["category"]
    #endpoint in juploader uses the old way, for non-updated users we preserve compatibility
    data['end_point'] = data.get('end_point', data.get('endpoint'))
    data['dataset_type'] = CollectTypeChoices.WEBSERVICE

    #TODO redefine form
    form = formsw.CreateDatasetWebserviceForm(data)
    if not form.is_valid():
        logger.error("Fail to publish webservice: %s" % form.get_error_description())
        raise DatasetSaveException(form=form)

    data['status'] = data.get('status', StatusChoices.PUBLISHED)
    data['impl_type']=data.get('impl_type', SourceImplementationChoices.REST)
    
    category_name = form.cleaned_data['category'] # it's a name, no ID, lifeCycle will detect ID
    category = Category.objects.get(categoryi18n__name=category_name)
    title=form.cleaned_data['title']    
    description=form.cleaned_data['description']
    typec=form.cleaned_data['dataset_type']
    status=form.cleaned_data.get('status')
    description=form.cleaned_data['description']
    notes=form.cleaned_data['notes']
    path_to_headers = form.cleaned_data['path_to_headers']
    path_to_data = form.cleaned_data['path_to_data']
    token = form.cleaned_data['token']
    algorithm = form.cleaned_data['algorithm']
    username = form.cleaned_data['username']
    password = form.cleaned_data['password']
    method_name = form.cleaned_data['method_name']
    namespace = form.cleaned_data['namespace']
    useCache = form.cleaned_data['enable_use_cache']
    license_url=form.cleaned_data['license_url']
    spatial=form.cleaned_data['spatial']
    frequency=form.cleaned_data['frequency']
    mbox=form.cleaned_data['mbox']
    end_point=form.cleaned_data['end_point']
    impl_type=form.cleaned_data['impl_type'] #SourceImplementationChoices.REST or SourceImplementationChoices.SOAP

    # detect parameters, sources, tags
    #TODO check on junar-uploader
    user = User.objects.get(pk=data['user_id'])
    dataset_life = DatasetLifeCycleManager(user=user)
    try:
        dataset_life.create(title=title, collect_type=typec, description=description
            , status=status, end_point=end_point
            , category=category.id, notes=notes, impl_type=impl_type, file_name='', tags=[], sources=[]
            , license_url=license_url, spatial=spatial,frequency=frequency, mbox=mbox
            , path_to_headers = path_to_headers, path_to_data=path_to_data, token = token
            , algorithm = algorithm, username = username, password = password, method_name=method_name
            , namespace=namespace, useCache = useCache)
    except Category.DoesNotExist:
        error = ugettext('APP-DATASET-CATEGORYDOESNOTEXIST-TEXT')
        logger.error(error)
        response = {"status": "error", "messages": error, 'user_id': data['user_id'], 'account_id':dataset_life.user.account.id}
        return HttpResponse(json.dumps(response), mimetype='application/json')
    except Exception, e:
        import traceback
        #top = trace[-1]
        #extras = ', '.join([type(e).__name__, os.path.basename(top[0]), str(top[1])])
        error = 'Unexpected error creating dataset: %s -- %s -- %s -- %s' % (str(e), repr(e), str(traceback.extract_stack()), str(dataset_life.dataset_revision))
        logger.error(error)
        response = {"status": "error", "messages": error, 'user_id': data['user_id'], 'account_id':dataset_life.user.account.id}
        return HttpResponse(json.dumps(response), mimetype='application/json')


    # check if datastream must be created
    create_ns = data.get("create_datastream",False)
    if create_ns == 'False' or create_ns == '0':
        create_ns = False
        
    # check if we're' asked for add a datastream
    if not create_ns:
        response = {"status": "ok", "messages": 'Resource created OK' , 'data': data, 'user_id': data['user_id']
                , 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id}

    else:
        try:
            creation = create_datastream(user_id=data['user_id'], dataset_revision_id=dataset_life.dataset_revision.id, data=data)
        except Exception, e:
            error = 'Unexpected error creating view: %s' % str(e)
            logger.error(error)
            response = {"status": "error", "messages": error, 'data': data, 'user_id': data['user_id'], 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id}
            return HttpResponse(json.dumps(response), mimetype='application/json')

        if creation["status"] != "ok":
            error = "Creating view failed: [%s]" % creation['error']
            logger.error(error)
            response = {"status": "error", "messages": error, 'data': data, 'user_id': data['user_id'], 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id}
            return HttpResponse(json.dumps(response), mimetype='application/json')

        else:
            response = {"status": "ok", "messages": 'Resource DT+DS created OK' , 'data': data, 'user_id': data['user_id']
                , 'account_id':dataset_life.user.account.id, 'dataset_id': dataset_life.dataset.id, 'datastream_id': creation['datastream_id']}
                
    return HttpResponse(json.dumps(response), mimetype='application/json')
            

def create_datastream(user_id, dataset_revision_id, data):
    """ Create a new datastream from a dataset-webservice """

    dataset_life = DatasetLifeCycleManager(user=user_id, dataset_revision_id=dataset_revision_id)
    datastream_life = DatastreamLifeCycleManager(user=user_id)

    # maybe we need to buid the data_source or select_statement
    #TODO put this on datastream_lifecycle and pass table_id and dataset_revision_id as params on create function
    if not data.get("data_source", False):
        fields = {'dataset_revision_id':dataset_revision_id, 'table_id': data.get('table_id', 'table0')}
        data_source = DatastreamBuilder(**fields).build_data_source()
    else:
        data_source=data.get("data_source")
    
    if not data.get("select_statement", False):
        fields = {'table_id': data.get('table_id', 'table0')}
        select_statement = DatastreamBuilder(**fields).build_select_statement()
    else:
        select_statement=data.get("select_statement")
    
    datastream_life.create(dataset=dataset_life.dataset, title=dataset_life.dataset_i18n.title
            , data_source=data_source, select_statement=select_statement
            , category_id=dataset_life.dataset_revision.category_id
            , description=data.get("description", ""), status=int(data.get("status", StatusChoices.PENDING_REVIEW))
            , rdf_template=data.get("rdf_template", ""), notes=data.get("notes", ""))

        
    response = {"status":"ok", "title": dataset_life.dataset_i18n.title, "datastream_id": datastream_life.datastream.id}
    return response
