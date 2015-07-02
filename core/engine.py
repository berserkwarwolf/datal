from django.conf import settings
from core.helpers import get_domain_with_protocol
from core.cache import Cache
import memcache
import urllib
import logging

def invoke(query, output=None):

    if not output:
        output = 'json'
        query['pOutput'] = output.upper()

    content_type = settings.CONTENT_TYPES.get(output)

    try:
        engine_domain = get_domain_with_protocol('engine')
        url = engine_domain + settings.END_POINT_SERVLET

        memcached = settings.MEMCACHED_ENGINE_END_POINT
        if memcached:
            engine_cache = memcache.Client(memcached, debug=0)
            if engine_cache:
                key = str(hash(frozenset(sorted(query.items()))))
                value = engine_cache.get(key)
                if value is None:
                    value, content_type = _request(query, url)
                    engine_cache.set(key, value, settings.MEMCACHED_DEFAULT_TTL)
                    return value, content_type
                else:
                    return value, content_type
            else:
                logger = logging.getLogger(__name__)
                logger.debug('No memcached client could be created. Dataview will be retrieved from engine.')

        return _request(query, url)

    except Exception, e:
        """ TOO much logging from here
        logger = logging.getLogger(__name__)
        logger.debug('{0}. Dataview will be retrieved from redis '.format(str(e)))
        """

        if output == 'json':
            if 'pFilter0' not in query:

                dataviews_cache = Cache(db=settings.CACHE_DATABASES['dataviews'])
                key = str(query.get('pId'))
                params = [ query[arg].decode('utf-8') for arg in sorted(query.keys()) if arg.startswith('pArgument')]
                if params:
                    key += u'::' + u':'.join(params)

                return dataviews_cache.get(key), content_type

        return None, content_type

#    er = format(str(e))
#    nr = '{"fType":"ARRAY","fArray":[{"fStr":"Error","fType":"TEXT","fHeader":true},{"fStr":"URL","fType":"TEXT","fHeader":true},{"fStr":"%s","fType":"TEXT"},{"fStr":"%s","fType":"TEXT"}],"fRows":2,"fCols":2,"fTimestamp":1349165269247,"fLength":75}' % (er, url)
#    return nr, "json"

def invoke_chart(query):

    content_type = settings.CONTENT_TYPES.get("json")

    try:
        engine_domain = get_domain_with_protocol('engine')
        url = engine_domain + settings.END_POINT_CHART_SERVLET
        memcached = settings.MEMCACHED_ENGINE_END_POINT
        if memcached:
            engine_cache = memcache.Client(memcached, debug=0)
            if engine_cache:
                key = str(hash(frozenset(sorted(query.items()))))

                value = engine_cache.get(key)
                if value is None:
                    value, content_type = _request(query, url)
                    engine_cache.set(key, value, settings.MEMCACHED_DEFAULT_TTL)
                    return value, content_type
                else:
                    return value, content_type
            else:
                logger = logging.getLogger(__name__)
                logger.debug('No memcached client could be created. Chart will be retrieved from engine.')

        value, content_type = _request(query, url)
        if not value:
            value = '{"error":"Sin valor para %s en URL: %s"}' % (query, url)
            content_type = "json"
        return value, content_type

    except Exception, e:
        logger = logging.getLogger(__name__)
        logger.debug(e)
        #raise e

    er = format(str(e))
    nr = '{"fType":"ARRAY","fArray":[{"fStr":"Error","fType":"TEXT","fHeader":true},{"fStr":"URL","fType":"TEXT","fHeader":true},{"fStr":"%s","fType":"TEXT"},{"fStr":"%s","fType":"TEXT"}],"fRows":2,"fCols":2,"fTimestamp":1349165269247,"fLength":75}' % (er, url)
    return nr, "json"


def load(query):
    engine_domain = get_domain_with_protocol('engine')
    url = engine_domain + settings.END_POINT_LOADER_SERVLET
    return _request(query, url)

def preview(query):
    engine_domain = get_domain_with_protocol('engine')
    url = engine_domain + settings.END_POINT_PREVIEWER_SERVLET
    return _request(query, url, method='POST')

def _request(query, url, method = 'GET'):

    response = None
    try:
        for key in query.keys():
            if key.startswith('pArgument') or key.startswith('pFilter'):
                value = query[key]
                query[key] = value.encode('utf-8')

        query = fix_params(query)
        params = urllib.urlencode(query)

        try:
            if method == 'GET':
                response = urllib.urlopen(url + '?' + params)
            elif method == 'POST':
                response = urllib.urlopen(url, params)
        except Exception, e:
            logger = logging.getLogger(__name__)
            logger.error('Error trying to access to %s | %s (%s) ' % (url, str(params), str(e)))
            raise

        if response:
            if response.getcode() == 200:
                ret = response.read()
                mimetype = '{0}; {1}'.format(response.info().gettype(), response.info().getplist()[0])
                return ret, mimetype

        raise IOError('Error code %d at %s+%s' % (response.getcode(), url, str(params)))
    finally:
        if response:
            response.close()


def fix_params(filters):
    """ fix filters and other params """
            
    for key in filters.keys():
        if key.startswith('pFilter'):
            v1 = filters[key]
            filters[key] = parseOperator(value=v1)
        if key.startswith('uniqueBy'):
            num = key[-1:]
            filters['pUniqueBy%s' % num] = filters.get(key)
            #del filters[key]
            
    return filters

def parseOperator(value):
    value = value.replace('[==]', '[0]')
    value = value.replace('[>]', '[1]')
    value = value.replace('[<]', '[2]')
    value = value.replace('[!=]', '[3]')
    value = value.replace('[contains]', '[4]')
    value = value.replace('[>=]', '[5]')
    value = value.replace('[<=]', '[6]')
    value = value.replace('[between]', '[7]')
    value = value.replace('[inlist]', '[8]')
    value = value.replace('[notcontains]', '[9]')
    value = value.replace('[notcontainsall]', '[9]')
    value = value.replace('[notbetween]', '[10]')
    value = value.replace('[notinlist]', '[11]')
    value = value.replace('[notcontainsany]', '[12]')
    value = value.replace('[containsall]', '[13]')
            
    return value