from django.shortcuts import get_object_or_404
from core.models import User
from api.http import JSONHttpResponse
from api.exceptions import is_method_get_or_405
from api.decorators import public_access_forbidden
from core.choices import TicketChoices
import json

@public_access_forbidden
def action_view(request, ticket):
    is_method_get_or_405(request)
    user = get_object_or_404(User, userpasstickets__uuid=ticket, userpasstickets__type = TicketChoices.API_AUTHORIZATION)
    return JSONHttpResponse(json.dumps(user.as_dict()))