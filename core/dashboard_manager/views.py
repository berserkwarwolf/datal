from django.http import HttpResponse
from junar.core.emitters import CSVEmitter
from junar.core.engine import invoke
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
    for row_number in response['datastreams']:
        value = response['datastreams'][i]
        datastreamrevision_id = value['id']
        end_point = value['end_point']
        query = {'pId': datastreamrevision_id}
        for k, v in urlparse.parse_qs(end_point).items():
            query[k] = v[0]
        json_response, type = invoke(query)
        loaded_json = json.loads(json_response)
        csv_emitter = CSVEmitter(loaded_json, name = u'')
        csvfile += str(csv_emitter.render()) + '\n\n\n\n\n\n'
        i = i + 1

    filename = '%s.csv' % (dashboard_name)
    response = HttpResponse(mimetype='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename
    response.write(csvfile)

    return response
