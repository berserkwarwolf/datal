# -*- coding: utf-8 -*-
from django.conf import settings

from core.search.finder import Finder, FinderManager
import re


class ElasticsearchFinder(Finder):

    order_by = "timestamp:desc,title_lower_sort:asc,_score"

    def search(self, *args, **kwargs):

        #self.logger.info("Search arguments:\n\t[args]: %s\n\t[kwargs]: %s" % (args,kwargs))
        self.query = kwargs.get('query', '')
        self.account_id = kwargs.get('account_id')
        self.resource = kwargs.get('resource', 'all')
        page = kwargs.get('page', 0)
        max_results = kwargs.get('max_results', settings.SEARCH_MAX_RESULTS)
        slice = kwargs.get('slice', settings.PAGINATION_RESULTS_PER_PAGE)

        self.order =  kwargs.get('order')

        if self.order and self.order=='top':
            self.sort = "hits: desc"
        elif self.order and self.order=='last':
            self.sort =  "timestamp:asc"
        else:
            self.sort = self.order_by        

        if page == 0:
            start = 0
            end = max_results
        else:
            end = max_results < slice and max_results or slice
            start = (page - 1) * end

        if self.sort == "" or self.sort == "1":
            self.sort = self.order_by

        # Tengo que saber para qué se usa esto
        self.meta_data = kwargs.get('meta_data', {})
        self.category_filters = kwargs.get('category_filters', None)
        scoring = kwargs.get('scoring', 1)

        query = self.__build_query()
        #self.logger.info("Query arguments: %s (%s)" % (query, self.sort))

        results = self.index.es.search(index=settings.SEARCH_INDEX['index'],
                                       body=query,
                                       from_=start,
                                       size=end,
                                       sort=self.sort)

        # re arma los documentos incluyendo a la categorias
        docs = []
        for i in results['hits']['hits']:
            i['_source']['fields']['category'] = i['_source']['categories']
            i['_source']['fields']['docid'] = i['_source']['docid']
            docs.append(i['_source']['fields'])

        meta_data={'search_time':float(results['took'])/1000, 'count': results['hits']['total'], 'time_out': results['timed_out']}
        facets = results['facets']['type']['terms']

        results = []
        for doc in docs:
            doc['category_name'] = doc["category"]['name']
            doc['category_id'] = doc["category"]['id']
            to_add = self.get_dictionary(doc)
            results.append(to_add)

        return results, meta_data, facets

    def __build_query(self):
        #self.logger.info("El query es: %s" % self.query)

        # decide que conjunto de recursos va a filtrar
        if self.resource == "all":
            self.resource = ["ds", "dt", "db", "vz"]

        # previene un error al pasarle un string y no un LIST
        if isinstance(self.resource, str):
            self.resource = [self.resource]

        # algunas busquedas, sobre todo las federadas,
        # buscan en un list de account_id
        # Asi que si llega solo un account_id, lo mete en un list igual
        if type(self.account_id) in (type(str()), type(int()), type(long()), type(float())):
            account_ids=[int(self.account_id)]
        elif type(self.account_id) == type([]):
            account_ids=self.account_id
        else:
            #debería ir un raise?!?!?
            account_ids=self.account_id

        filters = [
            {"terms": {"account_id": account_ids}},
            {"terms": {"type": self.resource}}
        ]

        if self.category_filters:
            filters.append({"terms": {
                "categories.name": self.category_filters
            }})

        query = {
            "query": {
                "filtered": {
                    "query": {
                        "query_string": {
                            "query": "*%s*" % self.query,
                            "fields": ["title", "text"]
                        }
                    },
                    "filter": {
                        "bool": {
                            "must": filters
                        }
                    }
                }
            },
            "facets": {
                "type": {
                    "terms": {
                        "field": "categories.name"
                    }
                }
            }
        }

        return query

class ElasticFinderManager(FinderManager):

    def __init__(self):
        self.finder_class = ElasticsearchFinder
        self.failback_finder_class = ElasticsearchFinder
        FinderManager.__init__(self)
