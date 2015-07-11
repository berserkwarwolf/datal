# -*- coding: utf-8 -*-
from django.conf import settings
from elasticsearch import Elasticsearch, NotFoundError
import logging

class ElasticsearchIndex():
    """ Gestor para indice elasticsearch"""
    
    def __init__(self):

        # establecemos conexión
        self.es = Elasticsearch(settings.SEARCH_INDEX['url'])

        # se crea el indice si es que no existe
        # Ignora que exista el indice
        self.es.indices.create(index=settings.SEARCH_INDEX['index'], ignore=400)
        self.logger = logging.getLogger(__name__)

        
    def indexit(self, document):
        """add document to index"""

        if document:
            self.logger.info('Elasticsearch: Agregar al index %s' % str(document))
            return self.es.index(index=settings.SEARCH_INDEX['index'], body=document, doc_type=document['fields']['type'], id=document['docid'])


        logger.error(u"Elasticsearch: Ningún documento para indexar")
        return False
        
    def count(self, doc_type=None):
        """return %d of documents in index, doc_type (opt) filter this document type"""

        if doc_type:
            return self.es.count(index=settings.SEARCH_INDEX['index'], doc_type=doc_type)['count']
        else:
            return self.es.count(index=settings.SEARCH_INDEX['index'])['count']
        
    def delete_document(self, document):
        """delete by ID"""

        try:
            output = self.es.delete(index=settings.SEARCH_INDEX['index'], id=document['docid'], doc_type=document['fields']['type'])
            return output
        except NotFoundError:
            self.logger.error("ERROR NotFound: ID %s not found in index" % document['docid'])
            return {u'found': False, u'_type': document['fields']['type'], u'_id': document['docid'], u'_version': 2, u'_index': settings.SEARCH_INDEX['index']}
        except KeyError:
            self.logger.error("ERROR: Document error (doc: %s)" % str(document))

        return False

    def __filterDeleted(self, item):
        return item['found']

    def __filterNotDeleted(self, item):
        return not item['found']

    def delete_documents(self, documents):
        """Delete from a list. Return [list(deleted), list(notdeleted)] """

        result = map(self.delete_document, documents)

        documents_deleted=filter(self.__filterDeleted,result)
        documents_not_deleted=filter(self.__filterNotDeleted,result)

        return [documents_deleted, documents_not_deleted]
