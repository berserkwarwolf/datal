# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.template import TemplateDoesNotExist
from workspace.exceptions import *
from workspace.templates import DefaultWorkspaceError
import logging
import sys, traceback

ERROR_KEY = 'error'
DESCRIPTION_KEY = 'message'
EXTRAS_KEY = 'extras'


class ExceptionManager(object):
    """ Middleware for error handling """
    def process_exception(self, request, exception):
        logger = logging.getLogger(__name__)

        exc_info = sys.exc_info()
        trace = '\n'.join(traceback.format_exception(*(exc_info or sys.exc_info())))

        content_type = None
        if request.META.get('CONTENT_TYPE', False):
            content_type = request.META['CONTENT_TYPE']
        elif request.META.get('HTTP_ACCEPT', False):
            content_type = request.META['HTTP_ACCEPT']
        elif request.META.get('HTTP_CONTENT_TYPE', False):
            content_type = request.META['HTTP_CONTENT_TYPE']


        # detect response format
        if content_type.lower().startswith('application/json'):
            template_error_extension = 'json'
            mimetype = 'application/json'
        elif content_type.lower().startswith('multipart/form-data') and request.method == 'POST':
            template_error_extension = 'json'
            mimetype = 'application/json'
        else:  # HTML for all and JSON for JSON requests
            template_error_extension = 'html'
            mimetype = "text/html"

        if hasattr(exception, 'title'):  # detect if it's my type errors
            error_title = exception.title
            error_description = exception.description
            status_code = exception.status_code
            exception_name = type(exception).__name__
            extras = exception.extras
        else:
            status_code = 400
            error_title = str(exception)
            error_description = repr(exception)
            exception_name = 'workspace_error'
            extras = {}

        # (downcase the first letter)
        exception_name = exception_name[:1].lower() + exception_name[1:]
        template1 = "workspace_errors/%s.%s" % (exception_name, template_error_extension)
        template2 = "core_errors/%s.%s" % (exception_name, template_error_extension)
        template3 = "core_errors/core_error.%s" % (template_error_extension)

        templates = [template1, template2, template3]
        for t in templates:
            try:
                tpl = DefaultWorkspaceError(template=t)
                break
            except TemplateDoesNotExist:
                pass


        response = tpl.render(title=error_title, description=error_description, request=request, extras=extras)

        logger.error('%s. %s -extras=%s %s' % ("[CatchError] " + error_title, error_description,
                                                   json.dumps(extras), trace))
        return HttpResponse(response, mimetype=mimetype, status=status_code)

