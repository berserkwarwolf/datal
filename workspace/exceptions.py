from core.exceptions import *
from django.utils.translation import ugettext as _


class ParentNotPublishedException(LifeCycleException):
    title = _('EXCEPTION-TITLE-PARENT-NOT-PUBLISHED')
    description = _('EXCEPTION-DESCRIPTION-PARENT-NOT-PUBLISHED')
    tipo = 'parent-not-published'


class ResourceRequiredException(LifeCycleException):
    title = _('EXCEPTION-TITLE-RESOURCE-REQUIRED')
    description = _('EXCEPTION-DESCRIPTION-RESOURCE-REQUIRED')
    tipo = 'resource-required'


class AnyResourceRequiredException(LifeCycleException):
    title = _('EXCEPTION-TITLE-ANY-RESOURCE-REQUIRED')
    description = _('EXCEPTION-DESCRIPTION-ANY-RESOURCE-REQUIRED')
    tipo = 'resource-required'


class DatasetRequiredException(ResourceRequiredException):
    title = _('EXCEPTION-TITLE-DATASET-REQUIRED')
    description = _('EXCEPTION-DESCRIPTION-DATASET-REQUIRED')
    tipo = 'dataset-required'


class DatastreamRequiredException(ResourceRequiredException):
    title = _('EXCEPTION-TITLE-DATASTREAM-REQUIRED')
    description = _('EXCEPTION-DESCRIPTION-DATASTREAM-REQUIRED')
    tipo = 'datastream-required'


class AnyDatasetRequiredException(AnyResourceRequiredException):
    title = _('EXCEPTION-TITLE-ANY-DATASET-REQUIRED')
    description = _('EXCEPTION-DESCRIPTION-ANY-DATASET-REQUIRED')
    tipo = 'any-dataset-required'


class AnyDatastreamRequiredException(AnyResourceRequiredException):
    title = _('EXCEPTION-TITLE-ANY-DATASTREAM-REQUIRED')
    description = _('EXCEPTION-DESCRIPTION-ANY-DATASTREAM-REQUIRED')
    tipo = 'any-datastream-required'


class InsufficientPrivilegesException(DATALException):
    title = _('EXCEPTION-TITLE-INSUFFICIENT-PRIVILEGES')
    description = _('EXCEPTION-DESCRIPTION-INSUFFICIENT-PRIVILEGES')
    tipo = 'insufficient-priviliges'