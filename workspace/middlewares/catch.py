    # -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.template import TemplateDoesNotExist
from workspace.exceptions import *
from core.exceptions import DATALException, UnkownException

from django.template import Context, Template
from django.template.loader import get_template
import logging
import sys, traceback

ERROR_KEY = 'error'
DESCRIPTION_KEY = 'message'
EXTRAS_KEY = 'extras'


logger = logging.getLogger(__name__)

class ExceptionManager(object):

    def get_content_type(self, request):
        content_type = None
        if request.META.get('CONTENT_TYPE', False):
            content_type = request.META['CONTENT_TYPE']
        elif request.META.get('HTTP_ACCEPT', False):
            content_type = request.META['HTTP_ACCEPT']
        elif request.META.get('HTTP_CONTENT_TYPE', False):
            content_type = request.META['HTTP_CONTENT_TYPE']
        return content_type

    def get_mime_type(self, request):
        content_type = self.get_content_type(request)
        if content_type.lower().startswith('application/json'):
            return 'application/json'

        if content_type.lower().startswith('multipart/form-data') and request.method == 'POST':
            return 'application/json'

        if content_type.lower().startswith('application/x-www-form-urlencoded') and request.method == 'POST':
            return 'application/json'

        return "text/html"

    def is_json(self, mimetype):
        return mimetype == 'application/json'

    def get_trace():
        return '\n'.join(traceback.format_exception(*(sys.exc_info())))

    def log_error(self, exception):
        logger.error('[UnexpectedCatchError] %s. %s %s' % (
                str(exception), repr(exception), self.get_trace()))

    """ Middleware for error handling """
    def process_exception(self, request, exception):

        if not hasattr(request, 'user') or not request.user:
            self.log_error(exception)
            raise

        mimetype = self.get_mime_type(request)
        extension = 'json' if self.is_json(mimetype) else 'html' 

        if not isinstance(exception, DATALException):
            if extension == 'json':
                exception = UnkownException(str(exception.__class__.__name__),
                    self.get_trace())
            else:
                self.log_error(exception)
                raise

        template = 'workspace_errors/%s.%s' % (exception.template, extension)
        logger.warning('[CatchError] %s. %s' % (exception.title, 
            exception.description))
        tpl = get_template(template)
        context = Context({
            "exception":exception,
            "auth_manager": request.auth_manager
        })
        response = tpl.render(context)
        return HttpResponse(response, mimetype=mimetype, status=exception.status_code)
