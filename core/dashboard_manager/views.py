from django.http import HttpResponse
from core.emitters import CSVEmitter
from core.v8.factories import AbstractCommandFactory
import json
import urlparse

def action_csv(request):

    json_val          = None
    csvfile           = ""
    dashboard_name    = None

    json_val = request.REQUEST.get('json')
    response = json.loads(json_val)
    dashboard_name = response['name'].replace(' ', '_').encode('utf-8', 'ignore')

    csvfile += dashboard_name +',,,\n\n'

    i = 0
    command_factory = AbstractCommandFactory().create()
    for row_number in response['datastreams']:
        value = response['datastreams'][i]
        datastreamrevision_id = value['id']
        end_point = value['end_point']
        query = {'pId': datastreamrevision_id}
        for k, v in urlparse.parse_qs(end_point).items():
            query[k] = v[0]

        json_response, type = command_factory.create("invoke", query).run()
        loaded_json = json.loads(json_response)
        csv_emitter = CSVEmitter(loaded_json, name = u'')
        csvfile += str(csv_emitter.render()) + '\n\n\n\n\n\n'
        i += 1

    filename = '%s.csv' % (dashboard_name)
    response = HttpResponse(mimetype='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename
    response.write(csvfile)

    return response
