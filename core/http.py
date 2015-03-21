from django.http import HttpResponse

def get_domain(request, default_domain = ''):
    """ to get the domain of this request"""

    domain = request.META.get('HTTP_HOST', None)
    if domain is None:
        domain = request.META.get('SERVER_NAME', None)
        if domain is None:
            domain = default_domain
    return domain

class EmitterHttpResponse(HttpResponse):
    """ A custom HttpResponse """

    def __init__(self, emitter):
        HttpResponse.__init__(self, emitter.render())

        headers = emitter.get_headers()
        for key in headers:
            self[key] = headers[key]
