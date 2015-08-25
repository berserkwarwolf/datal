from core.shortcuts import render_to_response
from core.communitymanagers import *
from core.http import get_domain
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO


def action_sitemap(request):
    import datetime
    logger = logging.getLogger(__name__)

    language = request.auth_manager.language
    account = request.account
    params = request.GET

    domain = get_domain(request)
    now = datetime.datetime.now()
    dss = DataStreamDBDAO().query(account_id=account.id, language=language, filters_dict=dict(status=[3]))
    vss = VisualizationDBDAO().query(account_id=account.id, language=language, filters_dict=dict(status=[3]))

    return render_to_response('sitemap.xml', locals(), mimetype="application/xml")
