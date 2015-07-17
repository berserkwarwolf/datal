import re
import types
import logging
from django.db import models, connection
from django.conf import settings
from django.core.paginator import InvalidPage
from django.core.urlresolvers import reverse
from core.helpers import slugify
from core import helpers, choices


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


class Finder:
    def __init__(self):
        pass

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

