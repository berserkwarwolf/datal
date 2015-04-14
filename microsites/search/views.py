from django.core.paginator import InvalidPage, Paginator
from django.conf import settings
from django.http import Http404
from core.shortcuts import render_to_response
from core.models import Category
from microsites.search import forms
from microsites.managers import *

def action_browse(request, category_slug=None, page = 1):
    account     = request.account
    preferences = request.preferences
    category    = Category.objects.get_for_browse(category_slug, account.id, preferences['account_language'])

    try:
        results, search_time, facets = FinderManager().search(category_id = category['id']
                                                              , account_id = account.id)
    except InvalidPage:
        raise Http404

    paginator = Paginator(results, settings.PAGINATION_RESULTS_PER_PAGE)
    page_results = paginator.page(page).object_list

    return render_to_response('search/search.html', locals())

def do_search(request, category_filters = None, datasets = None):
    account = request.account
    preferences = request.preferences
    form = forms.SearchForm(request.GET)

    if form.is_valid():
        query       = form.get_query()
        page        = form.cleaned_data.get('page')

        featured_accounts = account.account_set.values('id').all()
        if featured_accounts:
            accounts_ids = [featured_account['id'] for featured_account in featured_accounts]
        else:
            accounts_ids = account.id

        try:
            resources = ["ds", "db", "chart", "dt"]

            results, search_time, facets = FinderManager().search(query = query
                                                                  , account_id = accounts_ids
                                                                  , category_filters = category_filters
                                                                  , resource = resources)
        except InvalidPage:
            raise Http404

        paginator = Paginator(results, settings.PAGINATION_RESULTS_PER_PAGE)
        page_results = paginator.page(page).object_list

        return render_to_response('search/search.html', locals())
    else:
        raise Http404



def action_search(request):
    return do_search(request)

def action_search_by_query_and_category(request, filter):
    try:
        datasets = request.GET.get("datasets", None)
        name, category = filter.split(":")
        return do_search(request, category_filters = {name:category}, datasets = datasets)
    except:
        return do_search(request)
