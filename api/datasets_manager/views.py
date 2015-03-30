from core.models import *
from api.http import JSONHttpResponse
from api.exceptions import Http400
from api.datasets_manager import forms
from core.cache import Cache
import json

def action_refresh(request):
    """ refresh cache from related datastreams """

    form = forms.RefreshForm(request.GET)
    if form.is_valid():
        dataset_id = form.cleaned_data.get('dataset_id')
        end_point = form.cleaned_data.get('end_point')

        if dataset_id:
            qset = DataStreamRevision.objects.filter(dataset = dataset_id)
            datastream_revision_ids = qset.values_list('id')
        elif end_point:
            qset = DataStreamRevision.objects.filter(dataset__datasetrevision__end_point = end_point)
            datastream_revision_ids = qset.values_list('id')

        if not len(datastream_revision_ids):
            response = {'status': 'Not Found', 'message': 'We could not find related data views'}
            return JSONHttpResponse(json.dumps(response))

        c = Cache()
        for datastream_revision_id in datastream_revision_ids:
            datastream_revision_id = datastream_revision_id[0]
            c.delete(datastream_revision_id)
            # if the datastream has parameters
            keys = c.keys(str(datastream_revision_id) + '::*')
            for key in keys:
                c.delete(key)
        response = {'status': 'OK'}
        return JSONHttpResponse(json.dumps(response))
    else:
        raise Http400('dataset_id or end_point must be sent')
