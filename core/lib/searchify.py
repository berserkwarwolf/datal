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
        result = self.index.add_documents(docs)
        return result
        
    def count(self):
        return self.index.get_size()        
        
    def delete_documents(self, docs):
        logger = logging.getLogger(__name__)
        if not docs:
            return None
            
        deleted_docs = []
        for doc in docs:
            values = self.index.delete_document(doc)
            status, dummy = values or (None, None)
            if status == '200':
                deleted_docs.append(doc)
            else:
                # sometimes returns NONE and was deleted OK (?)
                inf = "ERROR Status %s. Can't delete a searchify doc: {0}" % status
                logger.error(inf.format(unicode(doc)))

        # check if all docs was removed
        doc_tries = len(docs)
        doc_deleted = len(deleted_docs)
        inf = "(%s) docs deleted from (%s) = {0}"  % (doc_deleted, doc_tries)
        logger.info(inf.format(unicode(deleted_docs)))
    
        if doc_deleted == doc_tries:
            return None # that''s what check_deleted return if not fail
    
    
        # give delete_documentS a chance ...
        logger.info("Try a multiple deletion ...")
        status_code, response = self.index.delete_documents(docs)
        if response:
            logger.info("RESP: %s" % str(response))
    
            failed_documents = []
            for i in xrange(len(response)):
                if not response[i]['deleted']:
                    failed_documents.append(response[i])
    
            if len(failed_documents) == 0:
                logger.info("All deleted OK!")
                return None
    
        logger.error("some documents failed to delete")

        return self.check_deleted_documents_from_index((docs,))

    def check_deleted_documents_from_index(self, docs):
        logger = logging.getLogger(__name__)
        if len(docs) == 0:
            logger.info('nothing to delete')
            return None
    
        search_result, ids_found = self._search(docs)
    
        if search_result: # if documents still exists I try to delete them again
            # sometimes "delete_documents_from_index" receive NONE from indextank but it was deleted
            # so, in those cases, here are no results
            logger.info("docs requeued to be deleted: %s" % (unicode(ids_found)))
            return self.delete_documents((ids_found,))
        else:
            return ids_found # if search_result == False then ids_found = None (read the _search function). It means all it's ok

    def _search(self, resources):

        search_result, local_types = self._get_search_result(resources)
    
        if search_result['matches'] > 0 or len(search_result['results']) > 0:
            ids_found = []
            for docid in search_result['results']:
                if docid in resources:
                    ids_found.append(docid)
            return (True, ids_found)
        else:
            return (False, None) 

    def _get_search_result(self, resources):

        if type(resources) == types.ListType:
            local_resources = []
            local_types = []

            for res in resources:
                int_type, new_str = self._clean_docid_str(res)
                local_resources.append(new_str)
                local_types.append(int_type)
            search_result = self.index.search(local_resources)
        else:
            local_types, new_str = self._clean_docid_str(resources)
            search_result = self.index.search(self._clean_docid_str(new_str))
        return (search_result, local_types)

    def _clean_docid_str(self, docs):
        try:
            match = re.search('^(DS|DB|VZ)(::)(.+)', docs)
            if match:
                ret_type = match.group(1)
                ret_str = match.group(3)
                return (ret_type, ret_str)
            else:
                return None
        except Exception:
            return None