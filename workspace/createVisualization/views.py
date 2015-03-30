from django.conf import settings
from django.utils.translation import ugettext
from django.http import HttpResponse
from django.http import Http404
from core.shortcuts import render_to_response
from core.auth.decorators import login_required

@login_required
def index(request):

	return render_to_response('createVisualization/index.html', locals())