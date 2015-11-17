from django.core.paginator import Paginator
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_POST, require_GET
from django.core.serializers.json import DjangoJSONEncoder
from django.template import loader, Context
from core.models import *
from core.managers import *
from core.shortcuts import render_to_response
from core.http import add_domains_to_permalinks
from microsites.loadHome.forms import QueryDatasetForm
from microsites.loadHome import utils
from utils import *
from core.communitymanagers import *
from microsites.loadHome.managers import HomeFinder
from django.shortcuts import redirect
from django.utils.translation import ugettext
from core.search.finder import FinderQuerySet

import json

import logging
logger = logging.getLogger(__name__)


@require_GET
def load(request):
    """
    Shows the microsite's home page
    """

    jsonObject = None
    language = request.auth_manager.language
    account = request.account
    preferences = request.preferences
    is_preview = 'preview' in request.GET and request.GET['preview'] == 'true'
    if is_preview or preferences["account_home"]:
        """ shows the home page new version"""
        if is_preview:
            jsonObject = json.loads(preferences["account_preview"], strict=False)
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

            queryset = FinderQuerySet(FinderManager(HomeFinder), max_results=250, account_id=account_id )
            

            paginator = Paginator(queryset, 25)
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

            queryset = FinderQuerySet(FinderManager(HomeFinder), 
                query = query,
                max_results = 250,
                account_id = accounts_ids,
                resource = resources,
                category_filters=category_filters,
                order = order,
                order_type = order_type
            ) 

        else:
            all_resources = form.cleaned_data.get('all')
            if not all_resources:
                resources_type = form.cleaned_data.get('type')
                resources = []
                for resource_name in resources_type.split(','):
                    resources.append(resource_name)

            queryset = FinderQuerySet(FinderManager(HomeFinder), 
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

        paginator = Paginator(queryset, 25)

        revisions = paginator.page(page and page or 1)
        if preferences['account_home_filters'] == 'featured_accounts':
            add_domains_to_permalinks(revisions.object_list)
        error = ''

        results = revisions.object_list
    else:
        error = 'Invalid data'
        results=[]
        categories=[]

    t = loader.get_template('loadHome/table.json')
    c = Context(locals())
    return HttpResponse(t.render(c), content_type="application/json")


@require_GET
def update_categories(request):
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
