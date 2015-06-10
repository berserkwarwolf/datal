# -*- coding: utf-8 -*-
from django.conf import settings
from indextank.client import ApiClient
import types, re
import logging

class SearchifyIndex():
    """ Gestor para indice searchify"""
    
    def __init__(self):
        self.api_client = ApiClient(settings.SEARCHIFY['api_url'])
        self.index = self.api_client.get_index(settings.SEARCHIFY['index'])
        
    def indexit(self, docs):
        logger = logging.getLogger(__name__)
        if not docs:    
            logger.error("Ningun documento para indexar")
            return False
        else:
            logger.info('Add to index %s' % str(docs))
            result = self.index.add_documents(docs)
            return result
        
    def count(self):
        return self.index.get_size()        
        
    def delete_documents(self, docs):
        if not docs:
            return None

        # Devuelvo true temporalmente hasta implementar Haystack
        return True

        # Comantado por falla en indextank al eliminar del indice.

        #status_code, response = self.index.delete_documents(docs)
        #if response:
        #    failed_documents = []
        #    for i in xrange(len(response)):
        #        if not response[i]['deleted']:
        #            failed_documents.append(response[i])
                    #TODO podria usarse el metodo individual self.delete_document para un segundo intento
    
        #    return len(failed_documents) == 0
        #else:
        #    return False

    def delete_document(self, doc):
        # Devuelvo true temporalmente hasta implementar Haystack
        return True

        # Comantado por falla en indextank al eliminar del indice.

        # logger = logging.getLogger(__name__)
        # values = self.index.delete_document(doc)
        # status, dummy = values or (None, None)
        # if status != '200':
            # sometimes returns NONE and was deleted OK (?)
        #     inf = "ERROR Status %s. Can't delete a searchify doc: {0}" % status
        #     logger.error(inf.format(unicode(doc)))

        # return status == '200'
