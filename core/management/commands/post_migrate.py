from django.core.management.base import BaseCommand

from optparse import make_option

from core.models import User, Grant, VisualizationRevision

import json

class Command(BaseCommand):

    def handle(self, *args, **options):
        print('FIXING USER GRANTS')

        # TODO: Debemos buscar los usuarios con Roles que no usamos mas y cambiarlos por los nuevos
        # TODO
        for rev in VisualizationRevision.objects.all():
            imp = json.loads(rev.impl_details)
            if 'labelSelection' in imp:
                imp['labelSelection'] = imp['labelSelection'].replace(' ', '')
            if 'latitudSelection' in imp:
                imp['latitudSelection'] = imp['latitudSelection'].replace(' ', '')
            if 'headerSelection' in imp:
                imp['headerSelection']  = imp['headerSelection'] .replace(' ', '') 
            if 'longitudSelection' in imp:
                imp['longitudSelection'] = imp['longitudSelection'].replace(' ', '')
            if 'traceSelection' in imp:
                imp['traceSelection'] = imp['traceSelection'].replace(' ', '')
            rev.impl_details = json.dumps(imp)
            rev.save()
