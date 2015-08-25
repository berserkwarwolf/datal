# -*- coding: utf-8 -*-
import operator

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

class VisualizationSearchDAOFactory():
    """ select Search engine"""

    def __init__(self):
        pass

    def create(self, visualization_revision):
        if settings.USE_SEARCHINDEX == 'searchify':
            self.search_dao = VisualizationSearchifyDAO(visualization_revision)
        elif settings.USE_SEARCHINDEX == 'elasticsearch':
            self.search_dao = VisualizationElasticsearchDAO(visualization_revision)
        elif settings.USE_SEARCHINDEX == 'test':
            self.search_dao = VisualizationSearchDAO(visualization_revision)
        else:
            raise SearchIndexNotFoundException()

        return self.search_dao
        
        
class VisualizationSearchDAO():
    """ class for manage access to datasets' searchify documents """

    TYPE="vz"
    def __init__(self, visualization_revision):
        self.visualization_revision=visualization_revision
        self.search_index = SearchifyIndex()

    def _get_type(self):
        return self.TYPE
    def _get_id(self):
        """ Get Tags """
        return "%s::%s" %(self.TYPE.upper(),self.visualization_revision.visualization.guid)

    def _get_tags(self):
        """ Get Tags """
        return self.visualization_revision.tagvisualization_set.all().values_list('tag__name', flat=True)

    def _get_category(self):
        """ Get category name """
        return self.visualization_revision.category.categoryi18n_set.all()[0]

    def _get_i18n(self):
        """ Get category name """
        return VisualizationI18n.objects.get(visualization_revision=self.visualization_revision)
        
    def _build_document(self):

        tags = self._get_tags()

        category = self._get_category()
        visualizationi18n = self._get_i18n()

        text = [visualizationi18n.title, visualizationi18n.description, self.visualization_revision.user.nick, self.visualization_revision.visualization.guid]
        text.extend(tags) # visualization has a table for tags but seems unused. I define get_tags funcion for dataset.
        text = ' '.join(text)

        document = {
                'docid' : self._get_id(),
                'fields' :
                    {'type' : self.TYPE,
                     'visualization_id': self.visualization_revision.visualization.id,
                     'visualization_revision_id': self.visualization_revision.id,
                     'title': visualizationi18n.title,
                     'text': text,
                     'description': visualizationi18n.description,
                     'owner_nick' :self.visualization_revision.user.nick,
                     'tags' : ','.join(tags),
                     'account_id' : self.visualization_revision.user.account.id,
                     'parameters': "",
                     'timestamp': int(time.mktime(self.visualization_revision.created_at.timetuple())),
                     'end_point': self.visualization_revision.dataset.last_published_revision.end_point,
                    },
                'categories': {'id': unicode(category.category_id), 'name': category.name}
                }

        return document


class VisualizationSearchifyDAO(VisualizationSearchDAO):
    """ class for manage access to datasets' searchify documents """
    def __init__(self, visualization_revision):
        self.visualization_revision=visualization_revision
        self.search_index = SearchifyIndex()
        
    def add(self):
        self.search_index.indexit(self._build_document())
        
    def remove(self, visualization_revision):
        self.search_index.delete_documents([self._get_id()])


