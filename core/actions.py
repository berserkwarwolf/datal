import json
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse


class ExceptionAction(object):
    description = _('EXCEPTION-ACTION-GENERIC')
    
    def __init__(self, url=None, description=None):
        self.url = url
        self.description = (description or self.description) % {'url':url}

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
        url = reverse('manageDataviews.index')
        super(ViewDatastreamListExceptionAction, self).__init__(url)


class ViewDatastreamCreateExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASREAM-CREATE')

    def __init__(self):
        url = reverse('manageDataviews.index')
        super(ViewDatastreamCreateExceptionAction, self).__init__(url)


class ViewDatasetExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASET')

    def __init__(self, revision):
        url = reverse('manageDatasets.view', args=(revision.id,))
        super(ViewDatasetExceptionAction, self).__init__(url)


class ReviewDatasetStreamsAndPublishExceptionAction(ViewDatasetExceptionAction):
    description = _('EXCEPTION-ACTION-REVIEW-DATASET-STREAMS-AND-PUBLISH')


class ViewDatasetListExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASET-LIST')

    def __init__(self):
        url = reverse('manageDatasets.index')
        super(ViewDatasetListExceptionAction, self).__init__(url)


class ViewDatasetCreateExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-DATASET-CREATE')

    def __init__(self):
        url = reverse('manageDatasets.index')
        super(ViewDatasetCreateExceptionAction, self).__init__(url)


class ViewVisualizationExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-VISUALIZATION')

    def __init__(self, revision):
        url = reverse('manageVisualizations.view', args=(revision.id,))
        super(ViewVisualizationExceptionAction, self).__init__(url)


class ViewVisualizationListExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-VISUALIZATION-LIST')

    def __init__(self):
        url = reverse('manageVisualizations.index')
        super(ViewVisualizationListExceptionAction, self).__init__(url)


class ViewVisualizationCreateExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-VIEW-VISUALIZATION-CREATE')

    def __init__(self):
        url = reverse('manageDatasets.index')
        super(ViewVisualizationCreateExceptionAction, self).__init__(url)


class ContactUsExceptionAction(ExceptionAction):
    description = _('EXCEPTION-ACTION-CONTACT-US')
