from django.core.validators import RegexValidator
from django.utils.translation import ugettext_lazy as _
from django.template.defaultfilters import slugify as django_slugify
from core.choices import SOURCE_IMPLEMENTATION_CHOICES
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


# Esto deberà estar implementado en las revisiones y a su vez devuelto
# en el DAO, ahora una vez devuelto el resulado del dao se calculo el 
# impl_type_nice sobre el impl_type de la respuesta del DAO
def set_dataset_impl_type_nice(item):
    return unicode(SOURCE_IMPLEMENTATION_CHOICES[int(item)][1])


# Esto se usa en dos vistas para pasarle parametros de filtro al query de 
# los dao, no estoy seguro donde deberìa ir este còdigo.
def filters_to_model_fields(filters):
    result = dict()

    result['impl_type'] = filters.get('type')
    result['category__categoryi18n__name'] = filters.get('category')
    result['dataset__user__nick'] = filters.get('author')
    result['status'] = filters.get('status')

    return result

# Esto solo se usa en un lugar no se si vale la pena que eté aca
def remove_duplicated_filters(list_of_resources):
    removed = dict()
    removed['status_filter'] = set([x.get('status') for x in list_of_resources])
    removed['type_filter'] = set([x.get('impl_type') for x in list_of_resources])
    removed['category_filter'] = set([x.get('category__categoryi18n__name') for x in list_of_resources])
    removed['author_filter'] = set([x.get('dataset__user__nick', '') for x in list_of_resources])
    removed['author_filter'] = removed['author_filter'].union(set([x.get('datastream__user__nick', '') for x in list_of_resources]))
    return removed

# esto se usa exactamente en el mismo lugar que la funciòn de arriba
def unset_visualization_revision_nice(item):
    new_item = dict()
    new_item['dataset__user__nick'] = item.get('author_filter')
    if item.get('status_filter'):
        new_item['status'] = []
        for x in item.get('status_filter'):
            new_item['status'].append([status[0] for status in STATUS_CHOICES if status[1] == x][0])

    return new_item

def generate_ajax_form_errors(form):
    errors = []
    for (k,v) in form.errors.iteritems():
        if k != '__all__':
            k = unicode(form.fields[k].label) + ': '
        else:
            k = ''
        errors.append("%s%s" % (k, v))
    return errors