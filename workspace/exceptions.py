# -*- coding: utf-8 -*-
from core.exceptions import *


class DatalWorkspaceException(DatalException):
    """Junar Workspace Exception class: Base class for handling exceptions."""
    def __init__(self, description):
        super(DatalWorkspaceException, self).__init__(description=description)


class BadRequestException(DatalWorkspaceException):
    title = 'Bad Request'


class InvalidFormException(BadRequestException):
    title = 'Invalid Form'

    def __init__(self, form, description=''):
        super(InvalidFormException, self).__init__(description=description, extras={"form": form})


class DatasetRequiredException(LifeCycleException):
    title = 'Dataset required'


class AnyDatasetRequiredException(LifeCycleException):
    title = 'Almost one dataset required'


class AnyDatastreamRequiredException(LifeCycleException):
    title = 'Almost one datastream required'


class DatastreamRequiredException(LifeCycleException):
    title = 'Datastream required'


class VisualizationRequiredException(LifeCycleException):
    title = 'Visualization required'


class SecurityException(DatalWorkspaceException):
    title = 'Security error'


class InsufficientPrivilegesException(SecurityException):
    title = 'Privileges required'

    def __init__(self, required_privileges, description=''):
        super(InsufficientPrivilegesException, self).__init__(description=description, extras={"required_privileges": required_privileges})


class DataStreamNotFoundException(LifeCycleException):
    title = 'Datastream not found'