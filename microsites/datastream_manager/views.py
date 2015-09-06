# -*- coding: utf-8 -*-

import urllib
import logging
from django.conf import settings
from django.http import Http404, HttpResponse
from django.core.urlresolvers import reverse
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.translation import ugettext_lazy
from django.template import loader, Context

from core.choices import ChannelTypes
from core.helpers import RequestProcessor
from core.models import DataStreamRevision, DataStream, Visualization
from core.shortcuts import render_to_response
from core.daos.datastreams import DatastreamHitsDAO, DataStreamDBDAO


def action_flexmonster(request, id, slug):
    lang = request.preferences['account_language']
    if lang not in settings.FLEXMONSTER_LOCALES:
        lang = settings.FLEXMONSTER_DEFAULT_LOCALE

    url = 'http://' + request.preferences['account_domain'] + reverse('core.exportDataStream.views.action_csv', args=(id, slug))

    query = request.REQUEST.get('query', None)
    if query:
        url = url + '?' + query

    gt = request.GET.copy()
    sep = "?"
    for param in gt:
        if param.find("pArgument") > -1:
            url = url + sep + param + "=" + str(request.GET[param])
            sep = "&"

    xml = """
        <config>
            <dataSource type="CSV">
                <filename>%s</filename>
            </dataSource>
            <params>
                <param name="localSettingsURL">/js_core/libs/flexmonster/localizations/loc-%s.xml</param>
            </params>
            <style>
                <![CDATA[{
                    "fontSize": 11,
                    "backgroundColor": "0xffffff",
                    "color":"0x4D4D4D",
                    "fontFamily": "Arial"
                }]]>
            </style>
        </config>""" % (url, lang)
    return HttpResponse(xml, content_type="text/xhtml+xml")


@xframe_options_exempt
def action_embed(request, guid):
    account = request.account
    preferences = request.preferences
    base_uri = 'http://' + preferences['account_domain']

    try:
        datastreamrevision_id = DataStreamRevision.objects.get_last_published_by_guid(guid)
        datastream = DataStreamDBDAO().get(
            preferences['account_language'],
            datastream_revision_id=datastreamrevision_id
        )
        parameters_query = RequestProcessor(request).get_arguments(datastream.parameters)
    except Http404:
        return render_to_response('datastream_manager/embed404.html',{'settings': settings, 'request' : request})

    DatastreamHitsDAO(datastream).add(ChannelTypes.WEB)
    end_point = urllib.urlencode(parameters_query)
    header_row = request.REQUEST.get('header_row', False)
    fixed_column = request.REQUEST.get('fixed_column', False)

    return render_to_response('datastream_manager/embed.html', locals())


def hits_stats(request, id, channel_type=None):
    """ hits stats for chart datastreams """
    
    try:
        ds = DataStream.objects.get(pk=int(id))
    except Visualization.DoesNotExist:
        raise Http404

    dao = DatastreamHitsDAO(ds)
    hits = dao.count_by_days(30, channel_type)
    field_names = [unicode(ugettext_lazy('REPORT-CHART-DATE')),unicode(ugettext_lazy('REPORT-CHART-TOTAL_HITS'))]
    t = loader.get_template('datastream_manager/hits_stats.json')
    c = Context({'data': list(hits), 'field_names': field_names, "request": request, "cache": dao.from_cache})
    return HttpResponse(t.render(c), content_type="application/json")

