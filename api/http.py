from django.http import HttpResponse


class JSONHttpResponse(HttpResponse):
    """ A custom HttpResponse that handles the headers for our JSON responses """
    #TODO move to CORE
    def __init__(self, content):
        """ Set the headers of the response and assign it a value """
        HttpResponse.__init__(self, content)
        self['Content-Type'] = 'application/json;charset=utf-8'
        
class HttpResponseTooManyRequests(JSONHttpResponse):
    status_code = 429

    def __init__(self, content, retry_after):
        JSONHttpResponse.__init__(self, content)
        self['Retry-After'] = retry_after

class HttpResponseNotAllowed(JSONHttpResponse):
    status_code = 405

    def __init__(self, content, permitted_methods):
        JSONHttpResponse.__init__(self, content)
        self['Allow'] = ', '.join(permitted_methods)

class HttpResponseUnauthorized(JSONHttpResponse):
    status_code = 401

    def __init__(self, content):
        JSONHttpResponse.__init__(self, content)

class HttpResponseForbidden(JSONHttpResponse):
    status_code = 403

    def __init__(self, content):
        JSONHttpResponse.__init__(self, content)

class HttpResponseNotFound(JSONHttpResponse):
    status_code = 404

    def __init__(self, content):
        JSONHttpResponse.__init__(self, content)

class HttpResponseServerError(JSONHttpResponse):
    status_code = 500

    def __init__(self, content):
        JSONHttpResponse.__init__(self, content)

class HttpResponseBadRequest(JSONHttpResponse):
    status_code = 400

    def __init__(self, content):
        JSONHttpResponse.__init__(self, content)

