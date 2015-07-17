import re
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

    order_by = {}

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info('New ElasticsearchFinder INIT')
        self.index = ElasticsearchIndex()

        Finder.__init__(self)

    def search(self, *args, **kwargs):

        self.query      = kwargs.get('query', '')
        self.account_id = kwargs.get('account_id')
        self.resource   = kwargs.get('resource', 'all')
        page            = kwargs.get('page', 0)
        max_results     = kwargs.get('max_results', settings.SEARCH_MAX_RESULTS)
        slice           = kwargs.get('slice', settings.PAGINATION_RESULTS_PER_PAGE)

        if page == 0:
            start = 0
            end = max_results
        else:
            end = max_results < slice and max_results or slice
            start = (page - 1) * end

        self.meta_data = kwargs.get('meta_data', {})

        self.extract_terms_from_query()

        query = self.make_query()
        self.last_query = query # for test queries
        ### CATEGORY FILTERS
        category_filters = kwargs.get('category_filters', None)
        if category_filters is None:
            category_filters = {}
            self._get_category_filters(category_filters, 'id', kwargs.get('category_id'))
            self._get_category_filters(category_filters, 'name', kwargs.get('category_name'))

        scoring = kwargs.get('scoring', 1)

        #TODO define a search function in the right place
	self.logger.info("QUERY: %s" % query)
	self.logger.info("START: %s" % start)
	self.logger.info("END: %s" % end)
	self.logger.info("category_filters: %s" % category_filters )
	self.logger.info("Scoring: %s" % scoring)
        results = self.index.es.search(index=settings.SEARCH_INDEX['index'],q=query[:-4], from_=start, size=end)
#                                    , start=start
#                                    #, length=end
#                                    #, snippet_fields=['title','text']
#                                    #, fetch_fields="*"
#                                    #, fetch_categories="*"
#                                    """
#                                    , fetch_fields=['datastream_id'
#                                                    , 'title'
#                                                    , 'category_name'
#                                                    , 'owner_nick'
#                                                    , 'tags'
#                                                    , 'dataset_id'
#                                                    , 'end_point'
#                                                    , 'type'
#                                                    , 'text'
#                                                    , 'description'
#                                                    , 'dashboard_id'
#                                                    , 'datastreamrevision_id'
#                                                    , 'parameters'
#                                                    , 'visualization_id'
#                                                    , 'timestamp'
#                                                    , 'account_id']
#                                    """
#                                    #, category_filters = category_filters
#                                    #, scoring_function = scoring
#                                    )
        docs=[]
        for i in results['hits']['hits']:
            docs.append(i['_source']['fields'])

#        print docs
        search_time     = results['took']
        facets          = {} #results['facets']
        facets[u'id']   = None
        #docs            = results['hits']['hits']



        order = kwargs.get('order', None)
        if order:
            docs = sorted(docs, key=lambda x: x[self.order_by.get(order)], reverse=(kwargs.get('order_type', 'descending') == 'descending'))

        results = []
        # for check the real results ==> results.append(docs)

        for doc in docs:
            try:
                doc['category_name'] = doc.get("category_name","UNCATEGORIZED")
                to_add = self.get_dictionary(doc)
                results.append(to_add)
                # TODO, I can't find the problem
                if doc['category_name'] == "UNCATEGORIZED":
                    logger = logging.getLogger(__name__)
                    logger.error("Can't find category on index -- %s" % str(doc))
                    
            except Exception, e:
                logger = logging.getLogger(__name__)
                logger.error('Search Elasticsearch [ERROR(%s--%s)] with doc = %s [TRACE:%s]' % (doc['type'], doc['title'], unicode(doc), repr(e)))



        return results, search_time, facets

    def _get_category_filters(self, category_filters, filter_key, filter_value):
        if filter_value:
            if type(filter_value) == types.ListType:
                category_filters[filter_key] = filter_value
            else:
                category_filters[filter_key] = [filter_value]

    def make_query(self):

        l_subqueries = []
        if self.query:

            for l_term_set in self.terms:
                l_sub_query = ''
                l_terms_or = ' OR '.join(l_term_set)
                l_terms_and = ' AND '.join(l_term_set)
                l_terms_and = '(' + l_terms_and + ')^10'
                l_sub_query = ' OR '.join([l_terms_or, l_terms_and])
                l_subqueries.append(l_sub_query)

        if len(l_subqueries) > 1:
            l_subqueries = [ '(' + l_subquery + ')' for l_subquery in l_subqueries ]

        l_indextank_query = ' AND '.join(l_subqueries)

        metadata_query = ''
        for i in self.meta_data:
            metadata_query = ' AND '.join(['%s:%s' % (i, self.meta_data[i])])

        if l_indextank_query and metadata_query:
            l_indextank_query = ' AND '.join([l_indextank_query, metadata_query])
        elif metadata_query:
            l_indextank_query = metadata_query

        # user search is here to prevent ORs ANDs bugs we put ()
        if l_indextank_query:
            l_indextank_query = '(' + l_indextank_query + ')'

        # accounts!
        if self.account_id:
            # for one account_id
            if type(self.account_id) in (types.LongType, types.IntType):
                subquery = self._get_query({'account_id': self.account_id})
                l_indextank_query = self._add_query(l_indextank_query, subquery)
            else:
                # for more than one account
                account_list = []
                for accountid in self.account_id:
                    account_list.append(self._get_query({'account_id': accountid}))
                subquery = '(' + ' OR '.join(account_list) + ')'
                l_indextank_query = self._add_query(l_indextank_query, subquery)

        # resource
        # all        -> 'AND (type:ds OR type:db OR type:chart)'
        # ds         -> 'AND type:ds'
        # [ds,chart] -> 'AND (type:ds OR type:chart)'

        # curating resource types
        if self.resource == 'all':
            self.resource = ['ds', 'db', 'chart', 'dt']

#        elif self.resource in resource_types:
#            self.resource = [self.resource]

        resource_type_query = ''
        for res in self.resource:
            subquery = self._get_query({'type': res})
            resource_type_query = self._add_query(resource_type_query, subquery, 'OR')

        if len(self.resource) > 1:
            l_indextank_query = self._add_query(l_indextank_query, '('+resource_type_query+')')
        else:
            l_indextank_query = self._add_query(l_indextank_query, resource_type_query)

        return l_indextank_query

    def get_dictionary(self, doc):
        if doc['type'] == 'ds':
            return self.get_datastream_dictionary(doc)
        elif doc['type'] == 'db':
            return self.get_dashboard_dictionary(doc)
        elif doc['type'] == 'chart':
            return self.get_visualization_dictionary(doc)
        elif doc['type'] == 'dt':
            return self.get_dataset_dictionary(doc)

    def get_datastream_dictionary(self, p_doc):

        l_parameters = []
        if p_doc['parameters']:
            import json
            l_parameters = json.loads(p_doc['parameters'])

        id = p_doc['datastream_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('datastream_manager.action_view', urlconf = 'microsites.datastream_manager.urls', kwargs={'id': id, 'slug': slug})

        l_datastream = dict (dataservice_id=id
                                , title=title
                                , description=p_doc['description']
                                , parameters=l_parameters
                                , tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ]
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return l_datastream

    def get_dataset_dictionary(self, p_doc):

        l_parameters = []
        if p_doc['parameters']:
            import json
            l_parameters = json.loads(p_doc['parameters'])

        dataset_id = p_doc['dataset_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('manageDatasets.action_view', urlconf = 'microsites.urls', kwargs={'dataset_id': dataset_id,
                                                                                               'slug': slug})

        l_dataset = dict (dataset_id=dataset_id
                                , title=title
                                , description=p_doc['description']
                                , parameters=l_parameters
                                , tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ]
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return l_dataset

    def get_visualization_dictionary(self, p_doc):

        try:
            if p_doc['parameters']:
                import json
                l_parameters = json.loads(p_doc['parameters'])
        except:
            l_parameters = []

        id = p_doc['visualization_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('chart_manager.action_view', urlconf='microsites.chart_manager.urls', kwargs={'id': id, 'slug': slug})

        visualization = dict(visualization_id=id
                                , title=title
                                , description=p_doc['description']
                                , parameters=l_parameters
                                , tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ]
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return visualization

    def get_dashboard_dictionary(self, p_doc):

        id = p_doc['dashboard_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('dashboard_manager.action_view', urlconf = 'microsites.dashboard_manager.urls', kwargs={'id': id, 'slug': slug})

        dashboard_dict = dict (dashboard_id=id
                                , title=title
                                , description=p_doc['description']
                                , tags=[ tag.strip() for tag in p_doc['tags'].split(',') ]
                                , user_nick=p_doc['owner_nick']
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return dashboard_dict

    def _get_query(self, values, boolean_operator = 'AND'):
        self._validate_boolean_operator(boolean_operator)

        query = []
        for pair in values.iteritems():
            query.append('%s:%s' % pair)
        boolean_operator_query = ' %s ' % boolean_operator
        return boolean_operator_query.join(query)

    def _add_query(self, query, subquery, boolean_operator = 'AND'):
        self._validate_boolean_operator(boolean_operator)

        if query:
            return ' '.join([query, boolean_operator, subquery])
        else:
            return subquery

    def _validate_boolean_operator(self, boolean_operator):
        boolean_operators = ['AND', '+', 'OR', 'NOT', '-']
        if boolean_operator not in boolean_operators:
            raise Exception('Boolean operator used, does not exists')
