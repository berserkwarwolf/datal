# -*- coding: utf-8 -*-
from django.test import TestCase
from core.search.elastic import ElasticsearchFinder


class TestElasticSearch(TestCase):

    def test_animals_can_speak(self):
        es = ElasticsearchFinder()
        resource = ["ds", "dt", "db", "chart", "vt"]

        query = 'iniciativas'
        category_filters = ['finanzas']
        results, searchtime, facets = es.search(query=query,
                                                account_id=1,
                                                category_filters=category_filters)
        for result in results:
            pass
            #print result
        assert len(results) == 2