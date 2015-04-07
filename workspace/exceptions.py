from core.exceptions import *


class DatalWorkspaceException(DatalException):
    """Junar Workspace Exception class: Base class for handling exceptions."""
    def __init__(self, title=None, description='', status_code=400, extras={}):
        super(DatalWorkspaceException, self).__init__(title=title,
                                                      description=description,
                                                      status_code=status_code,
                                                      extras=extras)

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

    def __init__(self, description='', required_privileges={}):
        super(InsufficientPrivilegesException, self).__init__(description=description, extras={"required_privileges": required_privileges})


class DataStreamNotFoundException(LifeCycleException):
    title = 'Datastream not found'