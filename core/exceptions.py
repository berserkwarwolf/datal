import json
from core.choices import StatusChoices
from django.utils.translation import ugettext as _
from django.core.urlresolvers import reverse

class ExceptionAction(object):
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

    def __init__(self, revision):
        url = reverse('manageDataviews.view', args=(revision.id,))
        super(ViewDatastreamExceptionAction, self).__init__(url)


class DATALException(Exception):
    """DATAL Exception class: Base class for handling exceptions."""
    title = _('EXCEPTION-TITLE-GENERIC')
    description = _('EXCEPTION-DESCRIPTION-GENERIC')
    tipo = 'datal-abstract'
    status_code = 400

    def __init__(self, *args, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        self._context = **kwargs
        self.title = self.title % self._context
        self.description = self.description % self._context
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


class LifeCycleException(ApplicationException):
    title = _('EXCEPTION-TITLE-LIFE-CYCLE')
    description = _('EXCEPTION-DESCRIPTION-LIFE-CYCLE')
    tipo = 'life-cycle'


class ChildNotApprovedException(LifeCycleException):
    title = _('EXCEPTION-TITLE-CHILD-NOT-APPROVED')
    # Translators: Ejemplo, "Existen %(count)s hijos sin aprobar"
    description = _('EXCEPTION-DESCRIPTION-CHILD-NOT-APPROVED')
    tipo = 'child-not-approved'


class DatasetSaveException(LifeCycleException):
    title = _('EXCEPTION-TITLE-DATASET-SAVE-ERROR')
    description = _('EXCEPTION-DESCRIPTION-DATASET-SAVE-ERROR')
    tipo = 'dataset-save-error'


class DatastreamSaveException(LifeCycleException):
    title = _('EXCEPTION-TITLE-DATASTREAM-SAVE-ERROR')
    description = _('EXCEPTION-DESCRIPTION-DATASTREAM-SAVE-ERROR')
    tipo = 'datastream-save-error'


class VisualizationSaveException(FormErrorException):
    title = _('EXCEPTION-TITLE-VISUALIZATION-SAVE-ERROR')
    description = _('EXCEPTION-DESCRIPTION-VISUALIZATION-SAVE-ERROR')
    tipo = 'visualization-save-error'


class DatasetNotFoundException(LifeCycleException):
    title = _('EXCEPTION-TITLE-DATASET-NOT-FOUND')
    description = _('EXCEPTION-DESCRIPTION-DATASET-NOT-FOUND')
    tipo = 'dataset-not-found'
    status_code = 404


class DataStreamNotFoundException(LifeCycleException):
    title = _('EXCEPTION-TITLE-DATASTREAM-NOT-FOUND')
    description = _('EXCEPTION-DESCRIPTION-DATASTREAM-NOT-FOUND')
    tipo = 'datastream-not-found'
    status_code = 404


class VisualizationRequiredException(LifeCycleException):
    title = _('EXCEPTION-TITLE-VIZUALIZATION-REQUIRED')
    description = _('EXCEPTION-DESCRIPTION-VIZUALIZATION-REQUIRED')
    tipo = 'vizualization-required'


class IllegalStateException(LifeCycleException):
    title = _('EXCEPTION-TITLE-ILLEGAL-STATE')
    description = _('EXCEPTION-DESCRIPTION-ILLEGAL-STATE')
    tipo = 'illegal-state'


class ParentNotPublishedException(LifeCycleException):
    title = _('EXCEPTION-TITLE-PARENT-NOT-PUBLISHED')
    description = _('EXCEPTION-DESCRIPTION-PARENT-NOT-PUBLISHED')
    tipo = 'parent-not-published'




class ApplicationException(DATALException):
    title = 'Application error'

class DatastoreNotFoundException(ApplicationException):
    title = 'Data Store not found'

class MailServiceNotFoundException(ApplicationException):
    title = 'Mail service not found'

class SearchIndexNotFoundException(ApplicationException):
    title = 'Search index not found exception'

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