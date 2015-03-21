from junar.core.bigdata import Bigdata
from junar.core.templates import DataStreamOutputBigDataTemplate, MintTemplateResponse
from junar.api.models import *
import urllib2
from junar.api.helpers import get_domain
from junar.api.exceptions import MintTemplateURLError, MintTemplateNotFoundError
from junar.api.exceptions import BigdataNamespaceNotDefined
from django.shortcuts import get_object_or_404

def _get_logger():
    return logging.getLogger(__name__)
    
def mint_process(mint_request):
    """
    process a datastream revision through a RDF template and insert it on bigdata server
    end_point is the URL to the RDF template
    """
    logger = _get_logger()

    # nice (?) way to use dot notation for dictionaries
    request = type('lamdbaobject', (object,), mint_request)()

    datastream = get_object_or_404(DataStream, guid=request.guid)

    # Obtain the namespace preference for this account.
    namespace = request.namespace
    if not namespace:
        namespace = Account.objects.get(pk=request.account_id).get_preference('account.bigdata.namespace')

    # If namespace was not defined, raise an exception.
    if not namespace:
        raise BigdataNamespaceNotDefined()

    datastreamrevision_id = DataStreamRevision.objects.get_last_published_id(datastream.id)

    query = datastream.get_query(datastreamrevision_id, request, is_turtle=0)
    contents, mimetype = engine.invoke(query)

    # read the template
    template = None
    if request.end_point:
        try:
            # get the ttl file
            template_file = urllib2.urlopen(request.end_point)
            if template_file:
                status_code = template_file.getcode()
                if status_code == 200:
                    template = template_file.read()
                else:
                    template_file.close()
                    raise MintTemplateURLError("Error reading template %s" % str(status_code))

                template_file.close()

        except Exception, e:
            logger.error(e)
            raise MintTemplateURLError("Unexpected error reading template. %s" % e.reason)


        DataStreamRevision.objects.filter(pk = datastreamrevision_id).update(rdf_template = template)

    else: # try to read the template
        dsrs = DataStreamRevision.objects.filter(pk = datastreamrevision_id).values("rdf_template")
        template = dsrs[0]["rdf_template"]
        if not template:
            raise MintTemplateNotFoundError("We can't find any template for this datastream revision. %s" % str(dsrs[0]) )

    try:
        t = DataStreamOutputBigDataTemplate(template)
        body = t.render(contents, request)

        # If I don't need validation on BigData we can return the final RDF here.
        if not request.validate:
            return MintTemplateResponse().render(body, template, "It's just a validation. Nothing was send to the BigData Server'", "NO PROCESS. Just validation", "")

        if body == False:
            return MintTemplateResponse().render("NO RDF PROCESS", template, "Error rendering template [%s], NOT A RDF ERROR" % t.render_errors, "FAIL", "Probably filter problem")

        context = get_domain(request.account_id) + '/%s' % request.guid
        b = Bigdata()
        response = b.insert(body, namespace, context, create_if_not_exists=True)
        result = "OK" if b.lastError == "" else "FAIL"

        if b.lastError == "":
            result = "OK"
            response = "OK %s" % response.replace("<","[").replace(">","]")
            fail_type = ""
        else:
            result = "FAIL"
            fail_type = "RDF process problem"

        html_result = MintTemplateResponse().render(body, template, response, result, fail_type)
    except Exception, e:
        logger.error(e)
        raise e

    return html_result
