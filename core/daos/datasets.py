# -*- coding: utf-8 -*-

import time
from core.models import DatasetI18n
from core.exceptions import SearchIndexNotFoundException
from core.lib.searchify import SearchifyIndex
from core import settings
from core.daos.resource import AbstractDatasetDBDAO


class DatasetDBDAO(AbstractDatasetDBDAO):
    """ class for manage access to datasets' database tables """

    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):

        return super(DatasetDBDAO, self).query(account_id, language, page, itemsxpage, sort_by, filters_dict, filter_name, exclude)

class DatasetSearchDAOFactory():
    """ select Search engine"""
    
    def create(self):
        if settings.USE_SEARCHINDEX == 'searchify':
            self.search_dao = DatasetSearchifyDAO()
        else:
            raise SearchIndexNotFoundException()

        return self.search_dao
        
        
class DatasetSearchifyDAO():
    """ class for manage access to datasets' searchify documents """
    def __init__(self):

        self.search_index = SearchifyIndex()
        
    def add(self, dataset_revision, language):
        category = dataset_revision.category.categoryi18n_set.get(language=language)
        dataseti18n = DatasetI18n.objects.get(dataset_revision=dataset_revision, language=language)

        # DS uses GUID, but here doesn't exists. We use ID
        text = [dataseti18n.title, dataseti18n.description, dataset_revision.user.nick, str(dataset_revision.dataset.guid)]

        # datastream has a table for tags but seems unused. I define get_tags funcion for dataset.
        tags = dataset_revision.tagdataset_set.all().values_list('tag__name')        
        text.extend(tags)
        text = ' '.join(text)

        document = {
                'docid' : "DT::DATASET-ID-" + str(dataset_revision.dataset.id),
                'fields' :
                    {'type' : 'dt',
                     'dataset_id': dataset_revision.dataset.id,
                     'datasetrevision_id': dataset_revision.id,
                     'title': dataseti18n.title,
                     'text': text,
                     'description': dataseti18n.description,
                     'owner_nick' : dataset_revision.user.nick,
                     'tags' : ','.join(tags),
                     'account_id' : dataset_revision.dataset.user.account.id,
                     'parameters': "",
                     'timestamp': int(time.mktime(dataset_revision.created_at.timetuple())),
                     'end_point': dataset_revision.end_point,
                    },
                'categories': {'id': unicode(category.id), 'name': category.name}
                }

        # Update dict with facets
        # try:
        #     document = add_facets_to_doc(self, dataset.user.account, document)
        # except Exception, e:
        #     logger.error("indexable_dict ERROR: [%s]" % str(e))

        # document['fields'].update(get_meta_data_dict(dataset.meta_text))

        self.search_index.indexit(document)
        
    def remove(self, dataset_revision):
        self.search_index.delete_documents(["DT::DATASET-ID-" + str(dataset_revision.dataset.id)])
