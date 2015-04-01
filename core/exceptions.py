import json
from core.choices import StatusChoices

ERROR_KEY = 'error'
DESCRIPTION_KEY = 'message'
EXTRAS_KEY = 'extras'


class DatalException(Exception):
    """Datal Exception class: Base class for handling exceptions."""
    title = ''
    description = ''
    def __init__(self, title=None, description='', status_code=400, extras={}):
        if not title:
            title = 'Datal Error'

        self.title = title
        self.description = description  # .replace("\n", " ")
        self.status_code = status_code
        self.extras = extras
        message = '%s. %s' % (self.title, self.description)
        super(DatalException, self).__init__(message)

    def __str__(self):
        return '%s. %s' % (self.title, self.description)


class S3CreateException(DatalException):
    def __init__(self, description):
        super(S3CreateException, self).__init__(title='S3 Create error', description=description, status_code=503)


class S3UpdateException(DatalException):
    def __init__(self, description):
        super(S3UpdateException, self).__init__(title='S3 Update error', description=description, status_code=503)


class SFTPCreateException(DatalException):
    def __init__(self, description):
        super(SFTPCreateException, self).__init__(title='SFTP Create error', description=description, status_code=503)


class SFTPUpdateException(DatalException):
    def __init__(self, description):
        super(SFTPUpdateException, self).__init__(title='SFTP Update error', description=description, status_code=503)