# -*- coding: utf-8 -*-
"""
Templates for errors
"""

from django.template import Context, Template

class DefaultWorkspaceError(Template):

    def __init__(self, template="workspace_errors/workspace_error.html"):
        tmpl = "{%% include '%s' %%}" % template
        super(DefaultWorkspaceError, self).__init__(tmpl)

    def render(self, title, description, request, extras={}):
        context = {"error_title": title, "error_description": description, "extras": extras, "auth_manager": request.auth_manager}
        ctx = Context(context)
        return super(DefaultWorkspaceError, self).render(ctx)

class DefaultDataViewEdit(Template):

    def __init__(self, template="datastream_edit_response.json"):
        tmpl = "{%% include '%s' %%}" % template
        super(DefaultDataViewEdit, self).__init__(tmpl)

    def render(self, categories,status,allowed_status ,datastream_life, datastream_dict ):
        ctx = Context({"categories":categories,"status":status,"allowed_status": allowed_status, "datastream_life":datastream_life,"datastream_dict":datastream_dict })
        return super(DefaultDataViewEdit, self).render(ctx)


class DatasetList(Template):

    def __init__(self, template="manageDatasets/dataset_list.json"):
        tmpl = "{%% include '%s' %%}" % template
        super(DatasetList, self).__init__(tmpl)

    def render(self, data):
        ctx = Context({"data": data})
        return super(DatasetList, self).render(ctx)

class DatastreamList(Template):

    def __init__(self, template="manageDataviews/datastream_list.json"):
        tmpl = "{%% include '%s' %%}" % template
        super(DatastreamList, self).__init__(tmpl)

    def render(self, data):
        ctx = Context({"data": data})
        return super(DatastreamList, self).render(ctx)