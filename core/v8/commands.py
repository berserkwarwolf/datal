# -*- coding: utf-8 -*-

from django.conf import settings
from core.http import get_domain_with_protocol
from django.core.cache import cache
from django.conf import settings
from core.v8.factories import *

from django.forms.formsets import formset_factory
import memcache
import urllib
import logging



class EngineCommand(object):
    endpoint = 'defalt_endpoint'
    logger = logging.getLogger(__name__)
    
    def __init__(self, reourse_type, query):

        self.reourse_type = reourse_type
        self.query = query

        self.key_prefix = self._get_cache_key()

    def _get_cache_key(self):
        params=str(hash(frozenset(sorted(self.query))))
        return ":".join([type(self).__name__, params]) 

    def _get_url(self):
        return get_domain_with_protocol('engine') + self.endpoint

    def _request(self, query, method = 'GET'):
        url = self._get_url()
        response = None

        try:
            params = urllib.urlencode(query)
            self.logger.info("URL: %s Params: %s" %(url, params))

            try:
                if method == 'GET':
                    response = urllib.urlopen(url + '?' + params)
                elif method == 'POST':
                    response = urllib.urlopen(url, params)
            except Exception, e:
                self.logger.error('Error trying to access to %s | %s (%s) ' % (url, str(params), str(e)))
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

    def run(self):
        result = cache.get(self.key_prefix)
        if result:
            return result

        try:
            answer = self._request(self.query)
            if answer:
                cache.set(self.key_prefix, answer, 60)

                return answer
            return '{"Error":"No invoke"}', "application/json; charset=UTF-8"
        except Exception, e:
            self.logger.debug(e)
            raise


class EngineInvokeCommand(EngineCommand):
    endpoint = settings.END_POINT_SERVLET

class EngineChartCommand(EngineCommand):
    endpoint = settings.END_POINT_CHART_SERVLET

class EnginePreviewChartCommand(EngineCommand):
    endpoint = settings.END_POINT_CHART_PREVIEWER_SERVLET

class EngineLoadCommand(EngineCommand):
    endpoint = settings.END_POINT_LOADER_SERVLET

class EnginePreviewCommand(EngineCommand):
    endpoint = settings.END_POINT_PREVIEWER_SERVLET

