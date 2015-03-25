from core.models import *
from api.http import JSONHttpResponse
from api.resources_manager import forms
from api.managers import *
from api.resources_manager.managers import IndexTankFinder
from api.helpers import get_domain
import json

def action_explore(request):
    form = forms.ExploreForm(request.GET)
    if not form.is_valid():
        raise Http400("Invalid/missing args")

    args = form.cleaned_data_dict()

    try:
        meta = json.loads(args['meta'])
    except ValueError, e:
        raise Http400(e)

    user_id = request.user_id
    account_id = request.account_id

    categories = Category.objects.get_ordered(language = 'es', account_id = account_id)

    for category in categories:
        category.pop('id')
        category.pop('slug')
        results, search_time, facets = FinderManager(IndexTankFinder).search(query = form.cleaned_data['q']
                                                                             , page = args['page']
                                                                             , slice = args['limit']
                                                                             , meta_data = meta
                                                                             , account_id = account_id)

        account_domain = get_domain(account_id)
        for item in results:
            link = item['link']
            item['link'] = account_domain + link
        category['results'] = results

    return JSONHttpResponse(json.dumps(categories))

def action_search(request):

    form = forms.SearchForm(request.GET)
    if not form.is_valid():
        raise Http400("Invalid/missing args")

    args = form.cleaned_data_dict()

    query = form.cleaned_data['q']

    resource = form.cleaned_data['resource']
    if not resource:
        resource = 'all'

    try:
        meta = ''
        if args['meta']:
            meta = json.loads(args['meta'])
    except ValueError, e:
        raise Http400(e)

    account_id = request.account_id
    response, time, facets = FinderManager(IndexTankFinder).search(query = query
                                                     , page = args['page']
                                                     , limit = args['limit']
                                                     , meta_data = meta
                                                     , account_id = account_id
                                                     , resource = resource)

    account_domain = get_domain(account_id)
    for item in response:
        link = item['link']
        item['link'] = account_domain + link

    return JSONHttpResponse(json.dumps(response))
