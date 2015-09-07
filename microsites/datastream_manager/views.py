# -*- coding: utf-8 -*-
import logging
from django.conf import settings
from django.http import Http404, HttpResponse
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy
from django.template import loader, Context

from core.models import DataStream, Visualization
from core.daos.datastreams import DatastreamHitsDAO


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

