import json
import re
import unicodedata
import urllib2
from django.conf import settings
from django.db.models.sql.aggregates import Aggregate
from django.template.defaultfilters import slugify as django_slugify
from datetime import date
from core.primitives import PrimitiveComputer
from babel import numbers, dates
from django.core.validators import RegexValidator
from datetime import timedelta
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _
from core.choices import SourceImplementationChoices, STATUS_CHOICES, SOURCE_IMPLEMENTATION_CHOICES, CHANNEL_TYPES
from operator import itemgetter

comma_separated_word_list_re        = re.compile('^[\w,]+$')
validate_comma_separated_word_list  = RegexValidator(comma_separated_word_list_re, _(u'Enter only words separated by commas.'), 'invalid')


def get_domain_with_protocol(app, protocol = 'http'):
    #if app == 'workspace':
    #    protocol = 'https'
    return protocol + '://' + settings.DOMAINS[app]

class Day(Aggregate):
    """Custom aggregator
    """
    sql_function = 'DATE'
    sql_template = "%(function)s(%(field)s)"

    def __init__(self, lookup, **extra):
        self.lookup = lookup
        self.extra = extra

    def _default_alias(self):
        return '%s__%s' % (self.lookup, self.__class__.__name__.lower())
    default_alias = property(_default_alias)

    def add_to_query(self, query, alias, col, source, is_summary):
        super(Day, self).__init__(col, source, is_summary, **self.extra)
        query.aggregate_select[alias] = self

def next(p_iterator, p_default=None):
    try:
        l_next = p_iterator.next()
    except StopIteration, l_error:
        l_next = p_default

    return l_next

def clean_string(p_string):
    p_string = unicodedata.normalize('NFKD', p_string).encode('ascii', 'ignore')
    p_string = re.sub('[^a-zA-Z0-9]+', '-', p_string.strip())
    p_string = re.sub('\-+', '-', p_string)
    p_string = re.sub('\-$', '', p_string)
    return p_string

def format_datetime(seconds, strformat="dd/mm/yyyy", strlocale="en_US"):
    try:
        # We need MILISECONDS but sometimes we receive seconds
        if seconds > 1000000000000: #ejemplos 1.399.488.910 | 1.399.047.696.818
            seconds = seconds/1000
        import datetime
        #REQUIRE sudo pip install babel
        myutc = datetime.datetime.utcfromtimestamp(seconds)
        #some patterns are differents from JS to python babel
        strformat = strformat.replace("DD", "EEEE").replace("D", "E").replace("yy", "Y")
        if strformat.find("MM") > -1:
            strformat = strformat.replace("MM", "MMMM")
        elif strformat.find("M") > -1:
            strformat = strformat.replace("M", "MMM")
        else:
            strformat = strformat.replace("m", "L")
        res = dates.format_datetime(myutc, format=strformat, locale=strlocale)
    except:
        #maybe TODO datetime.datetime.utcfromtimestamp(seconds/1000).strftime(strformat)
        import sys
        err = str(sys.exc_info())
        res = str(seconds) + " error " + err

    return res

def format_number_ms(number, strformat="#,###.##", strlocale="en_US", currency="USD"):
    """
    Apply the Locale Data Markup Language Specification: http://unicode.org/reports/tr35/tr35-numbers.html#Number_Format_Patterns
    Just Babel library do that on python: http://babel.pocoo.org/docs/numbers/ / https://github.com/mitsuhiko/babel
    """
    #REQUIRE sudo pip install babel
    #if not unicode(number).isnumeric():
    #    return number #False

    if number == "": # empty strings are BAD
        return 0
    if strformat == "":
        return number
    #maybe babe is not installed
    try:
        if (strformat.find("$") > -1 or strformat.find(u"\u00A4") > -1 or currency == ""):
            # strformat = unicode(strformat.replace("$", u"\u00A4"))
            res = numbers.format_currency(float(number), currency, format=strformat, locale=strlocale)
        else:
            res = numbers.format_decimal(float(number), format=strformat, locale=strlocale)
    except:
        import sys
        err = str(sys.exc_info())
        res = str(number) + " error " + err

    return res

def i18nize(l_cell, return_just_value = True):
    """
    apply the format requested. Cell is a common element from core.engine.invoke array
    Sometimes returns just the value of the cell o full cell
    """

    #On numbers and dates always check
    #l_cell['fLocale'] and l_cell['fPattern']
    has_display_format = False
    fPattern = None # "#,###.00"
    fLocale = None
    fCurrency = None

    if l_cell.get('fDisplayFormat', False):
        has_display_format = True
        if l_cell['fDisplayFormat'].get('fPattern',False):
            fPattern = l_cell['fDisplayFormat']['fPattern']
        if l_cell['fDisplayFormat'].get('fLocale',False):
            #sometimes locale come as en,us and it's wrong. We need en_US
            fLocale = l_cell['fDisplayFormat']['fLocale'].replace(",","_")
        if l_cell['fDisplayFormat'].get('fCurrency',False):
            fCurrency = l_cell['fDisplayFormat']['fCurrency']

    if l_cell.get('fStr', False) and unicode(l_cell['fStr']).isnumeric() and has_display_format:
        l_cell['fNum'] = l_cell['fStr']
        l_cell['fType'] = 'NUMBER'

    if l_cell['fType'] == 'NUMBER':
        dat = l_cell['fNum'] #.encode('utf-8', 'ignore')
        #dat = str(dat) + " // " + fPattern + " // " + fLocale + " // " + str(format_number_ms(fPattern, dat, fLocale))
        if has_display_format:
            dat = format_number_ms(dat, fPattern, fLocale, fCurrency)
        else:
            dat = format_number_ms(dat)
        ret = dat
    elif l_cell['fType'] == 'DATE':
        #transform seconds to real date in expected format
        if has_display_format:
            vdate = format_datetime(l_cell['fNum'], fPattern, fLocale)
        else:
            vdate = l_cell['fNum']
        ret = vdate

    elif l_cell['fType'] == 'LINK':
        cellval = l_cell['fStr'].encode('utf-8', 'ignore')
        cellval = "<a target='_blank' href='%s'>%s</a>" % (l_cell['fUri'].encode('utf-8', 'ignore'), cellval)
        ret = cellval

    else:
        cellval = l_cell['fStr'].encode('utf-8', 'ignore')
        cellval = re.sub(r'(<([^>]+)>)',' ', cellval) # in javascript was /(<([^>]+)>)/ig
        ret = cellval

    if not return_just_value:
        ret = l_cell
    return ret

def jsonParseFormats(p_response, p_page = '', p_limit =''):
    """ apply format as data_source says"""

    try:
        p_response = json.loads(p_response)
    except:
        return p_response

    if p_response['fType']=='ARRAY':
        l_i = 0
        for l_row_number in range(0, p_response['fRows']):
            for l_column_number in range(0, p_response['fCols']):
                l_cell = p_response['fArray'][l_i]
                # TRANSFORM DE DATA
                p_response['fArray'][l_i] = i18nize(l_cell, False)
                l_i = l_i + 1

    return json.dumps(p_response)

def jsonToGrid(p_response, p_page = '', p_limit =''):
    """ p_response is a core.engine.invoke resultset """
    l_lists = {}
    l_hasHeader = False
    l_noMoreHeaders = False

    try:
        p_response = json.loads(p_response)
    except:
        return '{"page": 1, "rows": [], "total":1}'

    l_lists["page"] = p_page
    l_lists["total"] = p_response['fLength']
    l_lists["rows"] = []

    if p_response['fType']=='ARRAY':
        l_i = 0
        l_row_i = 0
        for l_row_number in range(0, p_response['fRows']):
            l_row  = {}
            l_row["id"] = str(l_i)
            l_row["cell"] = []
            for l_column_number in range(0, p_response['fCols']):
                l_cell = p_response['fArray'][l_i]

                # TRANSFORM DE DATA
                l_row["cell"].append(i18nize(l_cell))

                if l_cell.has_key('fHeader') and l_noMoreHeaders == False:
                    l_hasHeader = True
                l_i = l_i + 1

            l_row_i = l_row_i + 1

            if l_hasHeader == False:
                l_lists["rows"].append(l_row)
            else:
                l_hasHeader = False
                l_noMoreHeaders = True

    return json.dumps(l_lists)

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

def is_bot(request):
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    for bot in settings.BOTS:
        if bot in user_agent:
            return True
    return False

def get_meta_data_dict(metadata):
    if metadata:
        try:
            meta = json.loads(metadata)
        except ValueError:
            pass
        else:
            try:
                meta = meta['field_values']
            except:
                #import logging
                #logger = logging.getLogger(__name__)
                #logger.error("Fail to get field values %s -- %s" % (metadata, str(meta)))
                meta = []
            d = {}
            for item in meta:
                d.update(item)
            return d
    return {}

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
    default_image = urllib.quote("http://www.junar.com/" + settings.GRAVATAR['default_image'], safe='')
    return settings.GRAVATAR['url'] % (email_hash, size, default_image)

def get_file_type_from_extension(extension):

    if extension.lower() in ["doc", "docx", "docm", "dotx", "dotm"]:
        return SourceImplementationChoices.DOC
    elif extension.lower() in ["xlsx", "xlsm", "xls", "xltx", "xltm", "xlsb", "xlam", "xll"]:
        return SourceImplementationChoices.XLS
    elif extension.lower() in ["odt"]:
        return SourceImplementationChoices.ODT
    elif extension.lower() in ["ods"]:
        return SourceImplementationChoices.ODS
    elif extension.lower() in ["pdf"]:
        return SourceImplementationChoices.PDF
    elif extension.lower() in ["html", "htm"]:
        return SourceImplementationChoices.HTML
    elif extension.lower() in ["txt"]:
        return SourceImplementationChoices.TXT
    elif extension.lower() in ["csv"]:
        return SourceImplementationChoices.CSV
    elif extension.lower() in ["xml"]:
        return SourceImplementationChoices.XML
    elif extension.lower() in ["kml"]:
        return SourceImplementationChoices.KML
    elif extension.lower() in ["kmz"]:
        return SourceImplementationChoices.KMZ
    elif extension.lower() in ["png", "jpg", "jpeg", "gif"]:
        return SourceImplementationChoices.IMAGE
    elif extension.lower() in ["zip", "gz", "tar"]:
        return SourceImplementationChoices.ZIP

def get_domain(account_id):
    try:
        account_domain = Preference.objects.values('value').get(key='account.domain', account = account_id)['value']
        account_domain = 'http://' + account_domain
    except Preference.DoesNotExist:
        account_domain = get_domain_with_protocol('microsites')
    return account_domain


def get_domain_by_request(request, default_domain = ''):
    """ Copy of core/httpy.py/get_domain because duplicates name of api/heplers/get_domain
    get the domain of this request """

    domain = request.META.get('HTTP_HOST', None)
    if domain is None:
        domain = request.META.get('SERVER_NAME', None)
        if domain is None:
            domain = default_domain
    return domain

def get_domain_by_account_id(account_id):
    """ Copy of api/heplers/get_domain because duplicates name of core/httpy.py/get_domain
    get the domain of this request """
    try:
        account_domain = Preference.objects.values('value').get(key='account.domain', account = account_id)['value']
        account_domain = 'http://' + account_domain
    except Preference.DoesNotExist:
        account_domain = get_domain_with_protocol('microsites')
    return account_domain


def set_role(user):
    try:
        Role.objects.get(user=user['id'], code='ao-account-admin')
    except Role.DoesNotExist:
        try:
            Role.objects.get(user=user['id'], code='ao-publisher')
        except Role.DoesNotExist:
            try:
                Role.objects.get(user=user['id'], code='ao-enhancer')
            except Role.DoesNotExist:
                pass
            else:
                user['role'] = 'ao-enhancer'
        else:
            user['role'] = 'ao-publisher'
    else:
        user['role'] = 'ao-account-admin'

    return user

def source_choice_filter(query, form):
    if form.cleaned_data['source_choice_filters'] != '':
        filters = form.cleaned_data['source_choice_filters']
        filter_list = []
        for filter_name in filters.split(','):
            filter_list.append(int(filter_name))
        query = query.filter(impl_type__in=filter_list)
    return query

def order_filter(query, form, order_columns, ascending):
    if form.cleaned_data['order'] != '':
        query = datatable_ordering_helper(query=query, col_number=form.cleaned_data['order'], ascending=ascending, order_columns=order_columns)
    return query

def ascending_filter(form):
    if form.cleaned_data['order_type'] == 'ascending':
        return True
    else:
        return False

def list_order_filter(query, form, order_columns, ascending):
    if form.cleaned_data['order'] != '':
        col_number=form.cleaned_data['order']
        col_name = order_columns[col_number]
        if col_name:
            query = sorted(query, key=itemgetter(col_name), reverse=not ascending)
    return query

def status_filter(query, form):
    if form.cleaned_data['status_filters'] != '':
        filters = form.cleaned_data['status_filters']
        filter_list = []
        for filter_name in filters.split(','):
            filter_list.append(filter_name)
        query = query.filter(status__in=filter_list)
    return query

def visualization_category_filter(query, form):
    if form.cleaned_data['category_filters'] != '':
        filters = form.cleaned_data['category_filters']
        filter_list = []
        for filter_name in filters.split(','):
            filter_list.append(filter_name)
        query = query.filter(visualization__datastream__datastreamrevision__category__in=filter_list)
    return query

def category_filter(query, form):
    if form.cleaned_data['category_filters'] != '':
        filters = form.cleaned_data['category_filters']
        filter_list = []
        for filter_name in filters.split(','):
            filter_list.append(filter_name)
        query = query.filter(category__in=filter_list)
    return query

def time_filter(query, form):
    end_date = date.today()
    if form.cleaned_data['week_time']:
        start_date = end_date - timedelta(days=7)
        query = query.filter(created_at__gte=start_date)
    elif form.cleaned_data['month_time']:
        start_date = end_date - timedelta(days=30)
        query = query.filter(created_at__gte=start_date)
    return query

#ugly hack, django 1.4 has not DISTINCT ON 'field' for MySQL
def unique_keys(items, field):
    seen    = set()
    uniques = []
    for item in items:
        key = item[field]
        if key not in seen:
            seen.add(key)
            uniques.append(item)

    return uniques

def try_utf8(data):
    "Returns a Unicode object on success, or None on failure"
    try:
       return data.decode('utf-8')
    except UnicodeDecodeError:
       return None

def update_dashboard_widgets_and_revisions(widgets):

   for wdgt in widgets:
       order = wdgt.order
       dashboard_widgets = DashboardWidget.objects.filter(order__gt=order, dashboard_revision__id=wdgt.dashboard_revision.id)
       for widget in dashboard_widgets:
           order = widget.order - 1
           widget.order   = order
           widget.save()

   widgets.delete()

def set_featured_dashboards_nice(item):
    item['title'] = item['dashboardrevision__dashboardi18n__title']
    del item['dashboardrevision__dashboardi18n__title']
    return item

def set_datastream_report_query_nice(item):
    item['title'] = item['datastreami18n__title']
    item['channel_type'] = unicode(CHANNEL_TYPES[int(item['datastream__datastreamhits__channel_type'])][1])
    del item['datastreami18n__title']
    del item['datastream__datastreamhits__channel_type']
    return item

def set_visualization_report_query_nice(item):
    item['title'] = item['visualization__visualizationrevision__visualizationi18n__title']
    item['channel_type'] = unicode(CHANNEL_TYPES[int(item['visualization__visualizationhits__channel_type'])][1])
    del item['visualization__visualizationrevision__visualizationi18n__title']
    del item['visualization__visualizationhits__channel_type']
    return item

def activity_stream_append_resources(user, query, field):
    for u in query:
        if user['id'] == u['id'] and field in u:
            user[field] = u[field]
            if user[field] > 0:
                user['has_resource'] = True
    return user

def set_dataset_impl_type_nice(item):
    impl_type_nice = unicode(SOURCE_IMPLEMENTATION_CHOICES[int(item)][1])
    return impl_type_nice

def unset_dataset_revision_nice(item):
    new_item = dict()

    if item.get('type_filter'):
        new_item['impl_type'] = []
        for x in item.get('type_filter'):
            new_item['impl_type'].append([impl_type[0] for impl_type in SOURCE_IMPLEMENTATION_CHOICES if impl_type[1] == x][0])

    new_item['category__categoryi18n__name'] = item.get('category_filter')
    new_item['dataset__user__nick'] = item.get('author_filter')

    if item.get('status_filter'):
        new_item['status'] = item.get('status_filter')

    return new_item
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
    removed['author_filter'] = set([x.get('dataset__user__nick') for x in list_of_resources])
    removed['author_filter'].union(set([x.get('datastream__user__nick') for x in list_of_resources]))
    removed['category_filter'] = set([x.get('category__categoryi18n__name') for x in list_of_resources])

    return removed


def datatable_ordering_helper(query, col_number, ascending, order_columns):
    col_name = order_columns[col_number]
    if col_name:
        if not ascending:
            col_name = '-'+order_columns[col_number]
        query = query.order_by(col_name)
    return query

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

def generate_index_dictionary(resources):
    index_list = []
    for resource in resources:
        if not isinstance(resource, DatasetRevision):
            if isinstance(resource, DataStreamRevision):
                key = 'DS::' + resource.datastream.guid
            elif isinstance(resource, DashboardRevision):
                key = 'DB::' + resource.dashboard.guid
            elif isinstance(resource, VisualizationRevision):
                key = 'VZ::' + resource.visualization.guid
            index_list.append(key)

    return index_list

def action_delete_cache_keys(dataset_id):
    from core.cache import Cache
    keys = []
    datastreams = DataStreamRevision.objects.filter(dataset__id=dataset_id)
    cache = Cache(db=0)
    for ds in datastreams:
        keys = cache.keys(str(ds.id) + '::*')
        keys.append(str(ds.id))
        if len(keys) > 0:
            for key in keys:
                cache.delete(key)
