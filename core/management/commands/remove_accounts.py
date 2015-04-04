from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.models import Account, User, Category, CategoryI18n, Threshold, Preference, Application, UserPassTickets, \
    DashboardComment, DataStreamComment, Alert


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

        if options['just_ids']:
            queryset = queryset.filter(id__in=options['just_ids'].split(','))

        if options['exclude_ids']:
            queryset = queryset.exclude(id__in=options['exclude_ids'].split(','))

        for account in queryset:

            # Remove users from account
            for user in User.objects.filter(account=account):

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
                account.delete()
