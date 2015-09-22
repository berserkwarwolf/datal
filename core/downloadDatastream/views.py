from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.conf import settings

from core.models import DataStream
from core.daos.datastreams import DataStreamDBDAO
from core.lib.datastore import *


@require_http_methods(["GET"])
def download(request, id, slug):
    """ download internal dataset file """
    try:
        datastreamrevision_id = DataStream.objects.get(pk=id).last_published_revision.id
        datastream = DataStreamDBDAO().get(request.auth_manager.language, datastream_revision_id=datastreamrevision_id)
    except:
        raise Http404
    else:
        url = active_datastore.build_url(
            request.bucket_name,
            datastream.end_point.replace("file://", ""),
            {'response-content-disposition': 'attachment; filename={0}'.format(datastream.filename.encode('utf-8'))}
        )

        content_type = settings.CONTENT_TYPES.get(settings.IMPL_TYPES.get(datastream.impl_type))
        redirect = HttpResponse(status=302, mimetype=content_type)
        redirect['Location'] = url

        return redirect
