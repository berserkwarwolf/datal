from django.core.management.base import BaseCommand
from django.utils import translation

from core.models import DataStreamRevision, DatasetRevision, VisualizationRevision, DatastreamI18n
from core.lifecycle.datasets import DatasetLifeCycleManager
from core.lifecycle.datastreams import DatastreamLifeCycleManager
from core.lifecycle.visualizations import VisualizationLifeCycleManager
from core.choices import ActionStreams


class Command(BaseCommand):
    help = "Elimino datastreams con cosas huerfanas"

    def handle(self, *args, **options):
        for datastream_rev in DataStreamRevision.objects.all():
            if not DatastreamI18n.objects.filter(datastream_revision=datastream_rev, language=datastream_rev.user.language).count():
                datastream_rev.delete()
