from django.core.validators import RegexValidator
from django.utils.translation import ugettext_lazy as _
from django.template.defaultfilters import slugify as django_slugify
import re

validate_comma_separated_word_list = RegexValidator(
    re.compile('^[\w,]+$'), _(u'Enter only words separated by commas.'), 
    'invalid')

def slugify(value):
    value = django_slugify(value)
    value = value.replace('_', '-')
    value = re.sub('[^a-zA-Z0-9]+', '-', value.strip())
    value = re.sub('\-+', '-', value)
    value = re.sub('\-$', '', value)
    return value