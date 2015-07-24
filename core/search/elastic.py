# -*- coding: utf-8 -*-

import types
import logging
from django.db import models, connection
from django.conf import settings
from django.core.paginator import InvalidPage
from django.core.urlresolvers import reverse
from core.helpers import slugify
from core import helpers, choices

from core.search.finder import Finder
#from elasticsearch import Elasticsearch
from core.lib.elastic import ElasticsearchIndex


class ElasticsearchFinder(Finder):

    order_by = "title_lower_sort:asc,timestamp:asc,_score"

    def search(self, *args, **kwargs):

	self.logger.info("Search arguments:\n\t[args]: %s\n\t[kwargs]: %s" % (args,kwargs))
        self.query      = kwargs.get('query', '')
        self.account_id = kwargs.get('account_id')
        self.resource   = kwargs.get('resource', 'all')
        page            = kwargs.get('page', 0)
        max_results     = kwargs.get('max_results', settings.SEARCH_MAX_RESULTS)
        slice           = kwargs.get('slice', settings.PAGINATION_RESULTS_PER_PAGE)
        self.sort      = kwargs.get('order', self.order_by)

        if page == 0:
            start = 0
            end = max_results
        else:
            end = max_results < slice and max_results or slice
            start = (page - 1) * end

        if self.sort == "":
            self.sort=self.order_by

        self.meta_data = kwargs.get('meta_data', {})

        ### CATEGORY FILTERS
        category_filters = kwargs.get('category_filters', None)
        if category_filters is None:
            category_filters = {}
            self._get_category_filters(category_filters, 'id', kwargs.get('category_id'))
            self._get_category_filters(category_filters, 'name', kwargs.get('category_name'))

        scoring = kwargs.get('scoring', 1)

        query=self.__build_query()
	self.logger.info("Query arguments: %s (%s)" % (query,self.sort))
        results = self.index.es.search(index=settings.SEARCH_INDEX['index'],body=query, from_=start, size=end, sort=self.sort)

        # re arma los documentos incluyendo a la categorias
        docs=[]
        for i in results['hits']['hits']:
            i['_source']['fields']['category']=i['_source']['categories']
            i['_source']['fields']['docid']=i['_source']['docid']
            docs.append(i['_source']['fields'])

        search_time     = float(results['took'])/1000
        facets          = results['facets']['type']['terms']

        results = []
        for doc in docs:
            doc['category_name'] = doc["category"]['name']
            doc['category_id'] = doc["category"]['id']
            to_add = self.get_dictionary(doc)
            results.append(to_add)

        return results, search_time, facets

    def __build_query(self):
        self.logger.info("El query es: %s" % self.query) 

        # decide que conjunto de recursos va a filtrar
        if self.resource == "all":
            self.resource=["ds","dt","db","chart","vt"]

        # previene un error al pasarle un string y no un LIST
        if type(self.resource) == type(str()):
            self.resource=[self.resource]

        query={"query": {
            "filtered":{
                "query" : { "query_string" : {"query": "*%s*" % self.query, "fields":["title","text"] }},
                "filter": {"bool" : { "must" :[
                    { "terms" : {"type" : self.resource} },
                    { "term" : {"account_id" : self.account_id}}
                    ]}}}},
            "facets" : { "type" : { "terms" : {"field" : "categories.name"} } } }
        return query

