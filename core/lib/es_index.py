# -*- coding: utf-8 -*-
from django.conf import settings
from elasticsearch import Elasticsearch
import logging

class ElasticsearchIndex():
    """ Gestor para indice elasticsearch"""
    
    def __init__(self):

        # establecemos conexión
        self.es = Elasticsearch(settings.SEARCH_INDEX['url'])

        # se crea el indice si es que no existe
        self.es.indices.create(index=settings.SEARCH_INDEX['index'], ignore=400)

        
    def indexit(self, document):
        logger = logging.getLogger(__name__)

        if document:
            logger.info('Elasticsearch: Agregar al index %s' % str(document))
            return self.es.index(index=settings.SEARCH_INDEX['index'], body=document, doc_type=document['fields']['type'], id=document['docid'])


        logger.error(u"Elasticsearch: Ningún documento para indexar")
        return False
        
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
