import json

ERROR_KEY = 'error'
DESCRIPTION_KEY = 'message'


def is_method_get_or_405(p_request):
    return is_method_or_405(p_request, ['GET'])

def is_method_post_or_405(p_request):
    return is_method_or_405(p_request, ['POST'])

def is_method_or_405(p_request, p_method):
    if not p_request.method in p_method:
        raise Http405(p_method)

class JunarException(Exception):
    """
    JunarException class: Base class for handling exceptions.
    """

    def __init__(self, info):
        self.info = info
        super(JunarException, self).__init__(self.info[DESCRIPTION_KEY])

    def __str__(self):
        return str(self.info)

    def convert_json(self):
        return json.dumps(self.info)


class Http400(JunarException):
    """ Bad Request Exception """

    def __init__(self, description):
        self.info = dict()
        self.info[ERROR_KEY] = 'Bad request'
        self.info[DESCRIPTION_KEY] = description
        super(Http400, self).__init__(self.info)


class MintTemplateURLError(Http400):

    def __init__(self, description = 'The template URL is wrong or empty'):
        super(MintTemplateURLError, self).__init__(description)

class MintTemplateNotFoundError(Http400):

    def __init__(self, description = 'The template was not found'):
        super(MintTemplateNotFoundError, self).__init__(description)

class ApplicationNotAdmin(Http400):

    def __init__(self, description = 'The auth key is not for admin'):
        super(ApplicationNotAdmin, self).__init__(description)

class Http401(JunarException):
    """ Unauthorized Exception """

    def __init__(self, description='Unauthorized to access requested resource.'):
        self.info = dict()
        self.info[ERROR_KEY] = 'Unauthorized'
        self.info[DESCRIPTION_KEY] = description
        super(Http401, self).__init__(self.info)

class InvalidKey(Http401):
    def __init__(self, description = 'The auth key is not valid'):
        super(InvalidKey, self).__init__(description)

class Http405(JunarException):
    """ Not Allowed Exception """

    def __init__(self, p_methods=['GET']):
        """ By default the only accepted method is GET """
        self.info = dict()
        self.info[ERROR_KEY] = 'Not allowed'
        self.info[DESCRIPTION_KEY] = 'Method not allowed.'
        self.methods = p_methods
        super(Http405, self).__init__(self.info)

class Http404(JunarException):
    """ Not Found Exception """

    def __init__(self, description='Resource not found'):
        self.info = dict()
        self.info[ERROR_KEY] = 'Not found error'
        self.info[DESCRIPTION_KEY] = description
        super(Http404, self).__init__(self.info)

class Http500(JunarException):
    """ Internal Server Error Exception """

    def __init__(self, description):
        self.info = dict()
        self.info[ERROR_KEY] = 'Server error'
        self.info[DESCRIPTION_KEY] = description
        super(Http500, self).__init__(self.info)

class BigdataNamespaceNotDefined(Http500):
    """ The preference 'namespace' is not defined
        for this account.
    """

    def __init__(self):
        description = 'Bigdata namespace account preference must be defined.'
        super(BigdataNamespaceNotDefined, self).__init__(description)

class BigdataCrossNamespaceForbidden(Http401):
    """ Cross namespace requests to bigdata are not allowed
    """

    def __init__(self):
        description = 'Cross namespace requests are not allowed.'
        super(BigdataCrossNamespaceForbidden, self).__init__(description)

class BigDataInsertError(Http500):

    def __init__(self, namespace, context="", extras=""):
        description = 'BigData insertion fails. Namespace: [%s] Context: [%s] Detail [%s]' % (namespace, context, extras)
        super(BigDataInsertError, self).__init__(description)

class BigDataDeleteError(Http500):

    def __init__(self, namespace, context="", extras=""):
        description = 'BigData delete fails. Failed DELETE RDF-context [%s]-[%s] --  %s' % (context, namespace, extras)
        super(BigDataDeleteError, self).__init__(description)

class BigDataInvalidQuery(Http401):

    def __init__(self, error):
        # description = 'BigData unauthorized query. %s' % error
        super(BigDataInvalidQuery, self).__init__()