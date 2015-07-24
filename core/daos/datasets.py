# -*- coding: utf-8 -*-

import time
import logging
from core.models import DatasetI18n, Dataset, DatasetRevision, Category
from core.exceptions import SearchIndexNotFoundException
from core.lib.searchify import SearchifyIndex
from core.lib.elastic import ElasticsearchIndex
from core import settings
from core.daos.resource import AbstractDatasetDBDAO
from core.builders.datasets import DatasetImplBuilderWrapper
from core.choices import CollectTypeChoices


# Para usar templates en el campo field para el indexador
from django.template import loader, Context


class DatasetDBDAO(AbstractDatasetDBDAO):
    """ class for manage access to datasets' database tables """

    def get(self, language, dataset_id=None, dataset_revision_id=None):
        pass
        
    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):
              
        pass

    def query_childs(self, dataset_id, language):
        """ Devuelve la jerarquia completa para medir el impacto """
        pass

    def create(self, dataset=None, user=None, collect_type='', impl_details=None, **fields):
        """create a new dataset if needed and a dataset_revision"""

        if dataset is None:
            # Create a new dataset (TITLE is for automatic GUID creation)
            dataset = Dataset.objects.create(user=user, type=collect_type, title=fields['title'])

        #meta_text = '{"field_values": [{"cust-dataid": "dataid-%s"}]}' % dataset.id
        if not fields.get('language', None):
            fields['language'] = user.language

        # Si estoy editando un tipo SELF_PUBLISH, no vienen los datos del archivo entonces lo recupero
        if int(collect_type) == CollectTypeChoices().SELF_PUBLISH and 'file_size' not in fields.keys():
            prev_revision = DatasetRevision.objects.filter(dataset=dataset).order_by('-id').first()
            size = prev_revision.size
            file_name = prev_revision.filename
        elif int(collect_type) == CollectTypeChoices().URL:
            size = 0
            file_name = fields['file_name']
        else:
            size = fields['file_size']
            file_name = fields['file_name']

        dataset_revision = DatasetRevision.objects.create(
            dataset=dataset,
            user_id=user.id,
            status=fields['status'],
            category=Category.objects.get(id=fields['category']),
            filename=file_name,
            end_point=fields['end_point'],
            impl_type=fields['impl_type'],
            impl_details=impl_details,
            size=size,
            license_url=fields['license_url'],
            spatial=fields['spatial'],
            frequency=fields['frequency'],
            mbox=fields['mbox']
        )

        DatasetI18n.objects.create(
            dataset_revision=dataset_revision,
            language=fields['language'],
            title=fields['title'].strip().replace('\n', ' '),
            description=fields['description'].strip(),
            notes=fields['notes'].strip().replace('\n', ' ')
        )

        dataset_revision.add_tags(fields['tags'])
        dataset_revision.add_sources(fields['sources'])

        return dataset, dataset_revision

    def update(self, dataset_revision, changed_fields, **fields):
        builder = DatasetImplBuilderWrapper(changed_fields=changed_fields, **fields).builder

        # TODO: Fix that
        #if builder.has_changed(changed_fields):
        #    # Build impl_details if necessary
        fields['impl_details'] = builder.build()

        fields['title'] = fields['title'].strip().replace('\n', ' ')
        fields['description'] = fields['description'].strip().replace('\n', ' ')
        fields['notes'] = fields['notes'].strip()

        changed_fields.append('impl_details')

        dataset_revision.update(changed_fields, **fields)

        DatasetI18n.objects.get(dataset_revision=dataset_revision, language=fields['language']).update(
            changed_fields, **fields
        )

        dataset_revision.add_tags(fields['tags'])
        dataset_revision.add_sources(fields['sources'])

        return dataset_revision


class DatasetSearchDAOFactory():
    """ select Search engine"""
    
    def create(self, dataset_revision):
        if settings.USE_SEARCHINDEX == 'searchify':
            self.search_dao = DatasetSearchifyDAO(dataset_revision)
        elif settings.USE_SEARCHINDEX == 'elasticsearch':
            self.search_dao = DatasetElasticsearchDAO(dataset_revision)

        # Dummy test
        elif settings.USE_SEARCHINDEX == 'test':
            self.search_dao = DatasetSearchIndexDAO(dataset_revision)
        else:
            raise SearchIndexNotFoundException()

        return self.search_dao

class DatasetSearchIndexDAO():
    """clase padre para las Dataset[indexador]DAO"""

    TYPE="dt"

    def __init__(self, dataset_revision):
	self.logger = logging.getLogger(__name__)
        self.dataset_revision=dataset_revision

    def add(self):
        return True
    def delete(self):
        return True

    def _get_category(self):
        return self.dataset_revision.category.categoryi18n_set.all()[0]

    def _get_i18n(self):
        return DatasetI18n.objects.get(dataset_revision=self.dataset_revision)

    def _get_type(self):
        return self.TYPE

    def _get_id(self):
        return "%s::DATASET-ID-%s" % (self.TYPE.upper(),self.dataset_revision.dataset.id)

    def _build_document(self):
	# eliminado hasta que haya facets
	#from core.models import add_facets_to_doc
	#from core.helpers import get_meta_data_dict

        category=self._get_category()
        dataseti18n = self._get_i18n()

        tags = self.dataset_revision.tagdataset_set.all().values_list('tag__name', flat=True)

        # text esta generado via un template
        text_template = loader.get_template("daos/dataset.txt")
        text_context = Context({'category': category, 'dataseti18n': dataseti18n, 'dataset_revision': self.dataset_revision, 'tags': tags})

        # el [:-1] le intenta sacar el ultimo \n que mete el render por default
        text=text_template.render(text_context)[:-1]

        document = {
                'docid' : self._get_id(),
                'fields' :
                    {'type' : self.TYPE,
                     'dataset_id': self.dataset_revision.dataset.id,
                     'datasetrevision_id': self.dataset_revision.id,
                     'title': dataseti18n.title,
                     'text': text,
                     'description': dataseti18n.description,
                     'owner_nick' : self.dataset_revision.user.nick,
                     'tags' : ','.join(tags),
                     'account_id' : self.dataset_revision.dataset.user.account.id,
                     'parameters': "",
                     'timestamp': int(time.mktime(self.dataset_revision.created_at.timetuple())),
                     'end_point': self.dataset_revision.end_point,
                    },
                'categories': {'id': unicode(category.category_id), 'name': category.name}
                }

# Eliminado hasta que haya facets
#	# Update dict with facets
#	try:
#	    document = add_facets_to_doc(self, self.dataset_revision.dataset.user.account, document)
#	except Exception, e:
#	    self.logger.error("\n\n\n------------------------------- indexable_dict ERROR: [%s]\n\n\n" % str(e))
#	
#	#document['fields'].update(get_meta_data_dict(self.dataset_revision.dataset.meta_text))

        return document

 
class DatasetSearchifyDAO(DatasetSearchIndexDAO):
    """ class for manage access to datasets' searchify documents """
    def __init__(self, dataset_revision):
        self.dataset_revision=dataset_revision
        self.search_index = SearchifyIndex()
        
    def add(self):
        self.search_index.indexit(self._build_document())
        
    def remove(self):
        self.search_index.delete_documents([self._get_id()])

class DatasetElasticsearchDAO(DatasetSearchIndexDAO):
    """ class for manage access to datasets' ElasticSearch documents """

    def __init__(self, dataset_revision):
	self.logger = logging.getLogger(__name__)
        self.dataset_revision=dataset_revision
        self.search_index = ElasticsearchIndex()
        
    def add(self):
        self.search_index.indexit(self._build_document())
        
    def remove(self):
        self.search_index.delete_documents([{"type": self._get_type(), "docid": self._get_id()}])
