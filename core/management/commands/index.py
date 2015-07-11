from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices
from core.models import Dataset, DatasetRevision, DataStream, DataStreamRevision
from core.lifecycle.datasets import DatasetLifeCycleManager
from core.lifecycle.datasets import DatasetSearchDAOFactory
from core.lifecycle.datastreams import DatastreamSearchDAOFactory


class Command(BaseCommand):
    help = "Index datasets."

    option_list = BaseCommand.option_list + (
        make_option('--re-index',
            action='store_true',
            dest='reindex',
            default=False,
            help='Reindex datasets and datastreams'),
    )

    def handle(self, *args, **options):

        # index resources
        if options['reindex']:

            for datasetrevision in DatasetRevision.objects.filter(status=StatusChoices.PUBLISHED):
                search_dao = DatasetSearchDAOFactory().create(datasetrevision)
                search_dao.add()

#            search_dao = DatastreamSearchDAOFactory().create()
#            for datastreamrevision in DataStreamRevision.objects.filter(status=StatusChoices.PUBLISHED):
#                search_dao.add(datastreamrevision)
