# -*- coding: utf-8 -*-
from django.conf import settings
from django.http import HttpResponse
from workspace.exceptions import *
import logging
ERROR_KEY = 'error'
DESCRIPTION_KEY = 'message'
EXTRAS_KEY = 'extras'


class ExceptionManager(object):
    """ Middleware for error handling """
    def process_exception(self, request, exception):
        logger = logging.getLogger(__name__)

        content_type = None
        if 'CONTENT_TYPE' in request.META:
            content_type = request.META['CONTENT_TYPE']
        elif 'HTTP_CONTENT_TYPE' in request.META:
            content_type = request.META['HTTP_CONTENT_TYPE']

        # HTML for all and JSON for JSON requests
        template_error_extension = 'html' if content_type != 'application/json' else 'json'

        from workspace.templates import DefaultWorkspaceError

        if hasattr(exception, 'info'): # detect if it's my type errors
            error_title = exception.info[ERROR_KEY]
            error_description = exception.info[DESCRIPTION_KEY]

            # template file must be called as the exception class
            exception_name = type(exception).__name__
            # (downcase the first letter)
            exception_name = exception_name[:1].lower() + exception_name[1:]
            template = "workspace_errors/%s.%s" % (exception_name, template_error_extension)
            response = DefaultWorkspaceError(template=template).render(error_title, error_description
                , request, exception.info[EXTRAS_KEY])
        else:
            if settings.DEBUG:
                raise
            else:
                error_title = str(exception)
                error_description = repr(exception)

                # default error
                response = DefaultWorkspaceError().render( "Unexpected Workspace error", "Error. %s (%s)" % (repr(exception), str(exception)))

        logger.error('%s. %s' % ("[EM] " + error_title, error_description))
        return HttpResponse(response, mimetype="text/html")

