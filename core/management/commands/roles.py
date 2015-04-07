from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.models import Role, User


class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--delete',
            action='store_true',
            dest='delete',
            default=False,
            help='Delete selected roles'),

        make_option('--codes',
            dest='codes',
            default=[],
            help='Select roles with code given')
    )

    def handle(self, *args, **options):

        queryset = Role.objects.all()

        if options['codes']:
            queryset = queryset.filter(code__in=options['codes'].split(','))

        for role in queryset:
            self.stdout.write('Role {}:\n\tCode: {}\n\tNum of users using it: {}\n\tPrivileges:'.format(
                role.name,
                role.code,
                User.objects.filter(roles__id=role.id).count()
            ))

            for grant in role.grants.all():
                self.stdout.write('\t\t{}\n'.format(grant))

            if options['delete']:
                role.delete('DELETED!')