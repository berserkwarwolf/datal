from django.http import HttpResponse, Http404
from django.views.decorators.http import require_http_methods
from junar.core.models import *
from junar.core.docs import DT
from junar.core.lib.datastore import *

import logging

@require_http_methods(["GET"])
def action_download(request, dataset_id, slug):
    """ download dataset file directly """
    logger = logging.getLogger(__name__)

    # get public url for datastream id
    try:
        dataset_revision_id = DatasetRevision.objects.get_last_published_id(dataset_id)
        dataset = DT(dataset_revision_id, request.auth_manager.language)
    except Exception, e:
        logger.info("Can't find the dataset: %s [%s]" % (dataset_id, str(e)))
        raise Http404
    else:
        filename = dataset.filename.encode('utf-8')
        # ensure it's a downloadable file on S3
        if dataset.end_point[:7] != "file://":
            return HttpResponse("No downloadable file!")

        url = active_datastore.build_url(request.bucket_name, dataset.end_point.replace("file://", ""), {'response-content-disposition': 'attachment; filename={0}'.format(filename)})
                
        content_type = settings.CONTENT_TYPES.get(settings.IMPL_TYPES.get(dataset.impl_type))
        redirect = HttpResponse(status=302, mimetype=content_type)
        redirect['Location'] = url

        return redirect