from django.core.management.base import BaseCommand

from core.models import DataStreamRevision, DatasetRevision, VisualizationRevision
from core.lifecycle.datasets import DatasetLifeCycleManager
from core.lifecycle.datastreams import DatastreamLifeCycleManager
from core.lifecycle.visualizations import VisualizationLifeCycleManager
from core.choices import ActionStreams


class Command(BaseCommand):
    help = "Crear logs de actividades de datos existentes."

    def handle(self, *args, **options):
        for dataset_rev in DatasetRevision.objects.all():
            lifecycle = DatasetLifeCycleManager(dataset_rev.user, dataset_revision_id=dataset_rev.id)
            lifecycle._log_activity(ActionStreams.CREATE)

        for datastream_rev in DataStreamRevision.objects.all():
            lifecycle = DatastreamLifeCycleManager(datastream_rev.user, datastream_revision_id=datastream_rev.id)
            lifecycle._log_activity(ActionStreams.CREATE)

        #for visualization_rev in VisualizationRevision.objects.all():
        #    lifecycle = VisualizationLifeCycleManager(
        #        visualization_rev.user,
        #        visualization_revision_id=visualization_rev.id
        #    )
        #    lifecycle._log_activity(ActionStreams.CREATE)
