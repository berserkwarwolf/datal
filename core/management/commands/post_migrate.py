from django.core.management.base import BaseCommand

from optparse import make_option

from core.models import User, Grant


class Command(BaseCommand):

    def handle(self, *args, **options):
        print('FIXING USER GRANTS')

        # TODO: Debemos buscar los usuarios con Roles que no usamos mas y cambiarlos por los nuevos
        # TODO
