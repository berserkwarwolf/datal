import json, re, unicodedata, urllib2, importlib, logging

from django.conf import settings
from django.db.models.sql.aggregates import Aggregate
from django.template.defaultfilters import slugify as django_slugify
from django.core.validators import RegexValidator
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _
from django.db.models import Q
from babel import numbers, dates

from core.primitives import PrimitiveComputer
from core.choices import SourceImplementationChoices, STATUS_CHOICES, SOURCE_IMPLEMENTATION_CHOICES, CHANNEL_TYPES

logger = logging.getLogger(__name__)




# Lo borro porque me explicaron que no se va usar mas
# /home/mativs/Projects/datal/core/chart_manager/views.py
# /home/mativs/Projects/datal/core/datastream_manager/views.py:
# /home/mativs/Projects/datal/workspace/reports_manager/views.py:

# class Day(Aggregate):
#     """Custom aggregator
#     """
#     sql_function = 'DATE'
#     sql_template = "%(function)s(%(field)s)"
# 
#     def __init__(self, lookup, **extra):
#         self.lookup = lookup
#         self.extra = extra
# 
#     def _default_alias(self):
#         return '%s__%s' % (self.lookup, self.__class__.__name__.lower())
#     default_alias = property(_default_alias)
# 
#     def add_to_query(self, query, alias, col, source, is_summary):
#         super(Day, self).__init__(col, source, is_summary, **self.extra)
#         query.aggregate_select[alias] = self

# Lo comento porque supuestamente no se va a uar mas
# /home/mativs/Projects/datal/workspace/managers.py
# /home/mativs/Projects/datal/core/managers.py

# def next(p_iterator, p_default=None):
#     try:
#         l_next = p_iterator.next()
#     except StopIteration, l_error:
#         l_next = p_default
# 
#     return l_next



# Se va porque se va a refactorear
# /home/mativs/Projects/datal/core/datastream_manager/views.py

# def jsonToGrid(p_response, p_page = '', p_limit =''):
#     """ p_response is a core.engine.invoke resultset """
#     l_lists = {}
#     l_hasHeader = False
#     l_noMoreHeaders = False
# 
#     try:
#         p_response = json.loads(p_response)
#     except:
#         return '{"page": 1, "rows": [], "total":1}'
# 
#     l_lists["page"] = p_page
#     l_lists["total"] = p_response['fLength']
#     l_lists["rows"] = []
# 
#     if p_response['fType']=='ARRAY':
#         l_i = 0
#         l_row_i = 0
#         for l_row_number in range(0, p_response['fRows']):
#             l_row  = {}
#             l_row["id"] = str(l_i)
#             l_row["cell"] = []
#             for l_column_number in range(0, p_response['fCols']):
#                 l_cell = p_response['fArray'][l_i]
# 
#                 # TRANSFORM DE DATA
#                 l_row["cell"].append(i18nize(l_cell))
# 
#                 if l_cell.has_key('fHeader') and l_noMoreHeaders == False:
#                     l_hasHeader = True
#                 l_i = l_i + 1
# 
#             l_row_i = l_row_i + 1
# 
#             if not l_hasHeader:
#                 l_lists["rows"].append(l_row)
#             else:
#                 l_hasHeader = False
#                 l_noMoreHeaders = True
# 
#     return json.dumps(l_lists)

# Se va porque se va a refactorear
# /home/mativs/Projects/datal/api/views.py
# /home/mativs/Projects/datal/core/datastream_manager/views.py
# /home/mativs/Projects/datal/microsites/chart_manager/views.py
# /home/mativs/Projects/datal/microsites/datastream_manager/views.py
# /home/mativs/Projects/datal/microsites/viewChart/views.py
# /home/mativs/Projects/datal/workspace/manageVisualizations/views.py

class RequestProcessor:

    def __init__(self, request):
        self.request = request

    def get_arguments(self, paramaters):

        args = {}

        for parameter in paramaters:
            key = 'pArgument%d' % parameter.position
            value = self.request.REQUEST.get(key, '')
            if value == '':
                parameter.value = parameter.default
                args[key] = parameter.value
            else:
                parameter.value = unicode(value).encode('utf-8')
                args[key] = parameter.value
                parameter.default = parameter.value

        return args

    def get_arguments_no_validation(self, query = None):
        counter = 0

        if not query:
            args = {}
        else:
            args = dict(query)

        key = 'pArgument%d' % counter
        value = self.request.REQUEST.get(key, None)
        while value:
            args[key] = PrimitiveComputer().compute(value)
            counter += 1
            key = 'pArgument%d' % counter
            value = self.request.REQUEST.get(key, None)
        return args

def slugify(value):
    value = django_slugify(value)
    value = value.replace('_', '-')
    value = re.sub('[^a-zA-Z0-9]+', '-', value.strip())
    value = re.sub('\-+', '-', value)
    value = re.sub('\-$', '', value)
    return value


class SmartRedirectHandler(urllib2.HTTPRedirectHandler):
    def http_error_301(self, req, fp, code, msg, headers):
        result = urllib2.HTTPRedirectHandler.http_error_301(
            self, req, fp, code, msg, headers)
        result.status = code
        return result

    def http_error_302(self, req, fp, code, msg, headers):
        result = urllib2.HTTPRedirectHandler.http_error_302(
            self, req, fp, code, msg, headers)
        result.status = code
        return result


def get_mimetype(url):
    try:
        request = urllib2.Request(url, headers={'User-Agent': "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:11.0) Gecko/20100101 Firefox/11.0"})
        connection = urllib2.urlopen(request)
        mimetype = connection.info().getheader('Content-Type').strip().replace('"', '')
        try:
            opener = urllib2.build_opener(SmartRedirectHandler())
            f = opener.open(url)
            status = f.status
            url = f.url
        except:
            status = 200
            url = url
    except:
        mimetype = ''
        status = ''

    return (mimetype, status, url)


def uniquify(seq):
    seen = set()
    seen_add = seen.add
    return [ x for x in seq if x not in seen and not seen_add(x)]


def gravatar_url(email, size):
    import urllib
    import hashlib
    email_hash = hashlib.md5(email.lower()).hexdigest()
    #default_image = urllib.quote(settings.MEDIA_URI + settings.GRAVATAR['default_image'], safe='')
    default_image = urllib.quote(settings.GRAVATAR['default_image'], safe='')
    return settings.GRAVATAR['url'] % (email_hash, size, default_image)


#def get_file_type_from_extension(extension):
#
#    if extension.lower() in ["doc", "docx", "docm", "dotx", "dotm"]:
#        return SourceImplementationChoices.DOC
#    elif extension.lower() in ["xlsx", "xlsm", "xls", "xltx", "xltm", "xlsb", "xlam", "xll"]:
#        return SourceImplementationChoices.XLS
#    elif extension.lower() in ["odt"]:
#        return SourceImplementationChoices.ODT
#    elif extension.lower() in ["ods"]:
#        return SourceImplementationChoices.ODS
#    elif extension.lower() in ["pdf"]:
#        return SourceImplementationChoices.PDF
#    elif extension.lower() in ["html", "htm"]:
#        return SourceImplementationChoices.HTML
#    elif extension.lower() in ["txt"]:
#        return SourceImplementationChoices.TXT
#    elif extension.lower() in ["csv"]:
#        return SourceImplementationChoices.CSV
#    elif extension.lower() in ["xml"]:
#        return SourceImplementationChoices.XML
#    elif extension.lower() in ["kml"]:
#        return SourceImplementationChoices.KML
#    elif extension.lower() in ["kmz"]:
#        return SourceImplementationChoices.KMZ
#    elif extension.lower() in ["png", "jpg", "jpeg", "gif"]:
#        return SourceImplementationChoices.IMAGE
#    elif extension.lower() in ["zip", "gz", "tar"]:
#        return SourceImplementationChoices.ZIP





#def update_dashboard_widgets_and_revisions(widgets):
#
#   for wdgt in widgets:
#       order = wdgt.order
#       dashboard_widgets = DashboardWidget.objects.filter(order__gt=order, dashboard_revision__id=wdgt.dashboard_revision.id)
#       for widget in dashboard_widgets:
#           order = widget.order - 1
#           widget.order   = order
#           widget.save()
#
#   widgets.delete()


def set_dataset_impl_type_nice(item):
    impl_type_nice = unicode(SOURCE_IMPLEMENTATION_CHOICES[int(item)][1])
    return impl_type_nice


def filters_to_model_fields(filters):
    result = dict()

    result['impl_type'] = filters.get('type')
    result['category__categoryi18n__name'] = filters.get('category')
    result['dataset__user__nick'] = filters.get('author')
    result['status'] = filters.get('status')

    return result


def unset_visualization_revision_nice(item):
    new_item = dict()
    new_item['dataset__user__nick'] = item.get('author_filter')
    if item.get('status_filter'):
        new_item['status'] = []
        for x in item.get('status_filter'):
            new_item['status'].append([status[0] for status in STATUS_CHOICES if status[1] == x][0])

    return new_item


def remove_duplicated_filters(list_of_resources):
    removed = dict()
    removed['status_filter'] = set([x.get('status') for x in list_of_resources])
    removed['type_filter'] = set([x.get('impl_type') for x in list_of_resources])
    removed['category_filter'] = set([x.get('category__categoryi18n__name') for x in list_of_resources])
    removed['author_filter'] = set([x.get('dataset__user__nick', '') for x in list_of_resources])
    removed['author_filter'] = removed['author_filter'].union(set([x.get('datastream__user__nick', '') for x in list_of_resources]))
    return removed


#def datatable_ordering_helper(query, col_number, ascending, order_columns):
#    col_name = order_columns[col_number]
#    if col_name:
#        if not ascending:
#            col_name = '-'+order_columns[col_number]
#        query = query.order_by(col_name)
#    return query


def generate_ajax_form_errors(form):
    errors = []
    for (k,v) in form.errors.iteritems():
        if k != '__all__':
            k = unicode(form.fields[k].label) + ': '
        else:
            k = ''
        errors.append("%s%s" % (k, v))
    return errors


def build_permalink(p_view_name, p_end_point='', p_is_absolute = False):

    l_query = ''
    if p_end_point.startswith('&'):
        l_query = '?' + p_end_point[1:]

    l_domain = ''
    if p_is_absolute:
        l_domain = settings.BASE_URI

    l_url = reverse(p_view_name)

    return l_domain + l_url + l_query

def add_domains_to_permalinks(resources):
    from core.models import Preference
    accounts_ids = [ item['account_id'] for item in resources ]
    accounts_ids = uniquify(accounts_ids)
    accounts_domains = Preference.objects.values_list('account_id', 'value', 'key').filter(Q(key='account.domain') | Q(key='account.name'), account__in = accounts_ids)

    r = {}
    for account_id, value, key in accounts_domains:
        if r.has_key(account_id):
            r[account_id][key] = value
        else:
            r[account_id] = {key: value}

    for resource in resources:
        account_id = resource['account_id']
        if r.has_key(account_id):
            account_domain = r[account_id]['account.domain']
            resource['permalink'] = 'http://' + account_domain + resource['permalink']
            resource['account_name'] = r[account_id]['account.name']