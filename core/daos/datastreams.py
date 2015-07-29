# -*- coding: utf-8 -*-
from core.exceptions import SearchIndexNotFoundException
from core import settings
from core.daos.resource import AbstractDataStreamDBDAO
from core.models import DatastreamI18n, DataStream, DataStreamRevision, Category
from core.lib.searchify import SearchifyIndex
from core.lib.elastic import ElasticsearchIndex
import time


class DataStreamDBDAO(AbstractDataStreamDBDAO):
    """ class for manage access to datastreams' database tables """

    def create(self, datastream=None, user=None, **fields):
        """create a new datastream if needed and a datastream_revision"""

        if datastream is None:
            # Create a new datastream (TITLE is for automatic GUID creation)
            datastream = DataStream.objects.create(user=user, title=fields['title'])

        if isinstance(fields['category'], int):
            fields['category'] = Category.objects.get(id=fields['category'])

        datastream_revision = DataStreamRevision.objects.create(
            datastream=datastream,
            user=user,
            dataset=fields['dataset'],
            status=fields['status'],
            category=fields['category'],
            data_source=fields['data_source'],
            select_statement=fields['select_statement']
        )

        DatastreamI18n.objects.create(
            datastream_revision=datastream_revision,
            language=fields['language'],
            title=fields['title'].strip().replace('\n', ' '),
            description=fields['description'].strip().replace('\n', ' '),
            notes=fields['notes'].strip()
        )

        datastream_revision.add_tags(fields['tags'])
        datastream_revision.add_sources(fields['sources'])
        datastream_revision.add_parameters(fields['parameters'])

        return datastream, datastream_revision

    def update(self, datastream_revision, changed_fields, **fields):
        fields['title'] = fields['title'].strip().replace('\n', ' ')
        fields['description'] = fields['description'].strip().replace('\n', ' ')
        fields['notes'] = fields['notes'].strip()

        datastream_revision.update(changed_fields, **fields)

        DatastreamI18n.objects.get(datastream_revision=datastream_revision, language=fields['language']).update(
            changed_fields,
            **fields
        )

        if 'tags' in fields:
            datastream_revision.add_tags(fields['tags'])
        if 'sources' in fields:
            datastream_revision.add_sources(fields['sources'])

        return datastream_revision

    def get(self, language, datastream_id=None, datastream_revision_id=None):
        pass
        
    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
              sort_by='-id', filters_dict=None, filter_name=None, exclude=None):

        pass

    def query_childs(self, dataset_id, language):
        """ Devuelve la jerarquia completa para medir el impacto """
        pass
        
class DatastreamSearchDAOFactory():
    """ select Search engine"""
    
    def create(self, datastream_revision):
        if settings.USE_SEARCHINDEX == 'searchify':
            self.search_dao = DatastreamSearchifyDAO(datastream_revision)
        elif settings.USE_SEARCHINDEX == 'elasticsearch':
            self.search_dao = DatastreamElasticsearchDAO(datastream_revision)
        elif settings.USE_SEARCHINDEX == 'test':
            self.search_dao = DatastreamSearchDAO(datastream_revision)
        else:
            raise SearchIndexNotFoundException()

        return self.search_dao
        
        
class DatastreamSearchDAO():
    """ class for manage access to datasets' searchify documents """

    TYPE="ds"
    def __init__(self, datastream_revision):
        self.datastream_revision=datastream_revision
        self.search_index = SearchifyIndex()

    def _get_type(self):
        return self.TYPE
    def _get_id(self):
        """ Get Tags """
        return "%s::%s" %(self.TYPE.upper(),self.datastream_revision.datastream.guid)

    def _get_tags(self):
        """ Get Tags """
        return self.datastream_revision.tagdatastream_set.all().values_list('tag__name', flat=True)

    def _get_category(self):
        """ Get category name """
        return self.datastream_revision.category.categoryi18n_set.all()[0]

    def _get_i18n(self):
        """ Get category name """
        return DatastreamI18n.objects.get(datastream_revision=self.datastream_revision)
        
    def _build_document(self):

        tags = self._get_tags()

        category = self._get_category()
        datastreami18n = self._get_i18n()

        text = [datastreami18n.title, datastreami18n.description, self.datastream_revision.user.nick, self.datastream_revision.datastream.guid]
        text.extend(tags) # datastream has a table for tags but seems unused. I define get_tags funcion for dataset.
        text = ' '.join(text)

        document = {
                'docid' : self._get_id(),
                'fields' :
                    {'type' : self.TYPE,
                     'datastream_id': self.datastream_revision.datastream.id,
                     'datastream__revision_id': self.datastream_revision.id,
                     'title': datastreami18n.title,
                     'text': text,
                     'description': datastreami18n.description,
                     'owner_nick' :self.datastream_revision.user.nick,
                     'tags' : ','.join(tags),
                     'account_id' : self.datastream_revision.user.account.id,
                     'parameters': "",
                     'timestamp': int(time.mktime(self.datastream_revision.created_at.timetuple())),
                     'end_point': self.datastream_revision.dataset.last_published_revision.end_point,
                    },
                'categories': {'id': unicode(category.category_id), 'name': category.name}
                }

        return document
        
class DatastreamSearchifyDAO(DatastreamSearchDAO):
    """ class for manage access to datasets' searchify documents """
    def __init__(self, datastream_revision):
        self.datastream_revision=datastream_revision
        self.search_index = SearchifyIndex()
        
    def add(self):
        self.search_index.indexit(self._build_document())
        
    def remove(self, datastream_revision):
        self.search_index.delete_documents([self._get_id()])

class DatastreamElasticsearchDAO(DatastreamSearchDAO):
    """ class for manage access to datasets' elasticsearch documents """

    def __init__(self, datastream_revision):
        self.datastream_revision=datastream_revision
        self.search_index = ElasticsearchIndex()
        
    def add(self):
        self.search_index.indexit(self._build_document())
        
    def remove(self):
        self.search_index.delete_documents([{"type": self._get_type(), "docid": self._get_id()}])
