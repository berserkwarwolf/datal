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

    def SearchText(self,text,expression):
        pattern=re.compile(expression, flags=re.IGNORECASE)
        return re.search(pattern, text)

    def FakeRequest(self, space, type_response):
        request = RequestFactory().get('/'+space+'/', HTTP_ACCEPT=type_response)
        request.user = AnonymousUser()
        request.auth_manager = AuthManager(language="en")
        return request

    def PrintTitulo(self,exception):
        print "\n"
        print "======================================================================"
        print Colors.BLUE + "Testing" + exception + Colors.END
        print "----------------------------------------------------------------------"

    def GenerateException(self,space,type_response,e):
        request = self.FakeRequest(space,type_response)
        if space == 'workspace':
            middleware = WorkspaceExceptionManagerMiddleWare()

        if space == 'microsites':
            middleware = MicrositesExceptionManagerMiddleWare()

        ObjHttpResponse = middleware.process_exception(request,e)
        self.ProcessException(ObjHttpResponse,e,request)

    def ProcessException(self,ObjHttpResponse,e,request):
        html = ObjHttpResponse._container[0]
        title = unicode(e.title)
        description = unicode(e.description)
        if not self.SearchText(html,description):
            print Colors.FAIL + "Description not found in html" + Colors.END
        else:
            print Colors.GREEN + "Description found in html:",description + Colors.END

        if not self.SearchText(html,title):
            print Colors.FAIL + "Title not found in html" + Colors.END
        else:
            print Colors.GREEN + "Title found in html:", title + Colors.END

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
            self.PrintTitulo(options['exception'])
            e = Exception.__new__(eval(options['exception']))
            space = 'workspace'
            type_response = 'text/html'
            request = self.FakeRequest(space,type_response)
            if space == 'workspace':
                middleware = WorkspaceExceptionManagerMiddleWare()

            if space == 'microsites':
                middleware = MicrositesExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)
            self.ProcessException(ObjHttpResponse,e,request)

        if options['all']:
            self.PrintTitulo("DATALException")
            e = DATALException()
            space = 'workspace'
            type_response = 'text/html'
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("LifeCycleException")
            space = 'workspace'
            type_response ='text/html'
            e = LifeCycleException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("ChildNotApprovedException")
            space = 'workspace'
            type_response ='text/html'
            e = ChildNotApprovedException(argument)
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("SaveException")
            space = 'workspace'
            type_response = 'text/html'

            if InstancedForm.is_valid():
                print Colors.FAIL + "Valid form, no expection generated." + Colors.END
            else:
                e = SaveException(InstancedForm)
                self.GenerateException(space,type_response,e)

            self.PrintTitulo("DatastreamSaveException")
            space = 'workspace'
            type_response ='text/html'

            if InstancedForm.is_valid():
                print "Valid form, no expection generated."
            else:
                e = DatastreamSaveException(InstancedForm)
                self.GenerateException(space,type_response,e)

            self.PrintTitulo("VisualizationSaveException")
            space = 'workspace'
            type_response ='text/html'

            if InstancedForm.is_valid():
                print "Valid form, no expection generated."
            else:
                e = VisualizationSaveException(InstancedForm)
                self.GenerateException(space,type_response,e)

            self.PrintTitulo("DatasetNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = DatasetNotFoundException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("DataStreamNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = DataStreamNotFoundException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("VisualizationNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = VisualizationNotFoundException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("VisualizationRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = VisualizationRequiredException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("IllegalStateException")
            space = 'workspace'
            type_response ='text/html'

            e = IllegalStateException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("FileTypeNotValidException")
            space = 'workspace'
            type_response ='text/html'

            e = FileTypeNotValidException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("ApplicationException")
            space = 'workspace'
            type_response ='text/html'

            e = ApplicationException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("DatastoreNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = DatastoreNotFoundException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("MailServiceNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = MailServiceNotFoundException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("SearchIndexNotFoundException")
            space = 'workspace'
            type_response ='text/html'
            e = SearchIndexNotFoundException()
            self.GenerateException(space,type_response,e)


            self.PrintTitulo("S3CreateException")
            space = 'workspace'
            type_response ='text/html'
            e = S3CreateException("Descripcion error class in __init__")
            self.GenerateException(space,type_response,e)


            self.PrintTitulo("S3UpdateException")
            space = 'workspace'
            type_response ='text/html'
            e = S3UpdateException("Descripcion error class in __init__")
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("ParentNotPublishedException")
            space = 'workspace'
            type_response ='text/html'
            e = ParentNotPublishedException("Descripcion error class in __init__")
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("DatastreamParentNotPublishedException")
            space = 'workspace'
            type_response ='text/html'
            request = self.FakeRequest(space, type_response)
            e = DatastreamParentNotPublishedException(argument)
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("VisualizationParentNotPublishedException")
            space = 'workspace'
            type_response ='text/html'
            e = VisualizationParentNotPublishedException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("ResourceRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = ResourceRequiredException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("AnyResourceRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = AnyResourceRequiredException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("DatasetRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = DatasetRequiredException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("DatastreamRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = DatastreamRequiredException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("AnyDatasetRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = AnyDatasetRequiredException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("AnyDatastreamRequiredException")
            space = 'workspace'
            type_response ='text/html'
            e = AnyDatastreamRequiredException()
            self.GenerateException(space,type_response,e)


            self.PrintTitulo("InsufficientPrivilegesException")
            space = 'workspace'
            type_response ='text/html'
            e = InsufficientPrivilegesException()
            self.GenerateException(space,type_response,e)

            self.PrintTitulo("RequiresReviewException")
            space = 'workspace'
            type_response ='text/html'
            e = RequiresReviewException()
            self.GenerateException(space,type_response,e)

            '''
            Test microsites exceptions
            '''

            self.PrintTitulo("RequiresReviewException")
            space = 'microsites'
            type_response ='text/html'
            e = RequiresReviewException()
            self.GenerateException(space,type_response,e)



            print "\n"
            print Colors.BLUE + " \~ END TEST \~" + Colors.END






