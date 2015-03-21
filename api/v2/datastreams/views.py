# -*- coding: utf-8 -*-
from junar.core.models import DataStream, DataStreamHits
from junar.api.models import *
#from junar.api.managers import *
from junar.core.choices import ChannelTypes
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from junar.api.exceptions import is_method_get_or_405, Http404, Http400
from junar.api.v2.datastreams import forms
from junar.core.reports_manager.helpers import create_report
from junar.api.http import JSONHttpResponse


@require_http_methods(["GET"])
def action_view(request, guid):
    is_method_get_or_405(request)
    try:
        datastream = DataStream.objects.get(guid=guid)
    except DataStream.DoesNotExist:
        raise Http404("The guid does not exist")

    response = datastream.as_dict(request.user_id)
    add_domain_to_datastream_link(response)

    from junar.api.v2.templates import *
    response = DefaultApiResponse(template='api_resource_view.json').render(response)

    return JSONHttpResponse(response)

@require_http_methods(["GET"])
def action_invoke(request, guid, data_format=None):
    """invoke the datastream data by datastream-GUID"""
    is_method_get_or_405(request)
    form = forms.InvokeForm(request.GET)

    if form.is_valid():
        output = form.cleaned_data['output']
        if not data_format:
            if not output:
                output='json'
        else:
            output = data_format

        page = form.cleaned_data['page']
        offset = form.cleaned_data['offset']
        limit = form.cleaned_data['limit']
        if_modified_since = form.cleaned_data['if_modified_since']
        # get the related datastream (by GUID)
        try:
            datastream = DataStream.objects.get(guid=guid)
        except DataStream.DoesNotExist:
            raise Http404("The guid does not exist")

        # count this HITS (? it's a new DataStreamHits)
        create_report(datastream.id, DataStreamHits, ChannelTypes.API)

        # get the data
        contents, mimetype = datastream.invoke(request, output, request.user_id, page, limit, if_modified_since, offset)
        return HttpResponse(contents, mimetype=mimetype)
    else:
        raise Http400(form.get_error_description())

@require_http_methods(["POST", "PUT", "PATCH"])
def action_update(request):
    """ create or update resource """
    if request.method == 'POST':
        """ it's a new resource """
        #TODO
        pass

    if request.method == 'PUT':
        """ it's for update resource """
        #TODO
        pass

    if request.method == 'PATCH':
        """ it's for update just some fileds on resource """
        #TODO
        pass

    return HttpResponse("Patience")