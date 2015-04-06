import hashlib
from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.models import User, DataStreamRevision, DataStream, Dataset, DatasetRevision, Visualization, \
    VisualizationRevision


class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--delete',
            action='store_true',
            dest='delete',
            default=False,
            help='Delete selected roles'),

        make_option('--usernames',
            dest='usernames',
            default=[],
            help='Select users with usernames given'),

        make_option('--new-password',
            dest='new_password',
            default='',
            help='Bulk change user password'),

        make_option('--send-to',
            dest='send_to',
            default='',
            help='Assign dependencies to user given ')
    )

    def handle(self, *args, **options):

        queryset = User.objects.all()

        if options['usernames']:
            queryset = queryset.filter(nick__in=options['usernames'].split(','))

        for user in queryset:
            self.stdout.write('User {}:\n\tName: {}\n\tEmail: {}\n\tBelongs to account: {}\n\tRoles:\n'.format(
                user.nick, user.name, user.email, user.account))

            for role in user.roles.all():
                self.stdout.write('\t\t{}\n'.format(role))

            if options['new_password']:
                user.password = hashlib.md5(options['new_password']).hexdigest()
                user.save()
                self.stdout.write('Password changed!\n\n')

            # Assign to a new user
            new_user = None
            if options['send_to']:
                try:
                    new_user = User.objects.get(nick=options['send_to'])
                except:
                    raise CommandError('User with nick {} can not be found.'.format(options['send_to']))

                for datastream_revision in DataStreamRevision.objects.filter(user=user):
                    if new_user:
                        datastream_revision.user = new_user
                        datastream_revision.save()
                    else:
                        raise CommandError('User has Datastreams associated. Please provide and --send-to.')

                for datastream in DataStream.objects.filter(user=user):
                    if new_user:
                        datastream.user = new_user
                        datastream.save()
                    else:
                        raise CommandError('User has datastream associated. Please provide and --send-to.')

                for datastream in DataStream.objects.filter(user=user):
                    if new_user:
                        datastream.user = new_user
                        datastream.save()
                    else:
                        raise CommandError('User has datastream associated. Please provide and --send-to.')

                for dataset in Dataset.objects.filter(user=user):
                    if new_user:
                        dataset.user = new_user
                        dataset.save()
                    else:
                        raise CommandError('User has dataset associated. Please provide and --send-to.')

                for datasetrevision in DatasetRevision.objects.filter(user=user):
                    if new_user:
                        datasetrevision.user = new_user
                        datasetrevision.save()
                    else:
                        raise CommandError('User has datasetrevision associated. Please provide and --send-to.')

                for visualization in Visualization.objects.filter(user=user):
                    if new_user:
                        visualization.user = new_user
                        visualization.save()
                    else:
                        raise CommandError('User has visualization associated. Please provide and --send-to.')

                for visualizationrevision in VisualizationRevision.objects.filter(user=user):
                    if new_user:
                        visualizationrevision.user = new_user
                        visualizationrevision.save()
                    else:
                        raise CommandError('User has visualizationrevision associated. Please provide and --send-to.')


            if options['delete']:
                user.delete()
                self.stdout.write('User deleted!\n\n')
