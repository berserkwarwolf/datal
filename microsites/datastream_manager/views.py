import urllib, logging
from django.conf import settings
from django.http import Http404, HttpResponse
from django.core.urlresolvers import reverse
from django.views.decorators.clickjacking import xframe_options_exempt

from core.choices import ChannelTypes
from core.daos.datastreams import DataStreamDBDAO
from core.helpers import RequestProcessor, get_domain_with_protocol
from core.models import DataStreamRevision, DataStreamHits, DataStream, Account
from core.shortcuts import render_to_response
from core.daos.datastreams import DatastreamHitsDAO
from core.helpers import set_dataset_impl_type_nice


def action_view(request, id, slug):
    DOC_API_URL = settings.DOC_API_URL
    logger = logging.getLogger(__name__)

    try:
        account = request.account
        is_free = False
    except AttributeError:
        try:
            account_id = DataStream.objects.values('user__account_id').get(pk=id)['user__account_id']
            account = Account.objects.get(pk=account_id)
            is_free = True
        except (DataStream.DoesNotExist, Account.DoesNotExist), e:
            logger.debug('Datstream or account doesn\'t exists [%s|%s]=%s' % (str(id), str(account_id), repr(e)))
            raise Http404

    preferences = request.preferences
    if not is_free:
        base_uri = 'http://' + preferences['account_domain']
    else:
        base_uri = get_domain_with_protocol('microsites')

    datastreamrevision_id = DataStreamRevision.objects.get_last_published_id(id)

    datastream = DS(datastreamrevision_id, preferences['account_language'])
    impl_type_nice = set_dataset_impl_type_nice(datastream.impl_type).replace('/',' ')

    """ #TODO this must be at middleware
    # verify if this account is the owner of this viz
    dats = DataStream.objects.get(pk=id)
    if account.id != dats.user.account.id:
        logger.debug('Can\'t show. Not owner [%s|%s]=%s' % (id, str(account.id), str(dats.user.account.id), "Not owner"))
        raise Http404
    """
    url_query = urllib.urlencode(RequestProcessor(request).get_arguments(datastream.parameters))

    can_download    = preferences['account_dataset_download'] == 'on' or preferences['account_dataset_download'] or preferences['account_dataset_download'] == 'True'
    can_export      = True
    can_share       = False

    DatastreamHitsDAO(datastream).add(ChannelTypes.WEB)

    can_download = preferences['account_dataset_download'] == 'on' or preferences['account_dataset_download'] or preferences['account_dataset_download'] == 'True'
    can_export = True
    can_share = False

    DataStreamDBDAO().hit(id, ChannelTypes.WEB)
    notes = datastream['notes']

    return render_to_response('viewDataStream/index.html', locals())


def action_flexmonster(request, id, slug):
    lang = request.preferences['account_language']
    if lang not in settings.FLEXMONSTER_LOCALES:
        lang = settings.FLEXMONSTER_DEFAULT_LOCALE

    url = 'http://' + request.preferences['account_domain'] + reverse('core.datastream_manager.views.action_csv', args=(id, slug))

    query = request.REQUEST.get('query', None)
    if query:
        url = url + '?' + query

    gt = request.GET.copy()
    sep = "?"
    for param in gt:
        if param.find("pArgument") > -1:
            url = url + sep + param + "=" + str(request.GET[param])
            sep = "&"

    xml = """
        <config>
            <dataSource type="CSV">
                <filename>%s</filename>
            </dataSource>
            <params>
                <param name="localSettingsURL">/js_core/libs/flexmonster/localizations/loc-%s.xml</param>
            </params>
            <style>
                <![CDATA[{
                    "fontSize": 11,
                    "backgroundColor": "0xffffff",
                    "color":"0x4D4D4D",
                    "fontFamily": "Arial"
                }]]>
            </style>
        </config>""" % (url, lang)
    return HttpResponse(xml, content_type="text/xhtml+xml")


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
        return render_to_response('datastream_manager/embed404.html',{'settings': settings, 'request' : request})

    DataStreamHitsDAO(datastream).add(ChannelTypes.WEB)
    end_point = urllib.urlencode(parameters_query)
    header_row = request.REQUEST.get('header_row', False)
    fixed_column = request.REQUEST.get('fixed_column', False)

    return render_to_response('datastream_manager/embed.html', locals())
