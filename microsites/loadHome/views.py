from django.core.paginator import Paginator
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_POST, require_GET
from django.core.serializers.json import DjangoJSONEncoder
from core.models import *
from core.managers import *
from core.shortcuts import render_to_response
from core.http import add_domains_to_permalinks
from microsites.loadHome.forms import *
from microsites.loadHome import utils
from utils import *
from core.communitymanagers import *
from microsites.home_manager.managers import HomeFinder
from django.shortcuts import redirect
from django.utils.translation import ugettext
from core.exceptions import *
from microsites.exceptions import *

import json

import logging
logger = logging.getLogger(__name__)


@require_GET
def load(request):
    """
    Shows the microsite's home page
    """
    raise DataStreamDoesNotExist
    jsonObject = None
    language = request.auth_manager.language
    account = request.account
    preferences = request.preferences

    if('preview' in request.GET and request.GET['preview'] == 'true') or preferences["account_home"]:
        """ shows the home page new version"""
        if'preview' in request.GET and request.GET['preview'] == 'true':
            jsonObject = json.loads(preferences["account_preview"], strict=False)
            pageTitle = ugettext('APP-PREVIEWWINDOW-TITLE')
        elif preferences["account_has_home"]:
            jsonObject = json.loads(preferences["account_home"], strict=False)

        if jsonObject:
            themeid = jsonObject['theme']
            config = jsonObject['config']
            datastreams = []
            resources = []
            if config:
                if 'sliderSection' in config:
                    datastreams = retrieveDatastreams(config['sliderSection'], language)
                if 'linkSection' in config:
                    resources = retrieveResourcePermalinks(config['linkSection'], language)

            if preferences['account_home_filters'] == 'featured_accounts': # the account have federated accounts (childs)
                featured_accounts = Account.objects.get_featured_accounts(account.id)
                account_id = [featured_account['id'] for featured_account in featured_accounts]
                for index, f in enumerate(featured_accounts):
                    featured_accounts[index]['link'] = Account.objects.get(id=f['id']).get_preference('account.domain')

                categories = Category.objects.get_for_home(language, account_id)
            else:
                account_id = account.id
                categories = Category.objects.get_for_home(language, account_id)

            results, search_time, facets = FinderManager(HomeFinder).search(max_results=250, account_id=account_id)

            paginator = Paginator(results, 25)
            revisions = paginator.page(1)

            if preferences['account_home_filters'] == 'featured_accounts':
                add_domains_to_permalinks(revisions.object_list)

            return render_to_response('loadHome/home_'+themeid+'.html', locals())
        else:
            # No Home, return to featured Dashboards
            # return redirect('/dashboards/')

            # For the moment, redirect to search
            return redirect('/search/')
    else:
        # For the moment, redirect to search, but this needs to be erased
        return redirect('/search/')

        # """ shows a no-home page"""
        # we first check the account preferences
        # if there are not hots setted, we retrieve the really hot
        #    resources_for_hot = [('account_hot_datastreams', DataStream),
        #                         ('account_hot_visualizations', Visualization)]
        #
        #    for key, manager in resources_for_hot:
        #        if not preferences[key]:
        #            top = manager.objects.get_top(account.id)
        #            preferences[key] = ','.join([ str(i) for i in top ])

        # hot_datastreams = preferences['account_hot_datastreams']
        # hot_visualizations = preferences['account_hot_visualizations']

        # datastreams = []
        # if hot_datastreams:
        #     datastreams = DataStream.objects.query_hot_n(10, language, hot = hot_datastreams)

        # if hot_visualizations:
        #     datastreams += Visualization.objects.query_hot_n(language, hot = hot_visualizations)
        #     #random.shuffle(datastreams)

        # if preferences['account_home_filters'] == 'featured_accounts':
        #     featured_accounts = Account.objects.get_featured_accounts(account.id)
        #     account_id = [featured_account['id'] for featured_account in featured_accounts]
        #     for index, f in enumerate(featured_accounts):
        #         featured_accounts[index]['link'] = Account.objects.get(id = f['id']).get_preference('account.domain')

        #     categories = Category.objects.get_for_home(language, account_id)
        # else:
        #     account_id = account.id
        #     categories = Category.objects.get_for_home(language, account_id)

        # results, search_time, facets = FinderManager(HomeFinder).search(max_results = 250,
        #                                                             order = '1',
        #                                                             account_id = account_id)

        # paginator = Paginator(results, 25)
        # revisions = paginator.page(1)

        # if preferences['account_home_filters'] == 'featured_accounts':
        #     add_domains_to_permalinks(revisions.object_list + datastreams)

        # return render_to_response('home_manager/queryList.html', locals())

@require_POST
def update_list(request):
    account         = request.account
    auth_manager    = request.auth_manager
    preferences     = account.get_preferences()


    form = QueryDatasetForm(request.POST)
    if form.is_valid():
        query = form.cleaned_data.get('search')
        page = form.cleaned_data.get('page')
        order = form.cleaned_data.get('order')
        order_type = form.cleaned_data.get('order_type')

        resources = ['ds', 'db', 'vz', 'dt']
        category_filters = form.cleaned_data.get('category_filters')
        if category_filters:
            category_filters=category_filters.lower().split(",")
        

        if preferences['account_home_filters'] == 'featured_accounts':

            entity = form.cleaned_data.get('entity_filters')
            if entity:
                accounts_ids = [int(entity)]
            else:
                featured_accounts = account.account_set.values('id').all()
                accounts_ids = [featured_account['id'] for featured_account in featured_accounts]

            typef = form.cleaned_data.get('type_filters')
            if typef:
                resources = [typef]

            results, search_time, facets = FinderManager(HomeFinder).search(
                                                                    query = query,
                                                                    max_results = 250,
                                                                    account_id = accounts_ids,
                                                                    resource = resources,
                                                                    category_filters=category_filters,
                                                                    order = order,
                                                                    order_type = order_type)

        else:
            all_resources = form.cleaned_data.get('all')
            if not all_resources:
                resources_type = form.cleaned_data.get('type')
                resources = []
                for resource_name in resources_type.split(','):
                    resources.append(resource_name)

            results, search_time, facets = FinderManager(HomeFinder).search(
                category_filters= category_filters,
                query=query,
                resource=resources,
                max_results=250,
                order=order,
                order_type=order_type,
                account_id=account.id
            )


        ## manual temporary fix for indextank fails
        #results2 = []
        #for r in results:
        #    if r['category'] in categories or categories==[]:
        #        results2.append(r)

        paginator = Paginator(results, 25)

        if preferences['account_home_filters'] == 'featured_accounts':
            add_domains_to_permalinks(results)

        response = {
            "number_of_pages": paginator.num_pages,
             "errors": [],
             "revisions": paginator.page(page and page or 1).object_list
       }
    else:
        response = {
            "number_of_pages": 0,
            "errors": ['Invalid data'],
            "errores_locos": form.errors,
            "revisions": []
       }
        results=[]
        categories=[]

    response["results_dbg"] = results
    response["categories_asked_dbg"] = category_filters
    return HttpResponse(json.dumps(response, cls=DjangoJSONEncoder), mimetype='application/json')


@require_GET
def action_update_categories(request):
    language = request.auth_manager.language
    params = request.GET
    account_id = params.get('account_id','')

    # we need a full categories list in case is a "federated account" (have childs accounts)
    if account_id == '':
        account = request.account
        preferences = request.preferences
        if preferences['account_home_filters'] == 'featured_accounts':
            featured_accounts = Account.objects.get_featured_accounts(account.id)
            account_id = [featured_account['id'] for featured_account in featured_accounts]
            for index, f in enumerate(featured_accounts):
                featured_accounts[index]['link'] = Account.objects.get(id = f['id']).get_preference('account.domain')


    # account_id is single account or a list of featured accounts
    categories = Category.objects.get_for_home(language, account_id)

    return render_to_response('loadHome/categories.js', locals(), mimetype="text/javascript")
