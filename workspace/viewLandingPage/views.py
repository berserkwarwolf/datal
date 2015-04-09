from core.auth.decorators import login_required
from core.daos import ActivityStreamDAO
from core.shortcuts import render_to_response

@login_required
def load(request):

    max_resource = max( [ request.stats['my_total_datasets'],
                          request.stats['my_total_datastreams'],
                          request.stats['my_total_dashboards'],
                          request.stats['my_total_visualizations'] ] )
    perc = lambda a, b: b > 0 and str(float(a)/float(b) * 100).replace(',', '.') or 0
    my_total_perc_datasets=perc(request.stats['my_total_datasets'], max_resource)
    my_total_perc_datastreams=perc(request.stats['my_total_datastreams'], max_resource)
    my_total_perc_dashboards=perc(request.stats['my_total_dashboards'], max_resource)
    my_total_perc_visualizations=perc(request.stats['my_total_visualizations'], max_resource)

    dao = ActivityStreamDAO()
    account_activities = dao.query(request.auth_manager.account_id)

    return render_to_response('viewLandingPage/index.html', locals())
