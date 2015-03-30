from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Count
from django.http import HttpResponse
from django.utils.translation import ugettext_lazy
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404, HttpResponsePermanentRedirect
from django.views.decorators.clickjacking import xframe_options_exempt
from core.cache import Cache
from core.helpers import Day
from core.models import *
from datetime import date, timedelta
import json
import urllib

def get_last_30_days_visualization(request, id):
    try:
        int(id)
    except ValueError:
        response = {'status': 'error'}
    else:
        redis_key = 'get_last_30_days_visualization_' + str(id)
        c = Cache(db=0)
        first_chart = c.get(redis_key)
        if not first_chart:
            last_30_days = date.today() - timedelta(days=30)
            total_visualization_hits = VisualizationHits.objects.filter(
                created_at__gte=last_30_days,
                visualization__id=id).annotate(
                date=Day('created_at')).annotate(
                count=Count('created_at')).values(
                'date', 'count')
            total_visualization_hits.query.group_by = ['date']
            first_chart = []
            new_item = []
            new_item.insert(0, unicode(ugettext_lazy('REPORT-CHART-DATE')))
            new_item.insert(1, unicode(ugettext_lazy('REPORT-CHART-TOTAL_HITS')))
            first_chart.append(new_item)
            base = date.today()
            dateList = [ base - timedelta(days=x) for x in range(0, 31) ]
            dateList.reverse()
            for day in dateList:
                new_item = []
                new_item.insert(0, day.isoformat())
                new_item.insert(1, 0)
                for item in list(total_visualization_hits):
                    if item['date'] == day:
                        new_item[1] = new_item[1] + item['count']
                        break
                first_chart.append(new_item)
            c.set(redis_key, json.dumps(first_chart, cls=DjangoJSONEncoder), settings.REDIS_STATS_TTL)
        else:
            first_chart = json.loads(first_chart)

        response = {'status': 'ok', 'chart': first_chart}
    return HttpResponse(json.dumps(response), mimetype='application/json')


@xframe_options_exempt
def action_legacy_embed(request):
    try:
        visualization_id    = int(request.REQUEST['sov_id'])
        height              = request.REQUEST['height']
        width               = request.REQUEST['width']
    except:
        raise Http404

    visualization = get_object_or_404(Visualization, pk = visualization_id)
    url = reverse('chart_manager.action_embed', kwargs={'guid' : visualization.guid}) + '?' + urllib.urlencode({'height': height, 'width': width})

    return HttpResponsePermanentRedirect(url)
