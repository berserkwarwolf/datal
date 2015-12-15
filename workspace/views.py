from django.http import HttpResponseRedirect
from core.shortcuts import render_to_response


def scss(request):
    return render_to_response('scss.scss', locals())


def home(request):
    auth_manager = request.auth_manager
    if auth_manager.is_anonymous():
        return HttpResponseRedirect('/signin/')
    else:
        return HttpResponseRedirect('/welcome/')
