from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Count
from django.http import HttpResponse
from django.utils.translation import ugettext_lazy
from core.auth.decorators import login_required
from core.cache import Cache
from core.helpers import Day
from core.models import *
from datetime import date, timedelta, datetime
import json

@login_required
def get_top_10_chart_data(request):
    language = request.auth_manager.language
    account_id = request.auth_manager.account_id
    redis_key = 'reports_top_10_chart_data_' + str(account_id) + '_' + language
    last_90_days = date.today() - timedelta(days=90)

    #Get the top 10 visualizations with most hits
    #Get the top 10 datastreams with most hits
    #Join the lists, sort and keep the top 10
    #For each resource, get the hits per day for the last 90 days
    c = Cache(db=settings.CACHE_DATABASES['resources_stats'])
    second_chart = c.get(redis_key)
    if not second_chart:
        top_10_visualization_hits = VisualizationHits.objects.filter(
            created_at__gte=last_90_days,
            visualization__datastream__datastreamrevision__datastreami18n__language=language,
            visualization__user__account=account_id).annotate(
            hits=Count('visualization__id')).order_by('-hits').values(
            'visualization', 'hits')[:10]
        top_10_datastream_hits = DataStreamHits.objects.filter(
            created_at__gte=last_90_days,
            datastream__datastreamrevision__datastreami18n__language=language,
            datastream__user__account=account_id).annotate(
            hits=Count('datastream__id')).order_by('-hits').values(
            'datastream', 'hits')[:10]

        top_10_datastream_hits.query.group_by = ['datastream_id']
        top_10_visualization_hits.query.group_by = ['visualization_id']

        temp_list = list(top_10_datastream_hits) + list(top_10_visualization_hits)
        final_list = sorted(temp_list, key=lambda k: k['hits'], reverse=True)[:10]

        temp_lines = []
        for item in final_list:
            added = False
            if 'visualization' in item:
                temp_hits = VisualizationHits.objects.filter(
                    created_at__gte=last_90_days,
                    visualization__id=item['visualization']
                    ).annotate(
                    HitDate=Day('created_at')).annotate(
                    hits=Count('visualization__id')).order_by(
                    'HitDate').values_list('HitDate', 'hits')
                temp_hits.query.group_by = ['HitDate']
                try:
                    temp_title = VisualizationRevision.objects.filter(
                        visualization__datastream__datastreamrevision__datastreami18n__language=language,
                        visualization__id=item['visualization']).values_list(
                        'visualization__datastream__datastreamrevision__datastreami18n__title',
                        flat=True)[0] + ' (' + unicode(ugettext_lazy('APP-VISUALIZATION-TEXT')) + ')'
                except IndexError:
                    temp_title = ''
                added = True
            elif 'datastream' in item:
                temp_hits = DataStreamHits.objects.filter(
                    created_at__gte=last_90_days,
                    datastream__id=item['datastream']).annotate(
                    HitDate=Day('created_at')).annotate(
                    hits=Count('datastream__id')).order_by('HitDate').values_list(
                    'HitDate', 'hits')
                temp_hits.query.group_by = ['HitDate']
                try:
                    temp_title = DataStreamRevision.objects.filter(
                        datastreami18n__language=language,
                        datastream__id=item['datastream']).values_list(
                        'datastreami18n__title', flat=True)[0] + ' ('+ unicode(ugettext_lazy('APP-DATASTREAM-TEXT')) + ')'
                except IndexError:
                    temp_title = ''
                added = True
            if added:
                temp_chart = {'line': temp_hits, 'title': temp_title}
                temp_lines.append(temp_chart)

        second_chart = []

        if len(final_list) > 0:
            base = datetime.today()
            second_base = date.today()
            dateList = [ base - timedelta(days=x) for x in range(0, 91) ]

            for i, day in zip(range(0, len(dateList)), dateList):
                new_item = []
                new_item.insert(0, day)
                for i, item in zip(range(0, len(temp_lines)), temp_lines):
                    new_item.insert(i+1, 0)
                second_chart.append(new_item)

            for i, item in zip(range(0, len(temp_lines)), temp_lines):
                for k in range(0, len(list(item['line']))):
                    delta = second_base - item['line'][k][0]
                    second_chart[delta.days][i+1] = item['line'][k][1]


            second_chart.reverse()
            new_item = []
            new_item.insert(0, unicode(ugettext_lazy('REPORT-CHART-DATE')))

            for i, item in zip(range(0, len(temp_lines)), temp_lines):
                new_item.insert(i+1, item['title'])
            second_chart.insert(0, new_item)
            c.set(redis_key, json.dumps(second_chart, cls=DjangoJSONEncoder), 7200)
        else:
            base = datetime.today()
            dateList = [ base - timedelta(days=x) for x in range(0, 91) ]

            for item in dateList:
                new_item = []
                new_item.insert(0, item)
                new_item.insert(1, 0)
                second_chart.insert(0, new_item)

            new_item = []
            new_item.insert(0, unicode(ugettext_lazy('REPORT-CHART-DATE')))
            new_item.insert(1, unicode(ugettext_lazy('REPORT-CHART-NO_DATA')))
            second_chart.insert(0, new_item)


    else:
        second_chart = json.loads(second_chart)
    return HttpResponse(json.dumps({'status': 'ok', 'chart': second_chart}, cls=DjangoJSONEncoder), mimetype='application/json')

@login_required
def get_total_hits_chart_data(request):

    last_90_days = date.today() - timedelta(days=90)
    account_id = request.auth_manager.account_id
    redis_key = 'reports_total_hits_chart_data_' + str(account_id)

    c = Cache(db=settings.CACHE_DATABASES['resources_stats'])
    first_chart = c.get(redis_key)
    if not first_chart:
        total_visualization_hits = VisualizationHits.objects.filter(
            created_at__gte=last_90_days,
            visualization__user__account=account_id).annotate(
            HitDate=Day('created_at')).annotate(
            hits=Count('created_at')).values(
            'HitDate', 'hits')
        total_datastream_hits = DataStreamHits.objects.filter(
            created_at__gte=last_90_days,
            datastream__user__account=account_id).annotate(
            HitDate=Day('created_at')).annotate(
            hits=Count('created_at')).values(
            'HitDate', 'hits')

        total_datastream_hits.query.group_by = ['HitDate']
        total_visualization_hits.query.group_by = ['HitDate']

        first_chart = []
        new_item = []
        new_item.insert(0, unicode(ugettext_lazy('REPORT-CHART-DATE')))
        new_item.insert(1, unicode(ugettext_lazy('REPORT-CHART-TOTAL_HITS')))
        first_chart.append(new_item)

        base = datetime.today()
        dateList = [ base - timedelta(days=x) for x in range(0, 91) ]
        dateList.reverse()


        for day in dateList:
            new_item = []
            new_item.insert(0, day)
            new_item.insert(1, 0)
            for item in list(total_visualization_hits):
                if item['HitDate'] == day.date():
                    new_item[1] = new_item[1] + item['hits']
                    break
            for item in list(total_datastream_hits):
                if item['HitDate'] == day.date():
                    new_item[1] = new_item[1] + item['hits']
                    break
            if new_item[1] != 0:
                first_chart.append(new_item)
        c.set(redis_key, json.dumps(first_chart, cls=DjangoJSONEncoder), 7200)
    else:
        first_chart = json.loads(first_chart)
    return HttpResponse(json.dumps({'status': 'ok', 'chart': first_chart}, cls=DjangoJSONEncoder), mimetype='application/json')

