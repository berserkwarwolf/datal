from django.shortcuts import get_object_or_404
from junar.core.models import User
from junar.api.http import JSONHttpResponse
from junar.api.exceptions import is_method_get_or_405
from junar.api.decorators import public_access_forbidden
from junar.core.choices import TicketChoices
import json

@public_access_forbidden
def action_view(request, ticket):
    is_method_get_or_405(request)
    user = get_object_or_404(User, userpasstickets__uuid=ticket, userpasstickets__type = TicketChoices.API_AUTHORIZATION)
    return JSONHttpResponse(json.dumps(user.as_dict()))