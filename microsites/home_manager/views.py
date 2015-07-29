from django.core.paginator import Paginator
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_POST, require_GET
from django.core.serializers.json import DjangoJSONEncoder
from core.models import *
from core.managers import *
from core.shortcuts import render_to_response
from microsites.helpers import add_domains_to_permalinks
from microsites.home_manager import forms
from core.communitymanagers import *
from microsites.home_manager.managers import HomeFinder
from core.http import get_domain
import json
import logging
#import random

@require_POST
def action_update_list(request):
    account         = request.account
    auth_manager    = request.auth_manager
    language        = auth_manager.language
    preferences     = account.get_preferences()

    form = forms.QueryDatasetForm(request.POST)
    if form.is_valid():
        query       = form.cleaned_data.get('search')
        page        = form.cleaned_data.get('page')
        order       = form.cleaned_data.get('order')
        order_type  = form.cleaned_data.get('order_type')

        resources = ['ds', 'db', 'chart', 'dt']

        if preferences['account_home_filters'] == 'featured_accounts':

            entity = form.cleaned_data.get('entity_filters')
            if entity:
                accounts_ids = [int(entity)]
            else:
                featured_accounts = account.account_set.values('id').all()
                accounts_ids = [featured_account['id'] for featured_account in featured_accounts]

            type = form.cleaned_data.get('type_filters')
            if type:
                resources = [type]

            category_id = form.cleaned_data.get('category_filters')
            results, search_time, facets = FinderManager(HomeFinder).search(
                                                                    query=query,
                                                                    max_results=250,
                                                                    account_id=accounts_ids,
                                                                    resource=resources,
                                                                    category_id=category_id,
                                                                    order=order,
                                                                    order_type=order_type)
        else:
            all_resources = form.cleaned_data.get('all')
            if not all_resources:
                resources_type = form.cleaned_data.get('type')
                resources = []
                for resource_name in resources_type.split(','):
                    resources.append(resource_name)

            category_filters = form.cleaned_data.get('category_filters')
            categories = []
            if category_filters:
                for category_name in category_filters.split(','):
                    categories.append(category_name)

            results, search_time, facets = FinderManager(HomeFinder).search(category_name = categories,
                                                                     query = query,
                                                                     resource = resources,
                                                                     max_results = 250,
                                                                     order = order,
                                                                     order_type = order_type,
                                                                     account_id = account.id)

        paginator = Paginator(results, 25)

        if preferences['account_home_filters'] == 'featured_accounts':
            add_domains_to_permalinks(results)

        response = {"number_of_pages": paginator.num_pages,
                     "errors": [],
                     "revisions": paginator.page(page and page or 1).object_list
                   }
    else:
        response = {"number_of_pages": 0,
                     "errors": ['Invalid data'],
                     "revisions": []
                   }

    return HttpResponse(json.dumps(response, cls=DjangoJSONEncoder), mimetype='application/json')

@require_GET
def action_update_categories(request):
    language = request.auth_manager.language
    params = request.GET
    account_id = params.get('account_id')

    categories = Category.objects.get_for_home(language, account_id)

    return render_to_response(
            'home_manager/categories.js',
            locals(),
            mimetype="text/javascript"
    )


@require_GET
def action_query(request):
    """
    Show the microsite's home page
    """
    language = request.auth_manager.language
    account = request.account
    preferences = request.preferences

    if preferences["account_home"]:
        jsonObject= json.loads(preferences["account_home"])
        theme = jsonObject['theme']
        return render_to_response('loadHome/home_'+theme+'.html', locals())
    else:

    # we first check the account preferences
    # if there are not hots setted, we retrieve the really hot
    #    resources_for_hot = [('account_hot_datastreams', DataStream),
    #                         ('account_hot_visualizations', Visualization)]
    #
    #    for key, manager in resources_for_hot:
    #        if not preferences[key]:
    #            top = manager.objects.get_top(account.id)
    #            preferences[key] = ','.join([ str(i) for i in top ])

        hot_datastreams = preferences['account_hot_datastreams']
        hot_visualizations = preferences['account_hot_visualizations']

        datastreams = []
        if hot_datastreams:
            datastreams = DataStream.objects.query_hot_n(10, language, hot = hot_datastreams)

        if hot_visualizations:
            datastreams += Visualization.objects.query_hot_n(language, hot = hot_visualizations)
            #random.shuffle(datastreams)

        if preferences['account_home_filters'] == 'featured_accounts':
            featured_accounts = Account.objects.get_featured_accounts(account.id)
            account_id = [featured_account['id'] for featured_account in featured_accounts]
            for index, f in enumerate(featured_accounts):
                featured_accounts[index]['link'] = Account.objects.get(id = f['id']).get_preference('account.domain')

            categories = Category.objects.get_for_home(language, account_id)
        else:
            account_id = account.id
            categories = Category.objects.get_for_home(language, account_id)

        results, search_time, facets = FinderManager(HomeFinder).search(max_results = 250,
                                                                    order = '1',
                                                                    account_id = account_id)

        paginator = Paginator(results, 25)
        revisions = paginator.page(1)

        if preferences['account_home_filters'] == 'featured_accounts':
            add_domains_to_permalinks(revisions.object_list + datastreams)

        return render_to_response('home_manager/queryList.html', locals())

def action_sitemap(request):
    import datetime
    logger = logging.getLogger(__name__)

    language = request.auth_manager.language
    account = request.account
    params = request.GET

    domain = get_domain(request)
    now = datetime.datetime.now()

    datastreams = DataStream.objects.filter(user__account_id=account.id, datastreamrevision__status=3).order_by('-id').distinct()

    dss = []
    for ds in datastreams:
        try:
            dic = ds.as_dict()
        except:
            logger.error('sitemap ERROR %s' % str(ds))
            continue

        dic["date"] = datetime.datetime.strptime(dic["created_at"], "%Y-%m-%d %H:%M:%S").date()
        dss.append(dic) #(user_id = request.auth_manager.id, language = language))

    visualizations = Visualization.objects.filter(user__account_id=account.id, visualizationrevision__status=3).order_by('-id').distinct()

    vss = []
    for vs in visualizations:
        try:
            dic = vs.as_dict()
        except:
            logger.error('sitemap VIZ ERROR %s' % str(vs))
            continue

        dic ["date"] = datetime.datetime.strptime(dic["created_at"], "%Y-%m-%d %H:%M:%S").date()
        vss.append(dic) #(user_id = request.auth_manager.id, language = language))

    dashboards = Dashboard.objects.filter(user__account_id=account.id, dashboardrevision__status=3).order_by('-id').distinct()

    dshs = []
    for dsh in dashboards:
        try:
            dic = dsh.as_dict()
        except:
            logger.error('sitemap DASH ERROR %s' % str(dsh))
            continue

        dic ["date"] = datetime.datetime.strptime(dic["created_at"], "%Y-%m-%d %H:%M:%S").date()
        dshs.append(dic) #(user_id = request.auth_manager.id, language = language))


    return render_to_response('sitemap.xml',locals(),mimetype="application/xml")
