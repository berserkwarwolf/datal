from django.core.management.base import BaseCommand
from optparse import make_option
from workspace.exceptions import *
from workspace.middlewares.catch import ExceptionManager as ExceptionManagerMiddleWare
from django.test.client import RequestFactory
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
import os
from core.auth.auth import AuthManager
import re
from workspace.manageDatasets.forms import *

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

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
        print "Message:", e.message



    def handle(self, *args, **options):

        settings.TEMPLATE_DIRS = list(settings.TEMPLATE_DIRS)
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'workspace', 'templates'))
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'microsites', 'templates'))
        settings.TEMPLATE_DIRS = tuple(settings.TEMPLATE_DIRS)

        print Colors.HEADER + "\_/ Testing expection \_/" + Colors.END

        ''' Instance generic Objects for test '''
        InstancedForm = DatasetFormFactory(0).create()
        argument = Object()

        if options['exception']:
            print "======================================================================"
            print Colors.BLUE + "Testing" + options['exception'] + Colors.END
            print "----------------------------------------------------------------------"

            e = Exception.__new__(eval(options['exception']))
            space = 'workspace'
            type_response = 'text/html'
            request = self.FakeRequest(space,type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)
            self.ProcessException(ObjHttpResponse,e,request)

        if options['all']:
            print "======================================================================"
            print Colors.BLUE + "Testing DATALException" + Colors.END
            print "----------------------------------------------------------------------"
            e = DATALException()
            space = 'workspace'
            type_response = 'text/html'
            request = self.FakeRequest(space,type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing LifeCycleException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'
            e = LifeCycleException()

            request = self.FakeRequest(space,type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing ChildNotApprovedException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = ChildNotApprovedException(argument)

            request = self.FakeRequest(space,type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing SaveException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response = 'text/html'

            if InstancedForm.is_valid():
                print Colors.FAIL + "Valid form, no expection generated." + Colors.END
            else:
                e = SaveException(InstancedForm)
                request = self.FakeRequest(space, type_response)
                middleware = ExceptionManagerMiddleWare()
                ObjHttpResponse = middleware.process_exception(request, e)
                self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing DatastreamSaveException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            if InstancedForm.is_valid():
                print "Valid form, no expection generated."
            else:
                e = DatastreamSaveException(InstancedForm)
                request = self.FakeRequest(space, type_response)
                middleware = ExceptionManagerMiddleWare()
                ObjHttpResponse = middleware.process_exception(request, e)
                self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing VisualizationSaveException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            if InstancedForm.is_valid():
                print "Valid form, no expection generated."
            else:
                e = VisualizationSaveException(InstancedForm)
                request = self.FakeRequest(space, type_response)
                middleware = ExceptionManagerMiddleWare()
                ObjHttpResponse = middleware.process_exception(request, e)
                self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing DatasetNotFoundException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = DatasetNotFoundException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing DataStreamNotFoundException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = DataStreamNotFoundException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing VisualizationNotFoundException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = VisualizationNotFoundException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing VisualizationRequiredException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = VisualizationRequiredException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing ParentNotPuslishedException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = ParentNotPuslishedException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing IllegalStateException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = IllegalStateException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing FileTypeNotValidException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = FileTypeNotValidException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing ApplicationException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = ApplicationException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing DatastoreNotFoundException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = DatastoreNotFoundException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing MailServiceNotFoundException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = MailServiceNotFoundException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing SearchIndexNotFoundException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = SearchIndexNotFoundException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing S3CreateException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = S3CreateException("Descripcion error class in __init__")
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing S3UpdateException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = S3UpdateException("Descripcion error class in __init__")
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing ParentNotPublishedException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = ParentNotPublishedException("Descripcion error class in __init__")
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing DatastreamParentNotPublishedException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'
            request = self.FakeRequest(space, type_response)
            e = DatastreamParentNotPublishedException(argument)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing VisualizationParentNotPublishedException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = VisualizationParentNotPublishedException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing ResourceRequiredException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = ResourceRequiredException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing AnyResourceRequiredException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = AnyResourceRequiredException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing DatasetRequiredException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = DatasetRequiredException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing DatastreamRequiredException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = DatastreamRequiredException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing AnyDatasetRequiredException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = AnyDatasetRequiredException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing AnyDatastreamRequiredException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = AnyDatastreamRequiredException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)


            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing InsufficientPrivilegesException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = InsufficientPrivilegesException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)

            print "\n"
            print "======================================================================"
            print Colors.BLUE + "Testing RequiresReviewException" + Colors.END
            print "----------------------------------------------------------------------"

            space = 'workspace'
            type_response ='text/html'

            e = RequiresReviewException()
            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()
            ObjHttpResponse = middleware.process_exception(request, e)
            self.ProcessException(ObjHttpResponse,e,request)

            request = self.FakeRequest(space, type_response)
            middleware = ExceptionManagerMiddleWare()

            ObjHttpResponse = middleware.process_exception(request,e)

            print "\n"
            print Colors.BLUE + " \~ END TEST \~" + Colors.END






