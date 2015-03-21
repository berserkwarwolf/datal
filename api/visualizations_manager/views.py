from junar.core.models import *
from junar.api.models import *
from junar.api.http import JSONHttpResponse
from junar.api.exceptions import is_method_get_or_405, Http400
from junar.api.managers import *
from junar.api.visualizations_manager import forms
from junar.api.helpers import get_domain
import json

def action_last(request):
    is_method_get_or_405(request)
    form = forms.LastForm(request.GET)
    if form.is_valid():
        max_results = form.cleaned_data['max_results']
        account_id = request.account_id

        visualization_ids = Visualization.objects.get_last(account_id = account_id
                                                           , limit = max_results)

        visualization_objects = Visualization.objects.filter(id__in = visualization_ids)
        visualizations = []
        account_domain = get_domain(account_id)
        for visualization in visualization_objects:
            visualization_dict = visualization.as_dict()
            link = visualization_dict['link']
            visualization_dict['link'] = account_domain + link
            visualizations.append(visualization_dict)

        return JSONHttpResponse(json.dumps(visualizations))
    else:
        raise Http400

def action_top(request):
    is_method_get_or_405(request)
    form = forms.TopForm(request.GET)
    if form.is_valid():
        max_results = form.cleaned_data['max_results']
        account_id = request.account_id

        visualization_ids = Visualization.objects.get_top(account_id = account_id
                                                     , limit = max_results)

        visualizations_objects = Visualization.objects.filter(id__in = visualization_ids)
        visualizations = []
        account_domain = get_domain(account_id)
        for visualization in visualizations_objects:
            visualization_dict = visualization.as_dict()
            link = visualization_dict['link']
            visualization_dict['link'] = account_domain + link
            visualizations.append(visualization_dict)

        return JSONHttpResponse(json.dumps(visualizations))
    else:
        raise Http400
