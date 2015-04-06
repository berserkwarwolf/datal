from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.models import Role


class Command(BaseCommand):
    def handle(self, *args, **options):

        queryset = Role.objects.all()

        for role in queryset:
            self.stdout.write('Role {}:\n\tCode: {}\n\tGrants:'.format(role.name, role.code))
            for grant in role.grants.all():
                self.stdout.write('\t\t{}\n'.format(grant))