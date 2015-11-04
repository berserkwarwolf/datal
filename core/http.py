from django.http import HttpResponse
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.models import Q
from core.choices import SourceImplementationChoices

class JSONHttpResponse(HttpResponse):
    """ A custom HttpResponse that handles the headers for our JSON responses """
    #TODO move to CORE
    def __init__(self, content):
        """ Set the headers of the response and assign it a value """
        HttpResponse.__init__(self, content)
        self['Content-Type'] = 'application/json;charset=utf-8'

def get_domain_with_protocol(app, protocol = 'http'):
    return protocol + '://' + settings.DOMAINS[app]

def get_domain(account_id):
    from core.models import Preference
    try:
        account_domain = Preference.objects.values('value').get(key='account.domain', account = account_id)['value']
        account_domain = 'http://' + account_domain
    except Preference.DoesNotExist:
        account_domain = get_domain_with_protocol('microsites')
    return account_domain

def get_domain_by_request(request, default_domain = ''):
    domain = request.META.get('HTTP_HOST', None)
    if domain is None:
        domain = request.META.get('SERVER_NAME', None)
        if domain is None:
            domain = default_domain
    return domain

def gravatar_url(email, size):
    import urllib
    import hashlib
    email_hash = hashlib.md5(email.lower()).hexdigest()
    #default_image = urllib.quote(settings.MEDIA_URI + settings.GRAVATAR['default_image'], safe='')
    default_image = urllib.quote(settings.GRAVATAR['default_image'], safe='')
    return settings.GRAVATAR['url'] % (email_hash, size, default_image)

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
    seen = set()
    seen_add = seen.add
    accounts_ids = [ x for x in accounts_ids if x not in seen and not seen_add(x)]
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
    elif extension.lower() in ["tsv"]:
        return SourceImplementationChoices.TSV    
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

def get_impl_type(mimetype, end_point):
    mimetype = mimetype.split(';')[0]
    impl_types = {
      "application/vnd.ms-xpsdocument": SourceImplementationChoices.DOC
    , "application/vnd.ms-excel": SourceImplementationChoices.XLS
    , "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": SourceImplementationChoices.XLS
    , "application/vnd.oasis.opendocument.text": SourceImplementationChoices.ODT
    , "application/vnd.oasis.opendocument.text-web": SourceImplementationChoices.ODT
    , "application/vnd.oasis.opendocument.spreadsheet": SourceImplementationChoices.ODS
    , "application/msword": SourceImplementationChoices.DOC
    , "text/html": SourceImplementationChoices.HTML
    , "text/csv": SourceImplementationChoices.TXT
    , "text/x-comma-separated-values": SourceImplementationChoices.HTML
    , "text/plain": SourceImplementationChoices.HTML
    , "application/pdf": SourceImplementationChoices.PDF
    , "application/vnd.google-earth.kml+xml": SourceImplementationChoices.KML
    , "image/jpeg": SourceImplementationChoices.IMAGE
    , "image/png": SourceImplementationChoices.IMAGE
    , "image/gif": SourceImplementationChoices.IMAGE
    , "application/zip": SourceImplementationChoices.ZIP
    , "application/x-gzip": SourceImplementationChoices.ZIP
    , "application/x-tar": SourceImplementationChoices.ZIP
    }

    try:
        return impl_types[mimetype]
    except KeyError:
        try:
            extension = end_point.split('/')[-1].split('.')[-1]
            return get_file_type_from_extension(extension)
        except KeyError:
            return None