from django.utils.translation import ugettext_lazy as _

from core.exceptions import *
from core.actions import *


class InvalidFormSearch(DATALException):
    print "__ class InvalidFormSearch __"
    title = 'EXCEPTION-INVALID-FORM-SEARCH'
    description = 'EXCEPTION-INVALID-FORM-SEARCH'
    tipo = 'invalid-form-search'

