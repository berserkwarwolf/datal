import logging
import urllib

from django.conf import settings
from django.http import Http404
from django.http import HttpResponse
from django.utils.translation import ugettext_lazy
from django.template import loader, Context
from django.views.decorators.http import require_http_methods
from django.views.decorators.clickjacking import xframe_options_exempt

from core.http import get_domain_with_protocol
from core.models import DataStream, Account, DataStreamRevision
from core.helpers import RequestProcessor
from core.decorators import datal_cache_page
from core.choices import ChannelTypes
from core.daos.datastreams import DatastreamHitsDAO, DataStreamDBDAO
from core.shortcuts import render_to_response
from core.lib.datastore import *
from microsites.viewDataStream import forms


def view(request, id, slug):
    logger = logging.getLogger(__name__)

    account = request.account

    preferences = request.preferences

    datastream = DataStreamDBDAO().get(preferences['account_language'], datastream_id=id, published=True)

    """ #TODO this must be at middleware
    # verify if this account is the owner of this viz
    dats = DataStream.objects.get(pk=id)
    if account.id != dats.user.account.id:
        logger.debug('Can\'t show. Not owner [%s|%s]=%s' % (id, str(account.id), str(dats.user.account.id), "Not owner"))
        raise Http404
    """
    url_query = urllib.urlencode(RequestProcessor(request).get_arguments(datastream['parameters']))

    DatastreamHitsDAO(datastream).add(ChannelTypes.WEB)

    notes = datastream['notes']

    return render_to_response('viewDataStream/index.html', locals())

@xframe_options_exempt
def embed(request, guid):
    account = request.account
    preferences = request.preferences
    base_uri = 'http://' + preferences['account_domain']

    try:
        datastream = DataStreamDBDAO().get(
            preferences['account_language'], guid=guid, published=True )
        parameters_query = RequestProcessor(request).get_arguments(datastream.parameters)
    except Http404:
        return render_to_response('viewDataStream/embed404.html', {'settings': settings, 'request': request})

    DatastreamHitsDAO(datastream).add(ChannelTypes.WEB)
    end_point = urllib.urlencode(parameters_query)
    header_row = request.REQUEST.get('header_row', False)
    fixed_column = request.REQUEST.get('fixed_column', False)

    return render_to_response('viewDataStream/embed.html', locals())


@require_http_methods(["GET"])
def download(request, id, slug):
    """ download internal dataset file """
    try:
        datastream = DataStreamDBDAO().get(request.auth_manager.language, datastream_id=id, published=True)
    except:
        raise DataStreamDoesNotExist
    else:
        url = active_datastore.build_url(
            request.bucket_name,
            datastream.end_point.replace("file://", ""),
            {'response-content-disposition': 'attachment; filename={0}'.format(datastream.filename.encode('utf-8'))}
        )

        content_type = settings.CONTENT_TYPES.get(settings.IMPL_TYPES.get(datastream.impl_type))
        redirect = HttpResponse(status=302, mimetype=content_type)
        redirect['Location'] = url

        return redirect
