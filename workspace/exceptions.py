# -*- coding: utf-8 -*-
from core.exceptions import *


class DatalWorkspaceException(DatalException):
    """Junar Workspace Exception class: Base class for handling exceptions."""
    info = {}
    def __init__(self, info):
        super(DatalWorkspaceException, self).__init__(self.info[DESCRIPTION_KEY])

    def __str__(self):
        return str(self.info)

    def convert_json(self):
        return json.dumps(self.info)


class BadRequestException(DatalWorkspaceException):

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


class SecurityException(DatalWorkspaceException):

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
