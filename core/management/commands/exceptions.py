from django.core.management.base import BaseCommand
from optparse import make_option
from workspace.exceptions import *
from microsites.exceptions import *
from workspace.middlewares.catch import ExceptionManager as WorkspaceExceptionManagerMiddleWare
from microsites.middlewares.catch import ExceptionManager as MicrositesExceptionManagerMiddleWare
from django.test.client import RequestFactory
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
import os
from core.auth.auth import AuthManager
import re
from core.shortcuts import render_to_response
from workspace.manageDatasets.forms import *
from django.template import Context,Template



class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'

class Object(object):
    def __init__(self):
        self.id = 0
        self.revision = 0

class Command(BaseCommand):
    help = "Command to raise exceptions on demand for test the expection response, not to test cases"
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

    def search_text(self,text,expression):
        expression = expression.replace("'", "&#39;")
        pattern=re.compile(expression, flags=re.IGNORECASE)
        return re.search(pattern, text)

    def fake_request(self, space, type_response):
        request = RequestFactory().get('/'+space+'/', HTTP_ACCEPT=type_response)
        request.user = AnonymousUser()
        request.auth_manager = AuthManager(language="en")
        return request

    def print_titulo(self,exception):
        print "\n"
        print "======================================================================"
        print Colors.BLUE + "Testing " + exception + Colors.END
        print "----------------------------------------------------------------------"

    def generate_exception(self,space,type_response,e):
        request = self.fake_request(space,type_response)
        if space == 'workspace':
            middleware = WorkspaceExceptionManagerMiddleWare()

        if space == 'microsites':
            middleware = MicrositesExceptionManagerMiddleWare()

        ObjHttpResponse = middleware.process_exception(request,e)
        self.process_exception(ObjHttpResponse,e,request)

    def process_exception(self,ObjHttpResponse,e,request):
        html = ObjHttpResponse._container[0]
        title = unicode(e.title)
        description = unicode(e.description)
        print "Descripcion", description
        if not self.search_text(html,description):
            print Colors.FAIL + "Description not found in html" + Colors.END
        else:
            print Colors.GREEN + "Description found in html:",description + Colors.END

        '''if not self.search_text(html,title):
            print Colors.FAIL + "Title not found in html" + Colors.END
        else:
            print Colors.GREEN + "Title found in html:", title + Colors.END'''

        print "Status Code:", e.status_code
        print "Template:", request.META['PATH_INFO']+e.template
        print "Type of response:",request.META['HTTP_ACCEPT']
        print "Type Exception:", e.tipo



    def handle(self, *args, **options):

        settings.TEMPLATE_DIRS = list(settings.TEMPLATE_DIRS)
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'workspace', 'templates'))
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'microsites', 'templates'))
        settings.TEMPLATE_DIRS = tuple(settings.TEMPLATE_DIRS)

        settings.INSTALLED_APPS = list(settings.INSTALLED_APPS)
        settings.INSTALLED_APPS.append('microsites')
        settings.INSTALLED_APPS = tuple(settings.INSTALLED_APPS)


        print Colors.HEADER + "\_/ Testing expection \_/" + Colors.END

        ''' Instance generic Objects for test '''
        InstancedForm = DatasetFormFactory(0).create()
        argument = Object()

        if options['exception']:
            self.print_titulo(options['exception'])
            e = Exception.__new__(eval(options['exception']))
            space = 'microsites'
            type_response = 'text/html'
            request = self.fake_request(space,type_response)
            if space == 'workspace':
                middleware = WorkspaceExceptionManagerMiddleWare()

            if space == 'microsites':
                middleware = MicrositesExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)
            self.process_exception(ObjHttpResponse,e,request)

        if options['all']:
            self.print_titulo("DATALException")
            e = DATALException()
            space = 'workspace'
            type_response = 'text/html'
            self.generate_exception(space,type_response,e)

            self.print_titulo("LifeCycleException")
            space = 'workspace'
            type_response ='text/html'
            e = LifeCycleException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("ChildNotApprovedException")
            space = 'workspace'
            type_response ='text/html'
            e = ChildNotApprovedException(argument)
            self.generate_exception(space,type_response,e)

            self.print_titulo("SaveException")
            space = 'workspace'
            type_response = 'text/html'

            if InstancedForm.is_valid():
                print Colors.FAIL + "Valid form, no expection generated." + Colors.END
            else:
                e = SaveException(InstancedForm)
                self.generate_exception(space,type_response,e)

            self.print_titulo("DatastreamSaveException")
            space = 'workspace'
            type_response ='text/html'

            if InstancedForm.is_valid():
                print "Valid form, no expection generated."
            else:
                e = DatastreamSaveException(InstancedForm)
                self.generate_exception(space,type_response,e)

            self.print_titulo("VisualizationSaveException")
            space = 'workspace'
            type_response ='text/html'

            if InstancedForm.is_valid():
                print "Valid form, no expection generated."
            else:
                e = VisualizationSaveException(InstancedForm)
                self.generate_exception(space,type_response,e)

            self.print_titulo("DatasetNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = DatasetNotFoundException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("DataStreamNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = DataStreamNotFoundException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("VisualizationNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = VisualizationNotFoundException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("VisualizationRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = VisualizationRequiredException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("IllegalStateException")
            space = 'workspace'
            type_response ='text/html'

            e = IllegalStateException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("ApplicationException")
            space = 'workspace'
            type_response ='text/html'

            e = ApplicationException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("DatastoreNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = DatastoreNotFoundException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("MailServiceNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = MailServiceNotFoundException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("SearchIndexNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = SearchIndexNotFoundException()
            self.generate_exception(space,type_response,e)


            self.print_titulo("S3CreateException")
            space = 'workspace'
            type_response ='text/html'
            e = S3CreateException("Descripcion error class in __init__")
            self.generate_exception(space,type_response,e)


            self.print_titulo("S3UpdateException")
            space = 'workspace'
            type_response ='text/html'
            e = S3UpdateException("Descripcion error class in __init__")
            self.generate_exception(space,type_response,e)

            self.print_titulo("ParentNotPublishedException")
            space = 'workspace'
            type_response ='text/html'
            e = ParentNotPublishedException("Descripcion error class in __init__")
            self.generate_exception(space,type_response,e)

            self.print_titulo("DatastreamParentNotPublishedException")
            space = 'workspace'
            type_response ='text/html'
            request = self.fake_request(space, type_response)
            e = DatastreamParentNotPublishedException(argument)
            self.generate_exception(space,type_response,e)

            self.print_titulo("VisualizationParentNotPublishedException")
            space = 'workspace'
            type_response ='text/html'
            e = VisualizationParentNotPublishedException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("ResourceRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = ResourceRequiredException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("AnyResourceRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = AnyResourceRequiredException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("DatasetRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = DatasetRequiredException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("DatastreamRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = DatastreamRequiredException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("AnyDatasetRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = AnyDatasetRequiredException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("AnyDatastreamRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = AnyDatastreamRequiredException()
            self.generate_exception(space,type_response,e)


            self.print_titulo("InsufficientPrivilegesException")
            space = 'workspace'
            type_response ='text/html'
            e = InsufficientPrivilegesException()
            self.generate_exception(space,type_response,e)

            self.print_titulo("RequiresReviewException")
            space = 'workspace'
            type_response ='text/html'
            e = RequiresReviewException()
            self.generate_exception(space,type_response,e)

            '''
            Test microsites exceptions
            '''

            self.print_titulo("VisualizationRevisionDoesNotExist")
            space = 'microsites'
            type_response ='text/html'
            e = VisualizationRevisionDoesNotExist()
            self.generate_exception(space,type_response,e)

            self.print_titulo("VisualizationDoesNotExist")
            space = 'microsites'
            type_response ='text/html'
            e = VisualizationDoesNotExist()
            self.generate_exception(space,type_response,e)

            self.print_titulo("AccountDoesNotExist")
            space = 'microsites'
            type_response ='text/html'
            e = AccountDoesNotExist()
            self.generate_exception(space,type_response,e)

            self.print_titulo("InvalidPage")
            space = 'microsites'
            type_response ='text/html'
            e = InvalidPage()
            self.generate_exception(space,type_response,e)

            self.print_titulo("DataStreamDoesNotExist")
            space = 'microsites'
            type_response ='text/html'
            e = DataStreamDoesNotExist()
            self.generate_exception(space,type_response,e)

            self.print_titulo("DatasetDoesNotExist")
            space = 'microsites'
            type_response ='text/html'
            e = DatasetDoesNotExist()
            self.generate_exception(space,type_response,e)

            self.print_titulo("DatsetError")
            space = 'microsites'
            type_response ='text/html'
            e = DatsetError()
            self.generate_exception(space,type_response,e)

            self.print_titulo("NotAccesVisualization")
            space = 'microsites'
            type_response ='text/html'
            e = NotAccesVisualization()
            self.generate_exception(space,type_response,e)

            print "\n"
            print Colors.BLUE + " \~ END TEST \~" + Colors.END






