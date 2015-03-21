from django.shortcuts import get_object_or_404
from junar.core.models import *
from junar.api.models import *
from junar.api.http import JSONHttpResponse
from junar.api.exceptions import is_method_get_or_405, Http400
from junar.api.managers import *
from junar.api.dashboards_manager import forms
from junar.api.helpers import get_domain, add_domain_to_dashboard_links
import json

def action_view(request, guid):
    is_method_get_or_405(request)
    dashboard  = get_object_or_404(Dashboard, guid=guid)
    passticket = request.GET.get('passticket', None)
    user_id = UserPassTickets.objects.resolve_user_id(passticket, request.user_id)
    response = dashboard.as_dict(user_id)
    add_domain_to_dashboard_links(response)
    return JSONHttpResponse(json.dumps(response))

def action_search(request):
    is_method_get_or_405(request)
    search_form = forms.SearchForm(request.GET)
    if search_form.is_valid():
        query = search_form.cleaned_data.get('query')
        max_results = search_form.cleaned_data.get('max_results')
        user_id = request.user_id
        account_id = request.account_id
        dashboards, time, facets = FinderManager().search(query = query
                                                             , max_results = max_results
                                                             , account_id = account_id
                                                             , user_id = user_id
                                                             , resource = 'db')

        account_domain = get_domain(account_id)
        for item in dashboards:
            link = item['link']
            item['link'] = account_domain + link

        return JSONHttpResponse(json.dumps(dashboards))
    else:
        raise Http400


def action_last(request):
    is_method_get_or_405(request)
    form = forms.LastForm(request.GET)
    if form.is_valid():
        max_results = form.cleaned_data['max_results']
        account_id = request.account_id

        dashboard_ids = Dashboard.objects.get_last(account_id = account_id
                                                     , limit = max_results)

        dashboards_objects = Dashboard.objects.filter(id__in = dashboard_ids)
        dashboards = []
        account_domain = get_domain(account_id)
        for dashboard in dashboards_objects:
            dashboard_dict = dashboard.as_dict()
            link = dashboard_dict['link']
            dashboard_dict['link'] = account_domain + link
            dashboards.append(dashboard_dict)

        return JSONHttpResponse(json.dumps(dashboards))
    else:
        raise Http400
