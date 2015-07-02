# -*- coding: utf-8 -*-
import operator

from django.db.models import Q, F

from core.exceptions import SearchIndexNotFoundException
from core.models import DatastreamI18n, DataStreamRevision
from core.daos.resource import AbstractDataStreamDBDAO
from workspace import settings


class DataStreamDBDAO(AbstractDataStreamDBDAO):
    """ class for manage access to datastreams' database tables """

    def get(self, language, datastream_id=None, datastream_revision_id=None):
        """ Get full data """
        datastream_revision = datastream_id is None and \
                           DataStreamRevision.objects.select_related().get(
                               pk=datastream_revision_id, category__categoryi18n__language=language,
                               datastreami18n__language=language) or \
                           DataStreamRevision.objects.select_related().get(
                               pk=datastream__last_revision, category__categoryi18n__language=language,
                               datastreami18n__language=language)

        tags = datastream_revision.tagdatastream_set.all().values('tag__name', 'tag__status', 'tag__id')
        sources = datastream_revision.sourcedatastream_set.all().values('source__name', 'source__url', 'source__id')
        #parameters = datastream_revision.datastreamparameter_set.all().values('name', 'value') # TODO: Reveer
        parameters = []

        # Get category name
        category = datastream_revision.category.categoryi18n_set.get(language=language)
        datastreami18n = DatastreamI18n.objects.get(datastream_revision=datastream_revision, language=language)
        dataset_revision = datastream_revision.dataset.last_revision
        
        datastream = dict(
            datastream_revision_id=datastream_revision.id,
            dataset_id=datastream_revision.dataset.id,
            user_id=datastream_revision.user.id,
            author=datastream_revision.user.nick,
            account_id=datastream_revision.user.account.id,
            category_id=datastream_revision.category.id,
            category_name=category.name,
            end_point=dataset_revision.end_point,
            collect_type=dataset_revision.impl_type,
            impl_type=dataset_revision.impl_type,
            status=datastream_revision.status,
            modified_at=datastream_revision.created_at,
            meta_text=datastream_revision.meta_text,
            guid=datastream_revision.dataset.guid,
            created_at=datastream_revision.dataset.created_at,
            last_revision_id=datastream_revision.dataset.last_revision_id,
            last_published_revision_id=datastream_revision.dataset.last_published_revision_id,
            title=datastreami18n.title,
            description=datastreami18n.description,
            notes=datastreami18n.notes,
            tags=tags,
            sources=sources,
            parameters=parameters,
        )

        return datastream

    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):
        """ Consulta y filtra los datastreams por diversos campos """

        query = DataStreamRevision.objects.filter(
            id=F('datastream__last_revision'),
            datastream__user__account=account_id,
            datastreami18n__language=language,
            category__categoryi18n__language=language
        )

        if exclude:
            query.exclude(**exclude)

        if filter_name:
            query = query.filter(datastreami18n__title__icontains=filter_name)

        if filters_dict:
            predicates = []
            for filter_class, filter_value in filters_dict.iteritems():
                if filter_value:
                    predicates.append((filter_class + '__in', filter_value))
            q_list = [Q(x) for x in predicates]
            if predicates:
                query = query.filter(reduce(operator.and_, q_list))

        total_resources = query.count()
        query = query.values('datastream__user__nick', 'status', 'id', 'datastream__guid', 'category__id',
                             'datastream__id', 'category__categoryi18n__name', 'datastreami18n__title',
                             'datastreami18n__description', 'created_at', 'datastream__user__id',
                             'datastream__last_revision_id', 'dataset__last_revision__dataseti18n__title',
                             'dataset__last_revision__impl_type', 'dataset__last_revision__id'
                             )

        query = query.order_by(sort_by)

        # Limit the size.
        nfrom = page * itemsxpage
        nto = nfrom + itemsxpage
        query = query[nfrom:nto]

        return query, total_resources

    def query_childs(self, datastream_id, language):
        """ Devuelve la jerarquia completa para medir el impacto """

        related = dict(
            visualizations=dict()
        )
        return related

    def create(self, datastream=None, user=None, **fields):
        """create a new datastream if needed and a datastream_revision"""
        pass

    def update(self, datastream_revision, changed_fields, **fields):
        pass


class DatastreamSearchDAOFactory():
    """ select Search engine"""
    
    def create(self):
        if settings.USE_SEARCHINDEX == 'searchify':
            self.search_dao = DatastreamSearchifyDAO()
        else:
            raise SearchIndexNotFoundException() #TODO define this error

        return self.search_dao
        
        
class DatastreamSearchifyDAO():
    """ class for manage access to datasets' searchify documents """
    def __init__(self):
        from core.lib.indexers.searchify import SearchifyIndex
        self.search_index = SearchifyIndex()
        
    def add(self, datastream_revision):

        import time

        tags = datastream_revision.tagdataset_set.all().values_list('tag__name')
        # Get category name
        category = datastream_revision.category.categoryi18n_set.all()[0]
        datastreami18n = DatastreamI18n.objects.get(datastream_revision=datastream_revision)

        text = [datastreami18n.title, datastreami18n.description, datastream_revision.user.nick, datastream_revision.datastream.guid]
        text.extend(tags) # datastream has a table for tags but seems unused. I define get_tags funcion for dataset.
        text = ' '.join(text)

        document = {
                'docid' : "DS::" + str(datastream_revision.datastream.guid),
                'fields' :
                    {'type' : 'ds',
                     'datastream_id': datastream_revision.datastream.id,
                     'datastream__revision_id': datastream_revision.id,
                     'title': datastreami18n.title,
                     'text': text,
                     'description': datastreami18n.description,
                     'owner_nick' :datastream_revision.user.nick,
                     'tags' : ','.join(tags),
                     'account_id' : datastream_revision.datastream.account.id,
                     'parameters': "",
                     'timestamp': int(time.mktime(datastream_revision.created_at.timetuple())),
                     'end_point': datastream_revision.dataset.end_point,
                    },
                'categories': {'id': unicode(category.category_id), 'name': category.name}
                }

        # Update dict with facets
        # try:
        #     document = add_facets_to_doc(self, account, document)
        # except Exception, e:
        #     logger.error("indexable_dict ERROR: [%s]" % str(e))

        # document['fields'].update(get_meta_data_dict(datastream.meta_text))

        self.search_index.indexit(document)
        
    def remove(self, datastream_revision):
        self.search_index.delete_documents(["DS::" + str(datastream_revision.datastream.guid)])
