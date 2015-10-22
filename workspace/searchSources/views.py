import json
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods

from core.auth.decorators import login_required
from core.models import *


@login_required
@require_http_methods(["GET", "POST"])
def action_search_source(request):
    term = request.REQUEST.get('term', None)
    sources = [ source['name'] for source in Source.objects.values('name').filter(name__icontains=term) ]
    return HttpResponse(json.dumps(sources), content_type='application/json')


# Metodo para Select 2: Despues de migrar todos a select 2, debemos borrar el metodo "action_search_source".
@login_required
@require_http_methods(["GET", "POST"])
def action_search_source_select2(request):
    term = request.REQUEST.get('term', None)
    sources = {
    	'items': [],
    	'total_count': 0
    }

    sources['total_count'] = Source.objects.count()

    for source in Source.objects.values().filter(name__icontains=term):
    	sources['items'].append( source )

    return HttpResponse(json.dumps(sources), content_type='application/json')