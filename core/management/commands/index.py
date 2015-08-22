from django.core.management.base import BaseCommand, CommandError

from optparse import make_option
from core.lib.elastic import ElasticsearchIndex

from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices
from core.models import Dataset, DatasetRevision, DataStream, DataStreamRevision
from core.lifecycle.datasets import DatasetLifeCycleManager
from core.lifecycle.datasets import DatasetSearchDAOFactory
from core.lifecycle.datastreams import DatastreamSearchDAOFactory
from core.daos.datastreams import DatastreamHitsDAO


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

            # destruye el index
            ElasticsearchIndex().flush_index()
            es=ElasticsearchIndex()

            for datasetrevision in DatasetRevision.objects.filter(status=StatusChoices.PUBLISHED):
                search_dao = DatasetSearchDAOFactory().create(datasetrevision)
                search_dao.add()

            for datastreamrevision in DataStreamRevision.objects.filter(status=StatusChoices.PUBLISHED):
                search_dao = DatastreamSearchDAOFactory().create(datastreamrevision)
                search_dao.add()
                h=DatastreamHitsDAO(datastreamrevision)

                doc={'docid':"DS::%s" % datastreamrevision.datastream.guid,
                    "type": "ds",
                    "doc":{ "fields":{"hits": h.count()}}}
                try:
                    es.update(doc)
                except:
                    pass
