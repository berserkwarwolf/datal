# -*- coding: utf-8 -*-
import operator
import logging

from django.db.models import Q, F

from core import settings
from core.daos.resource import AbstractVisualizationDBDAO
from core.models import VisualizationRevision, VisualizationHits
from core.exceptions import SearchIndexNotFoundException
from core.lib.searchify import SearchifyIndex
from core.lib.elastic import ElasticsearchIndex
from core.choices import STATUS_CHOICES
from datetime import date, timedelta

class VisualizationDBDAO(AbstractVisualizationDBDAO):
    def __init__(self):
        pass

    def create(self, visualization=None, user=None, collect_type='', impl_details=None, **fields):
        pass

    def get(self, language, visualization_id=None, visualization_revision_id=None):
        pass

    def query_childs(self, visualization_id, language):
        pass

    def update(self, visualization_revision, changed_fields, **fields):
        pass

    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):
        """ Consulta y filtra las visualizaciones por diversos campos """

        query = VisualizationRevision.objects.filter(
            id=F('visualization__last_revision'),
            visualization__user__account=account_id,

            visualization__datastream__last_revision__category__categoryi18n__language=language
        )

        if exclude:
            query.exclude(**exclude)

        if filter_name:
            query = query.filter(visualizationi18n__title__icontains=filter_name)

        if filters_dict:
            predicates = []
            for filter_class, filter_value in filters_dict.iteritems():
                if filter_value:
                    predicates.append((filter_class + '__in', filter_value))
            q_list = [Q(x) for x in predicates]
            if predicates:
                query = query.filter(reduce(operator.and_, q_list))

        total_resources = query.count()
        query = query.values(
                             'status',
                             'id',
                             'visualization__id',
                             'visualization__guid',
                             'visualization__user__nick',
                             'visualization__last_revision_id',
                             'visualization__datastream__id',
                             'visualization__datastream__last_revision__id',
                             'visualization__datastream__last_revision__category__id',
                             'visualization__datastream__last_revision__category__categoryi18n__name',
                             'visualization__datastream__last_revision__datastreami18n__title',
                             'visualizationi18n__title',
                             'visualizationi18n__description', 'created_at', 'visualization__user__id',

                             )

        query = query.order_by(sort_by)

        # Limit the size.
        nfrom = page * itemsxpage
        nto = nfrom + itemsxpage
        query = query[nfrom:nto]

        return query, total_resources

    def query_filters(self, account_id=None, language=None):
        """
        Reads available filters from a resource array. Returns an array with objects and their
        i18n names when available.
        """
        query = VisualizationRevision.objects.filter(
            id=F('visualization__last_revision'),
            visualization__user__account=account_id,
            visualizationi18n__language=language,
            visualization__datastream__last_revision__category__categoryi18n__language=language
        )

        query = query.values('visualization__user__nick', 'status',
                             'visualization__datastream__last_revision__category__categoryi18n__name')

        filters = set([])

        for res in query:
            status = res.get('status')

            filters.add(('status', status,
                unicode(STATUS_CHOICES[status])
                ))
            if 'visualization__datastream__last_revision__category__categoryi18n__name' in res:
                filters.add(('category', res.get('visualization__datastream__last_revision__category__categoryi18n__name'),
                    res.get('visualization__datastream__last_revision__category__categoryi18n__name')))
            if res.get('visualization__user__nick'):
                filters.add(('author', res.get('visualization__user__nick'),
                    res.get('visualization__user__nick')))

        return [{'type':k, 'value':v, 'title':title} for k,v,title in filters]

class VisualizationHitsDAO():
    """class for manage access to Hits in DB and index"""

    def __init__(self, visualization):
        self.visualization=visualization
        self.search_index = ElasticsearchIndex()
        self.logger=logging.getLogger(__name__)

    def add(self,  channel_type):
        """agrega un hit al datastream. """

        try:
            hit=VisualizationHits.objects.create(visualization_id=self.visualization.visualization_id, channel_type=channel_type)
        except IntegrityError:
            # esta correcto esta excepcion?
            raise VisualizationNotFoundException()

        self.logger.info("VisualizationHitsDAO hit! (guid: %s)" % ( self.datastream.guid))

        # armo el documento para actualizar el index.
        doc={'docid':"DS::%s" % self.visualization.guid,
                "type": "ds",
                "script": "ctx._source.fields.hits+=1"}

        return self.search_index.update(doc)

    def count(self):
        return VisualizationHits.objects.filter(visualization_id=self.visualization.visualization_id).count()
