from django.shortcuts import *
from django.views.decorators.clickjacking import xframe_options_exempt
from microsites.share_manager.forms import LinkedinForm

@xframe_options_exempt
def action_linkedin(request):

    form = LinkedinForm(request.GET)
    if form.is_valid():
        response = {}
        response['url'] = form.cleaned_data['url']
        response['data_counter'] = form.cleaned_data['data_counter']
        return render_to_response('share_manager/linkedin.html', response)
    else:
        raise Http404