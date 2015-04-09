from core.auth.decorators import login_required
from core.daos import ActivityStreamDAO
from core.shortcuts import render_to_response
from workspace.decorators import require_user_stats

@login_required
@require_user_stats
def load(request):

    my_total_datasets = request.my_total_datasets
    my_total_datastreams = request.my_total_datastreams
    my_total_dashboards = request.my_total_dashboards
    my_total_visualizations = request.my_total_visualizations

    max_resource = max( [ my_total_datasets, my_total_datastreams, my_total_dashboards, my_total_visualizations ] )

    my_total_perc_datasets=calc_resource_perc(my_total_datasets, max_resource)
    my_total_perc_datastreams=calc_resource_perc(my_total_datastreams, max_resource)
    my_total_perc_dashboards=calc_resource_perc(my_total_dashboards, max_resource)
    my_total_perc_visualizations=calc_resource_perc(my_total_visualizations, max_resource)

    dao = ActivityStreamDAO()
    account_activities = dao.query(request.auth_manager.account_id)
    
    return render_to_response('viewLandingPage/index.html', locals())


def calc_resource_perc(my_total_resource,max_resource):
    perc = lambda a, b: b > 0 and float(a)/float(b) or 0
    result = perc(my_total_resource, max_resource) * 100
    return result
