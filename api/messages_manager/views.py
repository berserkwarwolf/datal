from django.conf import settings
from django.http import Http404
from core.models import *
from api.models import *
from api.http import JSONHttpResponse
from api.exceptions import is_method_get_or_405

import json

def action_feed(request):
    if request.account_id:
        is_method_get_or_405(request)
        date = request.GET.get('from', None)
        response = Message.objects.get_by_account(request.account_id, date)
        return JSONHttpResponse(json.dumps(response))
    else:
        raise Http404