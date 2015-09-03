from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from core.auth.decorators import login_required
from core.models import *
from .forms import *
import json


@login_required
@require_http_methods(["GET"])
def action_search(request):
    
    form = TagSearchForm(request.GET)
    if form.is_valid():
        response = [ tag['name'] for tag in Tag.objects.values('name').filter(name__contains=form.cleaned_data['term']) ]
    else:
        response = {'status': 'error', 'messages': ['']} 

    return HttpResponse(json.dumps(response), content_type='application/json')
