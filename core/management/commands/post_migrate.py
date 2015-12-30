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
            if 'labelSelection' in imp['chart']:
                header = imp['chart']['labelSelection'].replace(' ', '')
                answer = []
                for mh in header.split(','):
                    if ':' not in mh:
                        answer.append("%s:%s" % (mh, mh))
                    else:
                        answer.append(mh)
                imp['chart']['labelSelection'] = ','.join(answer)
            if 'latitudSelection' in imp['chart']:
                imp['chart']['latitudSelection'] = imp['chart']['latitudSelection'].replace(' ', '')
            if 'headerSelection' in imp['chart']:
                header = imp['chart']['headerSelection'].replace(' ', '')
                answer = []
                for mh in header.split(','):
                    if ':' not in mh:
                        answer.append("%s:%s" % (mh, mh))
                    else:
                        answer.append(mh)
                imp['chart']['headerSelection'] = ','.join(answer)
            if 'longitudSelection' in imp['chart']:
                imp['chart']['longitudSelection'] = imp['chart']['longitudSelection'].replace(' ', '')
            if 'traceSelection' in imp['chart']:
                imp['chart']['traceSelection'] = imp['chart']['traceSelection'].replace(' ', '')

            renames=( ("zoomLevel", "zoom"),
                ("mapCenter","center"),
            )
            for rename in renames:
                if rename[0] in imp['chart']:
                    imp['chart'][rename[1]]=imp['chart'][rename[0]]
                    imp['chart'].pop(rename[0])
            rev.impl_details = json.dumps(imp)
            rev.save()
