from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.models import Account, User, Category, CategoryI18n, Threshold, Preference, Application, UserPassTickets, \
    DashboardComment, DataStreamComment, Alert


class Command(BaseCommand):
    def handle(self, *args, **options):

        queryset = Account.objects.all()

        for account in queryset:

            # Remove account
            try:
                self.stdout.write('ID {} Account {}.'.format(account.id, account.name))
            except:
                self.stdout.write('ID {} Account {}.'.format(account.id, ''))
