import urllib

from django.views.decorators.clickjacking import xframe_options_exempt
from django.http import Http404
from django.conf import settings

from core.choices import ChannelTypes
from core.shortcuts import render_to_response
from core.models import DataStreamRevision
from core.daos.datastreams import DatastreamHitsDAO, DataStreamDBDAO
from core.helpers import RequestProcessor


@xframe_options_exempt
def action_embed(request, guid):
    account = request.account
    preferences = request.preferences
    base_uri = 'http://' + preferences['account_domain']

    try:
        datastreamrevision_id = DataStreamRevision.objects.get_last_published_by_guid(guid)
        datastream = DataStreamDBDAO().get(
            preferences['account_language'],
            datastream_revision_id=datastreamrevision_id
        )
        parameters_query = RequestProcessor(request).get_arguments(datastream.parameters)
    except Http404:
        return render_to_response('datastream_manager/embed404.html', {'settings': settings, 'request': request})

    DatastreamHitsDAO(datastream).add(ChannelTypes.WEB)
    end_point = urllib.urlencode(parameters_query)
    header_row = request.REQUEST.get('header_row', False)
    fixed_column = request.REQUEST.get('fixed_column', False)

    return render_to_response('datastream_manager/embed.html', locals())
