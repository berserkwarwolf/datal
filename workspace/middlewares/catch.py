    # -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.template import TemplateDoesNotExist
from workspace.exceptions import *
from core.exceptions import DATALException

from django.template import Context, Template
from django.template.loader import select_template
import logging
import sys, traceback

ERROR_KEY = 'error'
DESCRIPTION_KEY = 'message'
EXTRAS_KEY = 'extras'


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
        if content_type.lower().startswith('application/json'):
            return 'application/json'

        if content_type.lower().startswith('multipart/form-data') and request.method == 'POST':
            return 'application/json'

        if content_type.lower().startswith('application/x-www-form-urlencoded') and request.method == 'POST':
            return 'application/json'
        
        return "text/html"

    def is_json(self, mimetype):
        return mimetype == 'application/json'

    """ Middleware for error handling """
    def process_exception(self, request, exception):
        logger = logging.getLogger(__name__)

        extension = 'json' if self.is_json(request) else 'html' 
        templates = ['workspace_error/unexpected_error.%s' % extension]
        
        if isinstance(exception, DATALException):
            templates.append('workspace_errors/%s.%s' % (exception.template, 
                    extension))
            logger.warning('[CatchError] %s. %s' % (exception.title, 
                exception.description))
        else:
            trace = '\n'.join(traceback.format_exception(*(sys.exc_info())))
            logger.error('[UnexpectedCatchError] %s. %s %s' % (
                str(exception), repr(exception), trace))

        tpl = select_template(templates)
        response = tpl.render(Context({'exception':exception}))
        return HttpResponse(response, mimetype=mimetype, status=status_code)

