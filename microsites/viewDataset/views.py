from junar.core.shortcuts import render_to_response
from junar.core.models import Dataset, DatasetRevision
from junar.core.docs import DT
from junar.microsites.daos import DatasetDAO
from junar.microsites.helpers import set_dataset_impl_type_nice
from django.http import Http404
import logging

def action_view(request, dataset_id, slug):
    """ show dataset """
    logger = logging.getLogger(__name__)
    account = request.account
    preferences = request.preferences
    try:
        dataset_orig = Dataset.objects.get(pk=dataset_id)
    except Dataset.DoesNotExist, DatasetRevision.DoesNotExist:
        logger.error('Datset doesn\'t exists [%s|%s]' % (str(dataset_id), str(account.id)))
        raise Http404
    except Exception, e:
        logger.error('Datset error [%s|%s]=%s' % (str(dataset_id), str(account.id), repr(e)))
        raise Http404

    try:    
        dataset_revision= DatasetRevision.objects.get_last_published(dataset_id)
    except Dataset.DoesNotExist, DatasetRevision.DoesNotExist:
        logger.error('DatsetRevision doesn\'t exists [%s|%s]' % (str(dataset_id), str(account.id)))
        raise Http404
    
    dataset = DT(dataset_revision.id, request.auth_manager.language)
    related_resources = DatasetDAO(resource=dataset_orig).query_related_resources()

    can_download    = preferences['account_dataset_download'] == 'on' or preferences['account_dataset_download'] or preferences['account_dataset_download'] == 'True'
    
    tags = dataset.get_tags()
    sources = dataset.get_sources()
    impl_type_nice = set_dataset_impl_type_nice(dataset_revision.impl_type)
    permalink = 'http://%s%s' % ( preferences['account_domain'], dataset.permalink())
    
    return render_to_response('viewDataset/index.html', locals())
