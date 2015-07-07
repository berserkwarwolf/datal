import json
from core.choices import StatusChoices
from django.utils.translation import ugettext as _
from django.core.urlresolvers import reverse

class ExceptionAction:
    description = _('EXCEPTION-ACTION-GENERIC')
    
    def __init__(self, url, description=None):
        self.url = url
        self.description = (description or self.description) % url

    def as_dict(self):
        return {
            'link': url,
            'description': self.description
        }

class ViewDatastreamExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASREAM')


class DATALException(Exception):
    """DATAL Exception class: Base class for handling exceptions."""
    title = _('EXCEPTION-TITLE-GENERIC')
    description = _('EXCEPTION-DESCRIPTION-GENERIC')
    tipo = 'datal-abstract'

    def __init__(self, title=None, description=None, status_code=400, **kwargs):
        self.context = **kwargs
        self.title = (title or self.title) % self.context
        self.description = (description or self.description) % self.context
        self.status_code = status_code 
        message = '%s. %s' % (self.title, self.description)
        super(DATALException, self).__init__(message)

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __unicode__(self):
        return '%s: %s' % (self.title, self.description)

    def get_actions(self):
        return []

    def as_dict(self):
        return {"error": self.title, 
                "message": self.description, 
                "status_code": self.status_code,
                "actions": self.get_actions()
        }

    def convert_json(self):
        return json.dumps(self.as_dict())

class ChildNotApprovedException(LifeCycleException):
    title = _('EXCEPTION-TITLE-CHILD-NOT-APPROVED')
    # Translators: Ejemplo, "Existen %(count)s hijos sin aprobar"
    description = _('EXCEPTION-DESCRIPTION-CHILD-NOT-APPROVED')
    tipo = 'child-not-approved'

    def __init__(self, failed_revisions=None):
        self.failed_revisions = failed_revisions or []
        super(ChildNotApprovedException, self).__init__(
            count=str(len(self.failed_revisions)))

    def get_actions(self):
        return map(lambda x: ViewDatastreamExceptionAction(
                                reverse('manageDataviews.view', args=(x.id,))),
                self.failed_revisions)

class ApplicationException(DATALException):
    title = 'Application error'

class LifeCycleException(ApplicationException):
    title = 'Life cycle error'

class DatastoreNotFoundException(ApplicationException):
    title = 'Data Store not found'

class MailServiceNotFoundException(ApplicationException):
    title = 'Mail service not found'

class SearchIndexNotFoundException(ApplicationException):
    title = 'Search index not found exception'

class DatasetNotFoundException(LifeCycleException):
    title = 'Dataset not found'

    def __init__(self, description=''):
        super(DatasetNotFoundException, self).__init__(description=description, status_code=404)

class DataStreamNotFoundException(LifeCycleException):
    title = 'Datastream not found'

    def __init__(self, description=''):
        super(DataStreamNotFoundException, self).__init__(description=description, status_code=404)

class VisualizationRequiredException(LifeCycleException):
    title = 'Visualization not found'

class IlegalStateException(LifeCycleException):
    title = 'Ilegal state'

    def __init__(self, allowed_states, description=''):
        self.extras = {"allowed_states": allowed_states}
        super(IlegalStateException, self).__init__(description)


class ParentNotPublishedException(LifeCycleException):
    title = 'Parent not published'

    def __init__(self, description='Parent resource must be published'):
        super(ParentNotPublishedException, self).__init__(description)

class S3CreateException(DATALException):
    title = 'S3 Create error'

    def __init__(self, description):
        super(S3CreateException, self).__init__(description=description, status_code=503)


class S3UpdateException(DATALException):
    title = 'S3 Update error'

    def __init__(self, description):
        super(S3UpdateException, self).__init__(description=description, status_code=503)


class SFTPCreateException(DATALException):
    title = 'SFTP Create error'

    def __init__(self, description):
        super(SFTPCreateException, self).__init__(description=description, status_code=503)


class SFTPUpdateException(DATALException):
    title = 'SFTP Update error'

    def __init__(self, description):
        super(SFTPUpdateException, self).__init__(description=description, status_code=503)