from django.core.validators import RegexValidator
from django.utils.translation import ugettext_lazy as _
import re

validate_comma_separated_word_list = RegexValidator(
    re.compile('^[\w,]+$'), _(u'Enter only words separated by commas.'), 
    'invalid')