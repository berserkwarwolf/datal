# -*- coding: utf-8 -*-

import time
import logging
import operator

from django.template import loader, Context
from django.db.models import Q, F

from core.utils import slugify
from core import settings
from core.models import DatasetI18n, Dataset, DatasetRevision, Category
from core.exceptions import SearchIndexNotFoundException
from core.lib.searchify import SearchifyIndex
from core.lib.elastic import ElasticsearchIndex
from core.daos.resource import AbstractDatasetDBDAO
from core.builders.datasets import DatasetImplBuilderWrapper
from core.choices import CollectTypeChoices, SOURCE_IMPLEMENTATION_CHOICES, StatusChoices
from core.models import DataStreamRevision, VisualizationRevision

import logging

logger = logging.getLogger(__name__)

class DatasetDBDAO(AbstractDatasetDBDAO):
    """ class for manage access to datasets' database tables """
    def __init__(self):
        pass

    def get(self, language, dataset_id=None, dataset_revision_id=None, guid=None, published=True):
        """ Get full data """
        logger = logging.getLogger(__name__)
        fld_revision_to_get = 'dataset__last_published_revision' if published else 'dataset__last_revision'
        if settings.DEBUG: logger.info('Getting Dataset %s' % str(locals()))
        
        if guid:
            try:
                dataset_revision = DatasetRevision.objects.select_related().get(
                    dataset__guid=guid,
                    pk=F(fld_revision_to_get),
                    category__categoryi18n__language=language,
                    dataseti18n__language=language
                )
            except DatasetRevision.DoesNotExist:
                logger.error('Dataset Not exist GUID %s' % guid)
                raise
        elif not dataset_id:
            try:
                dataset_revision = DatasetRevision.objects.select_related().get(
                    pk=dataset_revision_id,
                    category__categoryi18n__language=language,
                    dataseti18n__language=language
                )
            except DatasetRevision.DoesNotExist:
                logger.error('DatasetRev Not exist Revision %s' % dataset_revision_id)
                raise
        else:
            try:
                dataset_revision = DatasetRevision.objects.select_related().get(
                    dataset__id=dataset_id,
                    pk=F(fld_revision_to_get),
                    category__categoryi18n__language=language,
                    dataseti18n__language=language
                )
            except DatasetRevision.DoesNotExist:
                logger.error('DatasetRev Not exist dataset_id=%d' % dataset_id)
                raise
                
        tags = dataset_revision.get_tags()
        sources = dataset_revision.get_sources()


        # Get category name
        category = dataset_revision.category.categoryi18n_set.get(language=language)
        dataseti18n = DatasetI18n.objects.get(dataset_revision=dataset_revision, language=language)

        # Muestro el link del micrositio solo si esta publicada la revision
        public_url = ''
        if dataset_revision.dataset.last_published_revision:
            domain = dataset_revision.user.account.get_preference('account.domain')
            if not domain.startswith('http'):
                domain = 'http://' + domain
            public_url = '{}/datasets/{}/{}'.format(domain, dataset_revision.dataset.id, slugify(dataseti18n.title))

        dataset = dict(
            dataset_revision_id=dataset_revision.id,
            dataset_id=dataset_revision.dataset.id,
            user_id=dataset_revision.user.id,
            user_nick=dataset_revision.user.nick,
            account_id=dataset_revision.user.account.id,
            category_id=dataset_revision.category.id,
            category_name=category.name,
            end_point=dataset_revision.end_point,
            filename=dataset_revision.filename,
            impl_details=dataset_revision.impl_details,
            impl_type=dataset_revision.impl_type,
            status=dataset_revision.status,
            size=dataset_revision.size,
            modified_at=dataset_revision.modified_at,
            meta_text=dataset_revision.meta_text,
            license_url=dataset_revision.license_url,
            spatial=dataset_revision.spatial,
            frequency=dataset_revision.frequency,
            mbox=dataset_revision.mbox,
            collect_type=dataset_revision.dataset.type,
            dataset_is_dead=dataset_revision.dataset.is_dead,
            guid=dataset_revision.dataset.guid,
            created_at=dataset_revision.dataset.created_at,
            last_revision_id=dataset_revision.dataset.last_revision_id if dataset_revision.dataset.last_revision_id else '',
            last_published_revision_id=dataset_revision.dataset.last_published_revision_id if dataset_revision.dataset.last_published_revision_id else '',
            last_published_date=dataset_revision.dataset.last_published_revision_date if dataset_revision.dataset.last_published_revision_date else '',
            title=dataseti18n.title,
            description=dataseti18n.description,
            notes=dataseti18n.notes,
            tags=tags,
            sources=sources,
            public_url=public_url,
            slug=slugify(dataseti18n.title),
        )
        dataset.update(self.query_childs(dataset_revision.dataset.id, language))

        return dataset
        
    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):

        """ Query for full dataset lists"""

        query = DatasetRevision.objects.filter(id=F('dataset__last_revision'), dataset__user__account=account_id,
                                               dataseti18n__language=language, category__categoryi18n__language=language
                                               )
        if exclude:
            query.exclude(**exclude)

        if filter_name:
            query = query.filter(dataseti18n__title__icontains=filter_name)

        if filters_dict:
            predicates = []
            for filter_class, filter_value in filters_dict.iteritems():
                if filter_value:
                    predicates.append((filter_class + '__in', filter_value))
            q_list = [Q(x) for x in predicates]
            if predicates:
                query = query.filter(reduce(operator.and_, q_list))

        total_resources = query.count()

        query = query.values('filename', 'dataset__user__name', 'dataset__user__nick', 'dataset__type', 'status', 'id', 'impl_type',
                             'dataset__guid', 'category__id', 'dataset__id', 'id', 'category__categoryi18n__name',
                             'dataseti18n__title', 'dataseti18n__description', 'created_at', 'modified_at', 'size', 'end_point',
                             'dataset__user__id', 'dataset__last_revision_id')
        """
        query = query.extra(select={'author':'ao_users.nick','user_id':'ao_users.id','type':'ao_datasets.type',
            'guid':'ao_datasets.guid','category_id':'ao_categories.id', 'dataset_id':'ao_datasets.id',
            'category':'ao_categories_i18n.name', 'title':'ao_dataset_i18n.title',
            'description':'ao_dataset_i18n.description',
            'last_revision_id':'ao_datasets.last_revision_id'}).values('author','user_id','filename','type',
                'status','id','impl_type','guid', 'category_id','dataset_id','category','title',
                'description','last_revision_id','created_at','size','end_point')
        """
        query = query.order_by(sort_by)

        # Limit the size.
        nfrom = page * itemsxpage
        nto = nfrom + itemsxpage
        query = query[nfrom:nto]

        return query, total_resources

    def query_childs(self, dataset_id, language):
        """ Devuelve la jerarquia completa para medir el impacto """

        related = dict()
        related['datastreams'] = DataStreamRevision.objects.select_related().filter(
            dataset__id=dataset_id,
            datastreami18n__language=language
        ).values('status', 'id', 'datastreami18n__title', 'datastreami18n__description', 'datastream__user__name', 'datastream__user__nick',
                 'created_at', 'modified_at', 'datastream__last_revision', 'datastream__guid', 'datastream__id',
                 'datastream__last_published_revision')

        related['visualizations'] = VisualizationRevision.objects.select_related().filter(
            visualization__datastream__datastreamrevision__dataset__id=dataset_id,
            visualizationi18n__language=language
        ).values('status', 'id', 'visualizationi18n__title', 'visualizationi18n__description',
                 'visualization__user__name', 'visualization__user__nick', 'created_at', 'modified_at', 'visualization__last_revision',
                 'visualization__guid', 'visualization__id', 'visualization__last_published_revision')

        return related

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
        if settings.DEBUG: logger.info('Updating dataset %s' % str(fields))
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

    def query_filters(self, account_id=None, language=None):
        """
        Reads available filters from a resource array. Returns an array with objects and their
        i18n names when available.
        """
        query = DatasetRevision.objects.filter(id=F('dataset__last_revision'), dataset__user__account=account_id,
                                               dataseti18n__language=language,
                                               category__categoryi18n__language=language)

        query = query.values('dataset__user__nick', 'dataset__user__name', 'status', 'impl_type',
                             'category__categoryi18n__name')

        filters = set([])

        for res in query:

            status = res.get('status')
            impl_type = res.get('impl_type')

            filters.add(('status', status, unicode(DatasetRevision.STATUS_CHOICES[status])))

            filters.add(('type', impl_type,
                unicode(
                    [x[1] if x else '' for x in SOURCE_IMPLEMENTATION_CHOICES if x[0] == impl_type][0]
                    )
                ))
            if 'category__categoryi18n__name' in res:
                filters.add(('category', res.get('category__categoryi18n__name'),
                    res.get('category__categoryi18n__name')))
            if res.get('dataset__user__nick'):
                filters.add(('author', res.get('dataset__user__nick'),
                    res.get('dataset__user__name')))

        logger.info(filters)

        return [{'type':k, 'value':v, 'title':title} for k,v,title in filters]


class DatasetSearchDAOFactory():
    """ select Search engine"""
    def __init__(self):
        pass
    
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
        return "%s::%s" % (self.TYPE.upper(),self.dataset_revision.dataset.guid)
        #return "%s::DATASET-ID-%s" % (self.TYPE.upper(),self.dataset_revision.dataset.id)

    def _build_document(self):
        # eliminado hasta que haya facets
        #from core.models import add_facets_to_doc

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
        #	#document['fields'].update(self.dataset_revision.get_meta_data_dict(self.dataset_revision.dataset.meta_text))

        return document

 
class DatasetSearchifyDAO(DatasetSearchIndexDAO):
    """ class for manage access to datasets' searchify documents """
    def __init__(self, dataset_revision):
        self.dataset_revision=dataset_revision
        self.search_index = SearchifyIndex()
        
    def add(self):
        return self.search_index.indexit(self._build_document())
        
    def remove(self):
        self.search_index.delete_documents([self._get_id()])


class DatasetElasticsearchDAO(DatasetSearchIndexDAO):
    """ class for manage access to datasets' ElasticSearch documents """

    def __init__(self, dataset_revision):
        self.logger = logging.getLogger(__name__)
        self.dataset_revision=dataset_revision
        self.search_index = ElasticsearchIndex()
        
    def add(self):
        return self.search_index.indexit(self._build_document())
        
    def remove(self):
        self.search_index.delete_documents([{"type": self._get_type(), "docid": self._get_id()}])
