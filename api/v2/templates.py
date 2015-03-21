# -*- coding: utf-8 -*-
"""
Templates for api
"""
from django.template import Context, Template

class DefaultApiResponse(Template):

    def __init__(self, template="api_response.json"):
        tmpl = "{%% include 'api_response/%s' %%}" % template
        super(DefaultApiResponse, self).__init__(tmpl)

    def render(self, data):
        ctx = Context({"data": data})
        return super(DefaultApiResponse, self).render(ctx)

"""
class DefaultApiError(Template):

    def __init__(self, template="api_errors/api_error.html"):
        tmpl = "{%% include '%s' %%}" % template
        super(DefaultApiError, self).__init__(tmpl)

    def render(self, title, description, extras={}):
        ctx = Context({
                    "error_title": title,
                    "error_description": description,
                    "extras": extras})
        return super(DefaultApiError, self).render(ctx)

"""
