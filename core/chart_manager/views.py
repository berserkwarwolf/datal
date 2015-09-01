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
