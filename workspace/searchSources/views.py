import json
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods

from core.auth.decorators import login_required
from core.models import Source


@login_required
@require_http_methods(["GET", "POST"])
def action_search_source(request):
    term = request.REQUEST.get('term', None)
    sources = [ source['name'] for source in Source.objects.values('name').filter(name__icontains=term) ]
    return HttpResponse(json.dumps(sources), content_type='application/json')


@login_required
@require_http_methods(["GET", "POST"])
def validate_source_url(request):
    url = request.REQUEST.get('url', None)
    
    if url == '':
        name=False
    elif url:
        try:
            name = Source.objects.get(url=url).name
        except Source.DoesNotExist:
            name=False
    else:
        raise Source.DoesNotExist("The 'url' parameter is wrong or empty")

    return HttpResponse(json.dumps({"name":name}), content_type='application/json')


@login_required
@require_http_methods(["GET", "POST"])
def validate_source_name(request):
    name_param = request.REQUEST.get('name', None)

    if name_param == '':
        name=False
    elif name_param:
        try:
            name = Source.objects.get(name=name_param).name
        except Source.DoesNotExist:
            name=False
    else:
        raise Source.DoesNotExist("The 'name' parameter is wrong or empty")

    return HttpResponse(json.dumps({"name":name}), content_type='application/json')
