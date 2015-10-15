from django.core.management.base import BaseCommand, CommandError
from optparse import make_option
from core.exceptions import *
from django.http import HttpRequest
from workspace.middlewares.catch import ExceptionManager as ExceptionManagerMiddleWare
from django.test.client import RequestFactory
from django.contrib.auth.models import AnonymousUser, User
from django.conf import settings
import os
from core.auth.auth import AuthManager
from pprint import pprint
import re

class Command(BaseCommand):
    help = "Command to raise exceptions for test porpose"
    option_list = BaseCommand.option_list + (
	    make_option('--exception',
	        dest='exception',
	        default='',
	        help='Raise exception'),

	    make_option('--all',
	        dest='all',
	        default='',
	        help='Raise all exception')
	)
    
    def SearchText(self,text,expression):
    	pattern=re.compile(expression, flags=re.IGNORECASE)
    	return re.search(pattern,text)

    def FakeRequest(self,space,type):
    	settings.TEMPLATE_DIRS = list(settings.TEMPLATE_DIRS)
    	settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, space,'templates'))
    	settings.TEMPLATE_DIRS = tuple(settings.TEMPLATE_DIRS)
    	request = RequestFactory().get('/'+space+'/',HTTP_ACCEPT=type)
    	request.user = AnonymousUser()
    	request.auth_manager = AuthManager()
    	return request

    def handle(self, *args, **options):
    	if options['exception']:
    		e = options['exception']
    		msg = vars(eval(e))['__module__']

    	if options['all']:
    		request = self.FakeRequest('workspace','text/html')   		
    		
    		middleware = ExceptionManagerMiddleWare()

	        # Simulate a request
	        e = DataStreamNotFoundException()
	        print "==== /* Class init */===="
	        pprint (vars(e))
	        description = e.description
	        title = e.title
	        ObjHttpResponse = middleware.process_exception(request,e)
	        html = ObjHttpResponse._container[0]
	        
	        print "==== /* Html Response */===="
	        
	        if not self.SearchText(html,description):
	        	print "Description not found in html"
	        
	        if not self.SearchText(html,title):
	        	print "Title not found in html"