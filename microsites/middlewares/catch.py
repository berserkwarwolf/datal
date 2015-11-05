    # -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.template import TemplateDoesNotExist
from microsites.exceptions import *
from core.exceptions import DATALException 
from core.exceptions import ExceptionManager as ExceptionManagerCore

from django.template import Context, Template
from django.template.loader import get_template
import logging
import sys, traceback
from pprint import pprint

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

    def log_error(self, exception):
        logger = logging.getLogger(__name__)
        trace = '\n'.join(traceback.format_exception(*(sys.exc_info())))
        logger.error('[UnexpectedCatchError] %s. %s %s' % (
                str(exception), repr(exception), trace))

    """ Middleware for error handling """
    def process_exception(self, request, exception):
        print exception
        mimetype = self.get_mime_type(request)
        extension = 'json' if self.is_json(mimetype) else 'html' 

        template = 'microsities_errors/%s.%s' % (exception.template, extension)
        
        preferences = request.preferences
        
        tpl = get_template(template)
        context = Context({
            'preferences':preferences,
            "exception":exception,
            "auth_manager": request.auth_manager
        })
        response = tpl.render(context)
        return ExceptionManagerCore(response=response, output=mimetype,exception=exception, application="microsities",template=template).process()

    """ return HttpResponse(response, mimetype=mimetype, status=exception.status_code)
    Se delego a la clase ExceptionManager que se encuentra en Core """

