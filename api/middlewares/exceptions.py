from django.conf import settings
from api.http import *
from api.exceptions import *

class ExceptionMiddleware(object):
    """
    Handles our exceptions and responses in order to be complaint with http
    """

    def process_exception(self, request, exception):
        if isinstance(exception, Http400):
            return HttpResponseBadRequest(exception.convert_json())
        elif isinstance(exception, Http404):
            return HttpResponseNotFound(exception.convert_json())
        elif isinstance(exception, Http405):
            return HttpResponseNotAllowed(exception.convert_json(), exception.methods)
        elif isinstance(exception, Http401):
            return HttpResponseUnauthorized(exception.convert_json())
        elif isinstance(exception, BigdataNamespaceNotDefined):
            return HttpResponseServerError(content=exception.convert_json())
        else:
            if settings.DEBUG:
                raise
            else:
                return HttpResponseServerError(content=exception.__unicode__())