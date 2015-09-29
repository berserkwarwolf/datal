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
    method = 'GET'
    logger = logging.getLogger(__name__)
    
    def __init__(self, query):

        # set defaults values
        self.query = self._set_defaults(query)

        self.key_prefix = self._get_cache_key()

    def _set_defaults(self, query):

        # limpia los vacios
        new_query=[]
        for item in query:
            if item[1]:
                new_query.append(item)
        
        return new_query

    def _get_cache_key(self):
        params=str(hash(frozenset(sorted(self.query))))
        return ":".join([type(self).__name__, params]) 

    def _get_url(self):
        return get_domain_with_protocol('engine') + self.endpoint

    def _request(self, query):
        url = self._get_url()
        response = None

        try:
            params = urllib.urlencode(query)
            
            self.logger.info("URL: %s Params: %s query: %s method: %s" %(url, params, query, self.method))

        
            try:
                if self.method == 'GET':
                    response = urllib.urlopen(url + '?' + params)
                elif self.method == 'POST':
                    response = urllib.urlopen(url, params)
            except Exception, e:
                self.logger.error('Error trying to access to %s | %s (%s) ' % (url, str(params), str(e)))
                raise


            if response:
                if response.getcode() == 200:
                    ret = response.read()
                    if len(response.info().getplist()) > 0:
                        mimetype = '{0}; {1}'.format(response.info().gettype(), response.info().getplist()[0])
                    else:
                        mimetype = 'application; json'
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

    def _set_defaults(self, query):
        new_query=[]
        for item in query:
            if item[0] == 'pInvertData' and item[1] == "true":
                new_query.append( ('pInvertData', "checked") )
            # validar el caso contrario de "true"
            elif item[0] == 'pInvertData':
                new_query.append( ('pInvertData', "") )
    
            elif item[0] == 'pInvertedAxis' and item[1] == "true":
                new_query.append( ('pInvertedAxis', "checked") )
            elif item[0] == 'pInvertedAxis':
                new_query.append( ('pInvertedAxis', "") )

            elif item[0] == 'pPage' and item[1]:
                new_query.append( item)

            elif item[0] == 'pLimit' and item[1]:
                new_query.append(item)

            # param que si o si deben viajar, sean nulos o no
            elif item[0] in ( 'pId', 'pType', 'pNullValueAction', 'pNullValuePreset', 'pData', 'pLabelSelection', 'pHeaderSelection'):
                new_query.append(item)

            # saliendo de los param que si o si deben viajar,
            # ahora nos fijamos los param que tengan un valor 
            elif item[1]:
                new_query.append(item)
                
        return new_query

class EngineLoadCommand(EngineCommand):
    endpoint = settings.END_POINT_LOADER_SERVLET

class EnginePreviewCommand(EngineCommand):
    endpoint = settings.END_POINT_PREVIEWER_SERVLET
    method = 'POST'
