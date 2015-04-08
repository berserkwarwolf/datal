import json
import logging
from api.models import *
from api.http import JSONHttpResponse, HttpResponse
from api.managers import *
from api.bigdata_manager import forms
from django.views.decorators.csrf import csrf_exempt
from api.exceptions import BigdataNamespaceNotDefined
from core.tasks import mint_process
from api.decorators import bigdata_cross_namespace_forbidden, public_access_forbidden
from api.exceptions import is_method_get_or_405
from api.helpers import get_domain

@csrf_exempt
@bigdata_cross_namespace_forbidden
def action_mint(request, guid, namespace=None):
    """
    process a datastream revision through a RDF template and insert it on bigdata server
    Don't duplicate, update if exists'
    """
    logger = logging.getLogger(__name__)
#    logger.debug("MINT")

    is_method_get_or_405(request)
    form = forms.MintForm(request.GET)

    if form.is_valid():
        account_id  = request.account_id
        end_point   = form.cleaned_data['end_point']
        # validate means the RDF process on the BigData server or just test and show the final RDF before send
        validate    = bool(int(request.GET.get("validate", 0)))
        
        try:
            mint_request = {"account_id": request.account_id
                ,"owner": request.GET.get("owner", "http://junar.com/cities/")
                ,"publisher": request.GET.get("publisher", "http://junar.com/#us")
                ,"author": request.GET.get("author", "http://junar.com/cities/")
                ,"namespace": namespace
                ,"guid": guid
                ,"validate": validate
                ,"end_point": end_point
                ,"GET":request.GET
                ,"REQUEST": request.REQUEST
                }

            response = mint_process(mint_request) # I can't send full "request" as param because give me a "pickle error". So I send many parameters
            return HttpResponse(response, mimetype="text/html")
        except Exception, e:
            logger.error("Failed inserting mint data: " + unicode(request) + " <-------> " + str(e))
            resp_sync = {"Processing": False, "Errors": str(e), "UrlStatus":"", "Request": unicode(request)}

        return JSONHttpResponse(json.dumps(resp_sync))
    else:
        raise Http400(form.get_error_description())

@csrf_exempt
def action_query(request, guid):
    """
    Do a spqrql query. You'll need a valid auth_key
    output possible values:
    json: returns a valid jspn object (application/sparql-results+json)
    table: a application/x-binary-rdf-results-table result
    xml: application/sparql-results+xml
    csv: (txt/csv)
    tsv: (text/tab-separated-values)
    debug: internal result for develop
    """
    logger = logging.getLogger(__name__)
    account_id = request.account_id

    pselect = request.GET.get("select","select *")
    pfrom = request.GET.get("from","")
    pwhere = request.GET.get("where"," {?s ?p ?o}")
    limit = request.GET.get("limit", 0)
    output = request.GET.get("output", "json")

    context = guid and get_domain(account_id) + '/%s' % guid or ""

    logger.info("SPARQL QUERY [%s-%s-%s] [%s] [%s] [%s]" %(pselect, pfrom, pwhere, output, limit, context))

    # Obtain the namespace preference for this account.
    namespace = Account.objects.get(pk=account_id).get_preference('account.bigdata.namespace')
    # If the preference namespace does not exist, raise an exception.
    if not namespace:
        raise BigdataNamespaceNotDefined()

    b = Bigdata()
    resp = b.query(pselect=pselect, pfrom=pfrom, pwhere=pwhere, namespace=namespace, context=context, output=output, limit=limit)

    if not resp:
        raise Http400(b.lastError)
    else:
        mimetype="text/json"
        if output == "debug" or output == "table":
            mimetype="text/plain"
        if output == "xml":
            mimetype="application/xml"
        if output == "json":
            mimetype="text/json"
        if output == "csv":
            mimetype="text/csv"
        if output == "tsv":
            mimetype = "text/tab-separated-values"
        return HttpResponse(resp, mimetype=mimetype)

def action_delete(request, guid):
    account_id = request.account_id
    namespace = Account.objects.get(pk=account_id).get_preference('account.bigdata.namespace')
    if not namespace:
        raise BigdataNamespaceNotDefined()

    context = get_domain(account_id) + '/%s' % guid
    b = Bigdata()
    r = b.delete_context(namespace=namespace, context=context)
    if r:
        return HttpResponse("OK. " + b.lastError, mimetype="text/html")
    else:
        return HttpResponse("FAIL. " + b.lastError, mimetype="text/html")

@public_access_forbidden
def action_delete_namespace(request, namespace):
    b = Bigdata()
    r = b.delete_namespace(namespace)
    if r:
        return HttpResponse("OK. " + b.lastError, mimetype="text/html")
    else:
        return HttpResponse("FAIL. " + b.lastError, mimetype="text/html")

def action_check_namespace(request, namespace):

    b = Bigdata()
    r = b.check_namespace(namespace)
    if r:
        return HttpResponse(b.lastError, mimetype="application/json")
    else:
        return HttpResponse("<h1>ERROR</h1>" + b.lastError, mimetype="text/html")

def action_check_context(request, guid):
    account_id = request.account_id
    namespace = Account.objects.get(pk=account_id).get_preference('account.bigdata.namespace')
    if not namespace:
        raise BigdataNamespaceNotDefined()

    context = get_domain(account_id) + '/%s' % guid
    b = Bigdata()
    r = b.check_context(namespace, context)
    if r:
        return HttpResponse(b.lastError, mimetype="application/json")
    else:
        return HttpResponse("<h1>ERROR</h1>" + b.lastError, mimetype="text/html")

@public_access_forbidden
def action_create_namespace(request, namespace):
    """creates a new namespace"""

    if not namespace:
        raise BigdataNamespaceNotDefined()

    b = Bigdata()
    r = b.create_namespace(namespace=namespace)
    if r:
        return HttpResponse(b.lastError, mimetype="text/html")

@public_access_forbidden
def action_list_namespaces(request):
    """show all namespaces, maybe we can show nicer"""
    from django.http import HttpResponseRedirect
    url = "%s:%s%s/namespace" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT)
    return HttpResponseRedirect(url)

def action_get_namespace(request, namespace):
    """get all (DUMP) RDF data from given namespace"""

    if not namespace:
        raise BigdataNamespaceNotDefined()

    """show all namespaces, maybe we can show nicer"""
    from django.http import HttpResponseRedirect
    # SHOW PROPERTIES url = "%s:%s%s/namespace/%s/properties" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT, namespace)
    url = "%s:%s%s/namespace/%s/sparql" % (settings.BIGDATA_HOSTS[0], settings.BIGDATA_PORT, settings.BIGDATA_API_ENDPOINT, namespace)
    return HttpResponseRedirect(url)
