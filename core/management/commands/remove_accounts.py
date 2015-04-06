from django.core.management.base import BaseCommand, CommandError
from django.db.models.deletion import ProtectedError

from optparse import make_option

from core.models import *


class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--dry-run',
            action='store_true',
            dest='dry_run',
            default=False,
            help='Perform a trial run with no changes made'),

        make_option('--just-ids',
            dest='just_ids',
            default=[],
            help='Delete just accounts IDs given'),

        make_option('--exclude-ids',
            dest='exclude_ids',
            default=[],
            help='Delete all accounts except IDs given'),
        )

    def handle(self, *args, **options):

        queryset = Account.objects.all()
        retry = []

        if options['just_ids']:
            queryset = queryset.filter(id__in=options['just_ids'].split(','))

        if options['exclude_ids']:
            queryset = queryset.exclude(id__in=options['exclude_ids'].split(','))

        for account in queryset:

            # Remove users from account
            for user in User.objects.filter(account=account):

                # Remove Visualization
                for visualization in Visualization.objects.filter(user=user):

                    # Remove VisualizationHits
                    for visualizationhits in VisualizationHits.objects.filter(visualization=visualization):
                        self.stdout.write('VisualizationHits ID {} removed.'.format(visualizationhits.id))

                        if not options['dry_run']:
                            visualizationhits.delete()

                    # Remove ObjectGrant
                    for objectgrant in ObjectGrant.objects.filter(visualization=visualization):
                        self.stdout.write('ObjectGrant ID {} removed.'.format(objectgrant.id))

                        if not options['dry_run']:
                            objectgrant.delete()

                    # Remove Log
                    for log in Log.objects.filter(visualization=visualization):
                        self.stdout.write('Log ID {} removed.'.format(log.id))

                        if not options['dry_run']:
                            log.delete()

                    self.stdout.write('Visualization ID {} removed.'.format(visualization.id))

                    if not options['dry_run']:
                        visualization.delete()


                # Remove VisualizationRevision
                for visualizationrevision in VisualizationRevision.objects.filter(user=user):

                    # Remove VisualizationI18n
                    for visualizationi18n in VisualizationI18n.objects.filter(visualization_revision=visualizationrevision):
                        self.stdout.write('VisualizationI18n ID {} removed.'.format(visualizationi18n.id))

                        if not options['dry_run']:
                            visualizationi18n.delete()

                    # Remove TagVisualization
                    for tagvisualization in TagVisualization.objects.filter(visualizationrevision=visualizationrevision):
                        self.stdout.write('TagVisualization ID {} removed.'.format(tagvisualization.id))

                        if not options['dry_run']:
                            tagvisualization.delete()

                    self.stdout.write('VisualizationRevision ID {} removed.'.format(visualizationrevision.id))

                    if not options['dry_run']:
                        visualizationrevision.delete()

                # Remove UserPassTickets
                for userpasstickets in UserPassTickets.objects.filter(user=user):
                    try:
                        self.stdout.write('UserPassTickets {} removed.'.format(userpasstickets.type))
                    except:
                        self.stdout.write('UserPassTickets ID {} removed.'.format(userpasstickets.id))

                    if not options['dry_run']:
                        userpasstickets.delete()

                # Remove DashboardComment
                for dashboardcomment in DashboardComment.objects.filter(user=user):
                    self.stdout.write('DashboardComment ID {} removed.'.format(dashboardcomment.id))

                    if not options['dry_run']:
                        dashboardcomment.delete()


                # Remove DataStreamComment
                for datastreamcomment in DataStreamComment.objects.filter(user=user):
                    self.stdout.write('DataStreamComment ID {} removed.'.format(datastreamcomment.id))

                    if not options['dry_run']:
                        datastreamcomment.delete()

                # Remove Dataset
                for dataset in Dataset.objects.filter(user=user):
                    self.stdout.write('Dataset ID {} removed.'.format(dataset.id))

                    if not options['dry_run']:
                        dataset.delete()

                # Remove DatasetRevision
                for datasetrevision in DatasetRevision.objects.filter(user=user):

                    # Remove SourceDataset
                    for sourcedataset in SourceDataset.objects.filter(datasetrevision=datasetrevision):
                        self.stdout.write('SourceDataset ID {} removed.'.format(sourcedataset.id))

                        if not options['dry_run']:
                            sourcedataset.delete()

                    # Remove DatasetI18n
                    for dataseti18n in DatasetI18n.objects.filter(dataset_revision=datasetrevision):
                        self.stdout.write('DatasetI18n ID {} removed.'.format(dataseti18n.id))

                        if not options['dry_run']:
                            dataseti18n.delete()

                    # Remove TagDataset
                    for tagdataset in TagDataset.objects.filter(datasetrevision=datasetrevision):
                        self.stdout.write('TagDataset ID {} removed.'.format(tagdataset.id))

                        if not options['dry_run']:
                            tagdataset.delete()


                    self.stdout.write('DatasetRevision ID {} removed.'.format(datasetrevision.id))

                    if not options['dry_run']:
                        datasetrevision.delete()

                # Remove DataStream
                for datastream in DataStream.objects.filter(user=user):

                    # Remove Log
                    for log in Log.objects.filter(datastream=datastream):
                        self.stdout.write('Log ID {} removed.'.format(log.id))

                        if not options['dry_run']:
                            log.delete()

                    # Remove DataStreamHits
                    for dataStreamhits in DataStreamHits.objects.filter(datastream=datastream):
                        self.stdout.write('DataStreamHits ID {} removed.'.format(dataStreamhits.id))

                        if not options['dry_run']:
                            dataStreamhits.delete()

                    # Remove ObjectGrant
                    for objectgrant in ObjectGrant.objects.filter(datastream=datastream):
                        self.stdout.write('ObjectGrant ID {} removed.'.format(objectgrant.id))

                        if not options['dry_run']:
                            objectgrant.delete()

                    # Remove DataStreamRank
                    for datastreamrank in DataStreamRank.objects.filter(datastream=datastream):
                        self.stdout.write('DataStreamRank ID {} removed.'.format(datastreamrank.id))

                        if not options['dry_run']:
                            datastreamrank.delete()

                    self.stdout.write('DataStream ID {} removed.'.format(datastream.id))

                    if not options['dry_run']:
                        datastream.delete()

                # Remove DataStreamRevision
                for datastreamrevision in DataStreamRevision.objects.filter(user=user):

                    # Remove SourceDatastream
                    for sourcedatastream in SourceDatastream.objects.filter(datastreamrevision=datastreamrevision):
                        self.stdout.write('SourceDatastream ID {} removed.'.format(sourcedatastream.id))

                        if not options['dry_run']:
                            sourcedatastream.delete()

                    # Remove TagDatastream
                    for tagdatastream in TagDatastream.objects.filter(datastreamrevision=datastreamrevision):
                        self.stdout.write('TagDatastream ID {} removed.'.format(tagdatastream.id))

                        if not options['dry_run']:
                            tagdatastream.delete()

                    # Remove DataStreamParameter
                    for datastreamparameter in DataStreamParameter.objects.filter(datastream_revision=datastreamrevision):
                        self.stdout.write('DataStreamParameter ID {} removed.'.format(datastreamparameter.id))

                        if not options['dry_run']:
                            datastreamparameter.delete()

                    self.stdout.write('DataStreamRevision ID {} removed.'.format(datastreamrevision.id))

                    if not options['dry_run']:
                        datastreamrevision.delete()

                    # Remove DatastreamI18n
                    for datastreami18n in DatastreamI18n.objects.filter(datastream_revision=datastreamrevision):
                        self.stdout.write('DatastreamI18n ID {} removed.'.format(datastreami18n.id))

                        if not options['dry_run']:
                            datastreami18n.delete()

                # Remove Dashboard
                for dashboard in Dashboard.objects.filter(user=user):

                    # Remove DashboardHits
                    for dashboardhits in DashboardHits.objects.filter(dashboard=dashboard):
                        self.stdout.write('DashboardHits ID {} removed.'.format(dashboardhits.id))

                        if not options['dry_run']:
                            dashboardhits.delete()

                    # Remove ObjectGrant
                    for objectgrant in ObjectGrant.objects.filter(dashboard=dashboard):
                        self.stdout.write('ObjectGrant ID {} removed.'.format(objectgrant.id))

                        if not options['dry_run']:
                            objectgrant.delete()

                    # Remove DashboardRank
                    for dashboardrank in DashboardRank.objects.filter(dashboard=dashboard):
                        self.stdout.write('DashboardRank ID {} removed.'.format(dashboardrank.id))

                        if not options['dry_run']:
                            dashboardrank.delete()

                    # Remove Log
                    for log in Log.objects.filter(dashboard=dashboard):
                        self.stdout.write('Log ID {} removed.'.format(log.id))

                        if not options['dry_run']:
                            log.delete()

                    self.stdout.write('Dashboard ID {} removed.'.format(dashboard.id))

                    if not options['dry_run']:
                        dashboard.delete()

                # Remove DashboardRevision
                for dashboardrevision in DashboardRevision.objects.filter(user=user):

                    # Remove DashboardI18n
                    for dashboardi18n in DashboardI18n.objects.filter(dashboard_revision=dashboardrevision):
                        self.stdout.write('DashboardI18n ID {} removed.'.format(dashboardi18n.id))

                        if not options['dry_run']:
                            dashboardi18n.delete()

                    # Remove TagDashboard
                    for tagdashboard in TagDashboard.objects.filter(dashboardrevision=dashboardrevision):
                        self.stdout.write('TagDashboard ID {} removed.'.format(tagdashboard.id))

                        if not options['dry_run']:
                            tagdashboard.delete()

                    # Remove DashboardWidget
                    for dashboardwidget in DashboardWidget.objects.filter(dashboard_revision=dashboardrevision):
                        self.stdout.write('DashboardWidget ID {} removed.'.format(dashboardwidget.id))

                        if not options['dry_run']:
                            dashboardwidget.delete()

                    self.stdout.write('DashboardRevision ID {} removed.'.format(dashboardrevision.id))

                    if not options['dry_run']:
                        dashboardrevision.delete()

                # Remove Log
                for log in Log.objects.filter(user=user):
                    self.stdout.write('Log ID {} removed.'.format(log.id))

                    if not options['dry_run']:
                        log.delete()

                # Remove Grant
                for grant in Grant.objects.filter(user=user):
                    self.stdout.write('Grant ID {} removed.'.format(grant.id))

                    if not options['dry_run']:
                        grant.delete()

                try:
                    self.stdout.write('User {} removed.'.format(user.name))
                except:
                    self.stdout.write('User ID {} removed.'.format(user.id))

                if not options['dry_run']:
                    user.delete()

            # Remove categories and CategoryI18n from Account
            for category in Category.objects.filter(account=account):
                for categoryi18n in CategoryI18n.objects.filter(category=category):

                    try:
                        self.stdout.write('CategoryI18N {} removed.'.format(categoryi18n.name))
                    except:
                        self.stdout.write('CategoryI18N ID {} removed.'.format(categoryi18n.id))

                    if not options['dry_run']:
                        categoryi18n.delete()

                self.stdout.write('Category ID {} removed.'.format(category.id))

                if not options['dry_run']:
                    category.delete()

            # Remove Thresholds
            for threshold in Threshold.objects.filter(account=account):
                try:
                    self.stdout.write('Thresholds {} removed.'.format(threshold.name))
                except:
                    self.stdout.write('Thresholds ID {} removed.'.format(threshold.id))

                if not options['dry_run']:
                    threshold.delete()


            # Remove Preferences
            for preference in Preference.objects.filter(account=account):
                try:
                    self.stdout.write('Preference {} removed.'.format(preference.key))
                except:
                    self.stdout.write('Preference ID {} removed.'.format(preference.id))

                if not options['dry_run']:
                    preference.delete()


            # Remove Application
            for application in Application.objects.filter(account=account):
                try:
                    self.stdout.write('Application {} removed.'.format(application.key))
                except:
                    self.stdout.write('Application ID {} removed.'.format(application.id))

                if not options['dry_run']:
                    application.delete()

            # Remove Alert
            for alert in Alert.objects.filter(account=account):
                try:
                    self.stdout.write('Alert {} removed.'.format(alert.key))
                except:
                    self.stdout.write('Alert ID {} removed.'.format(alert.id))

                if not options['dry_run']:
                    alert.delete()

            # Remove account
            try:
                self.stdout.write('Account {} removed.'.format(account.name))
            except:
                self.stdout.write('Account ID {} removed.'.format(account.id))

            if not options['dry_run']:
                try:
                    account.delete()
                except ProtectedError:
                    retry.append(account)

        # Remove protected accounts
        for account in retry:
            try:
                self.stdout.write('Retried account {} removed.'.format(account.name))
            except:
                self.stdout.write('Retried account ID {} removed.'.format(account.id))
            account.delete()
