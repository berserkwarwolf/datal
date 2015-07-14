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