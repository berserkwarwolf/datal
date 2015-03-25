# -*- coding: utf-8 -*-
import json
from core.choices import StatusChoices

ERROR_KEY = 'error'
DESCRIPTION_KEY = 'message'
EXTRAS_KEY = 'extras'

class JunarWorkspaceException(Exception):
    """Junar Workspace Exception class: Base class for handling exceptions."""
    info = {}
    def __init__(self, info):
        self.info = info
        if self.info.get(ERROR_KEY, False) == False:
            self.info[ERROR_KEY] = 'Workspace Error'

        if self.info.get(DESCRIPTION_KEY, False) == False:
            self.info[DESCRIPTION_KEY] = ""

        if self.info.get(EXTRAS_KEY, False) == False:
            self.info[EXTRAS_KEY] = {}

        super(JunarWorkspaceException, self).__init__(self.info[DESCRIPTION_KEY])

    def __str__(self):
        return str(self.info)

    def convert_json(self):
        return json.dumps(self.info)


# -----------------------------------------------------------------------------


class BadRequestException(JunarWorkspaceException):

    def __init__(self, description=''):
        self.info[ERROR_KEY] = 'Bad Request. ' + self.info.get(ERROR_KEY, "")
        super(BadRequestException, self).__init__(self.info)

class InvalidFormException(BadRequestException):

    def __init__(self, form, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Invalid Form'
        self.info[DESCRIPTION_KEY] = description
        self.info[EXTRAS_KEY] = {"form": form}
        super(InvalidFormException, self).__init__(description)


# -----------------------------------------------------------------------------

class ApplicationException(JunarWorkspaceException):

    def __init__(self, description=""):
        self.info[ERROR_KEY] = 'Application error. ' + self.info.get(ERROR_KEY, "")
        self.info[DESCRIPTION_KEY] = description
        super(ApplicationException, self).__init__(self.info)

class LifeCycleException(ApplicationException):

    def __init__(self, description=""):
        self.info[ERROR_KEY] = 'Life cycle error. ' + self.info.get(ERROR_KEY, "")
        self.info[DESCRIPTION_KEY] = description
        super(LifeCycleException, self).__init__(description)


class DatasetNotFoundException(LifeCycleException):

    def __init__(self, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Dataset not found'
        self.info[DESCRIPTION_KEY] = description
        super(DatasetRequiredException, self).__init__(description)


class DatasetRequiredException(LifeCycleException):

    def __init__(self, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Dataset required'
        self.info[DESCRIPTION_KEY] = description
        super(DatasetRequiredException, self).__init__(description)

class AnyDatasetRequiredException(LifeCycleException):

    def __init__(self, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Almost one dataset required'
        self.info[DESCRIPTION_KEY] = description
        super(AnyDatasetRequiredException, self).__init__(description)
        
class AnyDatastreamRequiredException(LifeCycleException):

    def __init__(self, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Almost one datastream required'
        self.info[DESCRIPTION_KEY] = description
        super(AnyDatastreamRequiredException, self).__init__(description)
        
class DatastreamRequiredException(LifeCycleException):

    def __init__(self, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Datastream required'
        self.info[DESCRIPTION_KEY] = description
        super(DatastreamRequiredException, self).__init__(description)

class VisualizationRequiredException(LifeCycleException):

    def __init__(self, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Visualization required'
        self.info[DESCRIPTION_KEY] = description
        super(VisualizationRequiredException, self).__init__(description)

class IlegalteStateException(LifeCycleException):

    def __init__(self, allowed_states, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Ilegal state'
        self.info[DESCRIPTION_KEY] = description
        self.info[EXTRAS_KEY] = {"allowed_states": allowed_states}
        super(IlegalteStateException, self).__init__(description)

class ParentNotPublishedException(IlegalteStateException):

    def __init__(self, description='Parent resource must be published'):
        self.info = {}
        self.info[ERROR_KEY] = 'Ilegal state'
        self.info[DESCRIPTION_KEY] = description
        self.info[EXTRAS_KEY] = {"allowed_states": [StatusChoices.PUBLISHED]}
        super(IlegalteStateException, self).__init__(description)

# -----------------------------------------------------------------------------

class SecurityException(JunarWorkspaceException):

    def __init__(self, description=""):
        self.info[ERROR_KEY] = 'Security error. ' + self.info.get(ERROR_KEY, "")
        super(SecurityException, self).__init__(self.info)


class InsufficientPrivilegesException(SecurityException):

    def __init__(self, required_privileges, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Privileges required'
        self.info[DESCRIPTION_KEY] = description
        self.info[EXTRAS_KEY] = {"required_privileges": required_privileges}
        super(InsufficientPrivilegesException, self).__init__(description)


class DataStreamNotFoundException(LifeCycleException):

    def __init__(self, description=''):
        self.info = {}
        self.info[ERROR_KEY] = 'Datastream not found'
        self.info[DESCRIPTION_KEY] = description
        super(DataStreamNotFoundException, self).__init__(description)
