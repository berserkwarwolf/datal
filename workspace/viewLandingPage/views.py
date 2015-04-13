from core.auth.decorators import login_required
from core.daos.activity_stream import ActivityStreamDAO
from core.shortcuts import render_to_response

@login_required
def load(request):

    dao = ActivityStreamDAO()
    account_activities = dao.query(request.auth_manager.account_id)

    return render_to_response('viewLandingPage/index.html', locals())
