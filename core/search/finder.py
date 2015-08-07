import re
import types
import logging
from django.db import models, connection
from django.conf import settings
from django.core.paginator import InvalidPage
from django.core.urlresolvers import reverse
from core.helpers import slugify
from core import helpers, choices
from core.exceptions import SearchIndexNotFoundException


class FinderManager:

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.finder = None
        self.logger.info('FinderManager start in %s (index: %s)' % (str(settings.SEARCH_INDEX['url']), settings.SEARCH_INDEX['index']))

    def get_finder(self):
        if not self.finder:
            self.finder = self.finder_class()

        self.logger.info('FinderManager return %s finder' % self.finder)
        return self.finder

    def get_failback_finder(self):
        self.finder = self.failback_finder_class()
        return self.finder

    def search(self, *args, **kwargs):

        try:
            return self.get_finder().search(*args, **kwargs)
        except InvalidPage:
            raise
        except Exception, e:
            return self.get_failback_finder().search(*args, **kwargs)

from core.lib.elastic import ElasticsearchIndex
from core.lib.searchify import SearchifyIndex


class Finder:

    order_by = {}

    def __init__(self):

        self.logger = logging.getLogger(__name__)
        self.logger.info('New %sIndex INIT' % settings.USE_SEARCHINDEX)
        if settings.USE_SEARCHINDEX == 'searchify':
            self.index = SearchifyIndex()
        elif settings.USE_SEARCHINDEX == 'elasticsearch':
            self.index = ElasticsearchIndex()
#        elif settings.USE_SEARCHINDEX == 'test':
#            self.search_dao = DatastreamSearchDAO(datastream_revision)
        else:
            raise SearchIndexNotFoundException()

    def extract_terms_from_query(self):
        l_subqueries = re.split('\+', self.query.strip())
        l_query_terms = []

        for l_subquery in l_subqueries:
            if l_subquery:
                l_terms = re.split('"(.*?)"|', l_subquery.strip())
                l_subquery_terms = []
                for l_term in l_terms:
                    try:
                        l_clean_term = l_term.strip()
                        if l_clean_term:
                            l_subquery_terms.append(l_clean_term)
                    except:
                        pass
                l_query_terms.append(l_subquery_terms)

        # cleaning the blocked terms, unless this terms are the only terms
        l_term_count = 0
        l_terms_filtered = []
        for l_query in l_query_terms:
            l_subquery_terms = []
            for l_term in l_query:
                if l_term not in settings.SEARCH_TERMS_EXCLUSION_LIST:
                    l_subquery_terms.append(l_term)
                    l_term_count = l_term_count + 1
            l_terms_filtered.append(l_subquery_terms)

        if l_term_count:
            self.terms = l_terms_filtered
        else:
            self.terms = l_query_terms

        self.terms = [ subquery for subquery in self.terms if subquery ]

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

        l_datastream = dict (dataservice_id=id, title=title, description=p_doc['description'], parameters=l_parameters,
                             tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ], permalink=permalink,
                             type=p_doc['type'], category=p_doc['category_name'], category_name=p_doc['category_name'])

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

        l_dataset = dict (dataset_id=dataset_id, title=title, description=p_doc['description'], parameters=l_parameters,
                          tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ], permalink=permalink,
                          type=p_doc['type'])
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
        permalink = reverse('chart_manager.action_view', kwargs={'id': id, 'slug': slug})

        visualization = dict(visualization_id=id, title=title, description=p_doc['description'],
                             parameters=l_parameters, tags=[l_tag.strip() for l_tag in p_doc['tags'].split(',')],
                             permalink=permalink, type=p_doc['type'])
        return visualization

    def get_dashboard_dictionary(self, p_doc):

        id = p_doc['dashboard_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('dashboard_manager.action_view', kwargs={'id': id, 'slug': slug})

        dashboard_dict = dict (dashboard_id=id, title=title, description=p_doc['description'],
                               tags=[tag.strip() for tag in p_doc['tags'].split(',')], user_nick=p_doc['owner_nick'],
                               permalink=permalink, type = p_doc['type'])
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

    def _get_category_filters(self, category_filters, filter_key, filter_value):
        if filter_value:
            if type(filter_value) == types.ListType:
                category_filters[filter_key] = filter_value
            else:
                category_filters[filter_key] = [filter_value]

