from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.models import Role, User, Grant


class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--delete',
            action='store_true',
            dest='delete',
            default=False,
            help='Delete selected roles'),

        make_option('--list',
            action='store_true',
            dest='list',
            default=False,
            help='List selected roles'),

        make_option('--codes',
            dest='codes',
            default=[],
            help='Select roles with code given'),

        make_option('--merge',
            dest='merge',
            default=[],
            help='Merge two first role with the second one, separated by commas. Example: --merge=role_code1,role_code2')
    )

    def handle(self, *args, **options):

        if options['merge']:
            try:
                origin = Role.objects.get(code=options['merge'].split(',')[0])
            except:
                self.stderr.write('Role with code {} does not exist.'.format(options['merge'].split(',')[0]))
                exit(1)

            destination = Role.objects.get(code=options['merge'].split(',')[1])
            self.stdout.write('Merging {} in {}'.format(origin, destination))

            origin_grants = Grant.objects.filter(role=origin)

            for grant in origin_grants:
                new_grant, created = Grant.objects.get_or_create(privilege=grant.privilege, role=destination)
                if created:
                    self.stdout.write('Created new Grant with privilege {} in destination'.format(grant.privilege))
                else:
                    self.stdout.write('Grant with privilege {} already in destination'.format(grant.privilege))

        queryset = Role.objects.all()

        if options['codes']:
            queryset = queryset.filter(code__in=options['codes'].split(','))

        for role in queryset:
            if options['list']:
                self.stdout.write('Role {}:\n\tCode: {}\n\tNum of users using it: {}\n\tGrant using it: {}\n\tPrivileges:'.format(
                    role.name,
                    role.code,
                    User.objects.filter(roles__id=role.id).count(),
                    Grant.objects.filter(role=role).count()
                ))

            if options['delete']:

                # Delete Grant with actual role
                for grant in Grant.objects.filter(role=role):
                    self.stdout.write('Deleting Grant ID: {}'.format(grant.id))
                    grant.delete()

                # Remove role from Users
                for user in User.objects.filter(roles=role):
                    self.stdout.write('Removing Role {} from User {}'.format(role, user))
                    user.roles.remove(role)
                    user.save()

                role.delete()
                self.stdout.write('Role deleted!')