from django.conf import settings
from core.http import get_domain_with_protocol
from core.cache import Cache
import memcache
import urllib
import logging



class Engine(object):

    def __init__(self, endpoint):
        self.endpoint = endpoint

    def get_url(self):
        return get_domain_with_protocol('engine') + self.endpoint

    def fix_params(self, filters):
        """ fix filters and other params """
       
        for key in filters.keys():
            if key.startswith('pFilter'):
                v1 = filters[key]
                filters[key] = self.parseOperator(value=v1)
            if key.startswith('uniqueBy'):
                num = key[-1:]
                filters['pUniqueBy%s' % num] = filters.get(key)
                #del filters[key]
                
        return filters

    def parseOperator(self, value):
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

    def request(self, query, method = 'GET'):
        url = self.get_url()
        response = None
        try:
            for key in query.keys():
                if key.startswith('pArgument') or key.startswith('pFilter'):
                    value = query[key]
                    query[key] = value.encode('utf-8')

            query = self.fix_params(query)
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


