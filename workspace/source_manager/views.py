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