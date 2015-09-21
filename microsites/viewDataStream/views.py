import logging
import urllib

from django.conf import settings
from django.http import Http404

from core.http import get_domain_with_protocol
from core.utils import set_dataset_impl_type_nice
from core.models import DataStream, Account, DataStreamRevision
from core.helpers import RequestProcessor
from core.choices import ChannelTypes
from core.daos.datastreams import DatastreamHitsDAO, DataStreamDBDAO
from core.shortcuts import render_to_response


def view(request, id, slug):
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

    datastream = DataStreamDBDAO().get(preferences['account_language'], datastream_id=id, published=True)
    impl_type_nice = set_dataset_impl_type_nice(datastream['impl_type']).replace('/',' ')

    """ #TODO this must be at middleware
    # verify if this account is the owner of this viz
    dats = DataStream.objects.get(pk=id)
    if account.id != dats.user.account.id:
        logger.debug('Can\'t show. Not owner [%s|%s]=%s' % (id, str(account.id), str(dats.user.account.id), "Not owner"))
        raise Http404
    """
    url_query = urllib.urlencode(RequestProcessor(request).get_arguments(datastream['parameters']))

    can_download = preferences['account_dataset_download'] == 'on' or preferences['account_dataset_download'] or preferences['account_dataset_download'] == 'True'
    can_export = True
    can_share = False

    DatastreamHitsDAO(datastream).add(ChannelTypes.WEB)

    can_download = preferences['account_dataset_download'] == 'on' or preferences['account_dataset_download'] or preferences['account_dataset_download'] == 'True'
    can_export = True
    can_share = False

    #DataStreamDBDAO().hit(id, ChannelTypes.WEB)
    notes = datastream['notes']

    return render_to_response('viewDataStream/index.html', locals())
