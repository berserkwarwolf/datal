from core.shortcuts import render_to_response

"""def receiver(request):
    if request.user.is_anonymous:
        session_id = request.GET.get('sessionid')
        if session_id:
            try:
                session = Session.objects.get(pk=session_id)
                cur_session = Session.objects.get(pk=request.COOKIES['sessionid'])
                cur_session.session_data = session.session_data
                cur_session.save()
            except:
                pass
    return HttpResponse('')"""


def action500(request):
    return render_to_response('500.html', locals())

def action404(request):
    return render_to_response('404.html', locals())
