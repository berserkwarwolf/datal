from django.http import HttpResponse
from django.conf import settings

class JSONHttpResponse(HttpResponse):
    """ A custom HttpResponse that handles the headers for our JSON responses """
    #TODO move to CORE
    def __init__(self, content):
        """ Set the headers of the response and assign it a value """
        HttpResponse.__init__(self, content)
        self['Content-Type'] = 'application/json;charset=utf-8'

def get_domain_with_protocol(app, protocol = 'http'):
    return protocol + '://' + settings.DOMAINS[app]