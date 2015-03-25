from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponse
from core.docs import DB
from core.models import DashboardRevision, Dashboard, Account, DashboardHits
from core.reports_manager.helpers import create_report
from core.shortcuts import render_to_response
from core.helpers import slugify, get_domain_with_protocol
from core.choices import ChannelTypes
from django.conf import settings
import sys
from core.communitymanagers import *
from microsites.dashboard_manager.managers import DashboardFinder
import json

def action_view(request, id, slug):

    enable_comments = False
    try:
        account = request.account
        is_free = False
    except AttributeError:
        try:
            account_id = Dashboard.objects.values('user__account_id').get(pk=id)['user__account_id']
            account = Account.objects.get(pk=account_id)
            is_free = True
        except (Dashboard.DoesNotExist), e:
            if settings.DEBUG:
                return HttpResponse("404 - DashBoard no existe", mimetype="text/html")
            else:
                raise Http404
        except (Account.DoesNotExist), e:
            if settings.DEBUG:
                return HttpResponse("404 - La cuenta no existe %s" % account_id, mimetype="text/html")
            else:
                raise Http404

    preferences = request.preferences

    if not is_free:
        base_uri = 'http://' + preferences['account_domain']
    else:
        base_uri = get_domain_with_protocol('microsites')

    try:
        dashboardrevision_id = DashboardRevision.objects.get_last_published_id(id)
        dashboard = DB(dashboardrevision_id = dashboardrevision_id, language = preferences['account_language'], last = False)
    except:
        if settings.DEBUG:
            return HttpResponse("404 - Error con el dashboard %s. <br/><br/>Error: %s " % (str(id), str(sys.exc_info())), mimetype="text/html")
        else:
            raise Http404

    can_export = True
    can_share = False

    create_report(dashboard.dashboard_id, DashboardHits, ChannelTypes.WEB)

    featured_dashboards = request.GET.getlist('ids')
    if len(featured_dashboards) == 0:
        featured_dashboards = json.loads(preferences['account_featured_dashboards'])

        # if the current DB is not in the featured, do not display the featured
        #if str(dashboard.dashboard_id) not in featured_dashboards:
            #featured_dashboards = []
           
    if len(featured_dashboards) > 0:
        try:            
            featured_dashboards = Account.objects.get_featured_dashboards(featured_dashboards, preferences['account_language'], account.id)
        except ValueError:
            featured_dashboards = []

        for fd in featured_dashboards:
            fd['permalink'] = reverse('dashboard_manager.action_view', kwargs={'id': fd['id'], 'slug': slugify(fd['title'])})

    if dashboard.account_id != account.id:
        if settings.DEBUG:
            return HttpResponse("404 - La cuenta del dashboard no esla misma que la actual", mimetype="text/html")
        else:
            raise Http404

    # If we must show the "related dashboards" I load it
    showDashboards = False
    if preferences['account_has_db_sidebar']:
        categoriesWithSidebar = preferences['account_has_db_sidebar'].split(',')
        if str(dashboard.category_id) in categoriesWithSidebar:
            showDashboards = True
            results, search_time, facets = FinderManager(DashboardFinder).search(max_results = 30,
                                                                    order = '1',
                                                                    category_id = dashboard.category_id,
                                                                    account_id = dashboard.account_id,
                                                                    resource = ['db'])
            relatedDashboards =[]
            for dss in results:
                rdactive = str(id) == str(dss["id"])
                relatedDashboards.append({"id": dss["id"], "url": dss["permalink"], "title": dss["title"], "active": rdactive})


    dashboard_dataservices = []

    for dashboard_widget in dashboard.get_widgets():
        widget = dashboard_widget.get()
        dashboard_dataservice = dict(dashboard_dataservice_id=dashboard_widget.id
            , dataservice_id= widget.is_vz() and widget.datastream_id or dashboard_widget.datastream_id
            , sov_id=dashboard_widget.visualization_id
            , sov_revision_id=dashboard_widget.visualizationrevision_id
            , sov_impl_details = widget.is_vz() and widget.impl_details or ''
            , sov_user_id = widget.is_vz() and widget.created_by_nick or ''
            , dataservice_title=widget.title
            , dataservice_description=widget.description
            , dataservice_end_point=dashboard_widget.parameters
            , datasource_end_point=widget.end_point
            , dataservice_qualification=''
            , dataservice_parameters=widget.parameters
            , dataservice_sources= widget.get_sources()
            , user_nick=widget.created_by_nick
            , category_name=widget.category_name
            , dataservice_created_at=widget.created_at
            , permalink=widget.permalink()
            , guid=widget.guid
            , is_self_publishing=widget.is_self_publishing()
            , is_private=False
            , datastreamrevision_id=widget.datastreamrevision_id
            , can_view = True
            , slug = widget.slug
            , datastream_type = widget.datastream_type()
            )
        dashboard_dataservices.append(dashboard_dataservice)

    notes = dashboard.notes

    return render_to_response('dashboard_manager/viewForm.html', locals())
