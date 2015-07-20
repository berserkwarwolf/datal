import json
from core.choices import StatusChoices
from django.utils.translation import ugettext as _
from django.core.urlresolvers import reverse

class ExceptionAction(object):
    description = _('EXCEPTION-ACTION-GENERIC')
    
    def __init__(self, url=None, description=None):
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


class ViewDatastreamListExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASREAM-LIST')

    def __init__(self):
        url = reverse('manageDataviews.list')
        super(ViewDatastreamListExceptionAction, self).__init__(url)


class ViewDatastreamCreateExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASREAM-CREATE')

    def __init__(self):
        url = reverse('manageDataviews.create')
        super(ViewDatastreamCreateExceptionAction, self).__init__(url)


class ViewDatasetExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASET')

    def __init__(self, revision):
        url = reverse('manageDatasets.view', args=(revision.id,))
        super(ViewDatasetExceptionAction, self).__init__(url)


class ViewDatassetListExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASET-LIST')

    def __init__(self):
        url = reverse('manageDatasets.list')
        super(ViewDatassetListExceptionAction, self).__init__(url)


class ViewDatasetCreateExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASET-CREATE')

    def __init__(self):
        url = reverse('manageDatasets.create')
        super(ViewDatasetCreateExceptionAction, self).__init__(url)


class ViewVisualizationExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-VISUALIZATION')

    def __init__(self, revision):
        url = reverse('manageVisualizations.view', args=(revision.id,))
        super(ViewVisualizationExceptionAction, self).__init__(url)


class ViewVisualizationListExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-VISUALIZATION-LIST')

    def __init__(self):
        url = reverse('manageVisualizations.list')
        super(ViewVisualizationListExceptionAction, self).__init__(url)


class ViewVisualizationCreateExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-VISUALIZATION-CREATE')

    def __init__(self):
        url = reverse('manageDatasets.create')
        super(ViewVisualizationCreateExceptionAction, self).__init__(url)

class ContactUsExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-CONTACT-US')
