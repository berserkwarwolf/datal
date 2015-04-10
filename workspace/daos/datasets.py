# -*- coding: utf-8 -*-
import operator, time

from django.db.models import Q, F

from core.builders.datasets import DatasetImplBuilderWrapper
from core.models import Dataset, DatasetRevision, DatasetI18n, DataStreamRevision, Category
from core.exceptions import SearchIndexNotFoundException
from core.lib.searchify import SearchifyIndex
from workspace import settings


class DatasetDBDAO():
    """ class for manage access to datasets' database tables """

    def get(self, language, dataset_id=None, dataset_revision_id=None):
        """ Get full data """
        dataset_revision = dataset_id is None and \
                           DatasetRevision.objects.select_related().get(
                               pk=dataset_revision_id, category__categoryi18n__language=language,
                               dataseti18n__language=language) or \
                           DatasetRevision.objects.select_related().get(
                               pk=dataset__last_revision, category__categoryi18n__language=language,
                               dataseti18n__language=language)

        tags = dataset_revision.tagdataset_set.all().values('tag__name', 'tag__status', 'tag__id')
        sources = dataset_revision.sourcedataset_set.all().values('source__name', 'source__url', 'source__id')

        # Get category name
        category = dataset_revision.category.categoryi18n_set.get(language=language)
        dataseti18n = DatasetI18n.objects.get(dataset_revision=dataset_revision, language=language)

        dataset = {'dataset_revision_id': dataset_revision.id, 'dataset_id': dataset_revision.dataset.id,
                        'user_id': dataset_revision.user.id, 'user_nick': dataset_revision.user.nick,
                        'account_id': dataset_revision.user.account.id, 'category_id': dataset_revision.category.id,
                        'category_name': category.name, 'end_point': dataset_revision.end_point,
                        'filename': dataset_revision.filename, 'impl_details': dataset_revision.impl_details,
                        'impl_type': dataset_revision.impl_type, 'status': dataset_revision.status,
                        'size': dataset_revision.size, 'modified_at': dataset_revision.created_at,
                        'meta_text': dataset_revision.meta_text, 'license_url': dataset_revision.license_url,
                        'spatial': dataset_revision.spatial, 'frequency': dataset_revision.frequency,
                        'mbox': dataset_revision.mbox, 'collect_type': dataset_revision.dataset.type,
                        'dataset_is_dead': dataset_revision.dataset.is_dead, 'guid': dataset_revision.dataset.guid,
                        'created_at': dataset_revision.dataset.created_at,
                        'last_revision_id': dataset_revision.dataset.last_revision_id,
                        'last_published_revision_id': dataset_revision.dataset.last_published_revision_id,
                        'title': dataseti18n.title, 'description': dataseti18n.description,
                        'notes': dataseti18n.notes, 'tags': tags, 'sources': sources
                        }
        dataset.update(self.query_childs(dataset_revision.dataset.id, language))
        
        return dataset

    def create(self, dataset=None, user=None, collect_type='', impl_details=None, **fields):
        """create a new dataset if needed and a dataset_revision"""

        if dataset is None:
            # Create a new dataset (TITLE is for automatic GUID creation)
            dataset = Dataset.objects.create(user=user, type=collect_type, title=fields['title'])

        # meta_text = '{"field_values": [{"cust-dataid": "dataid-%s"}]}' % dataset.id
        if not fields.get('language', None):
            fields['language'] = user.language

        dataset_revision = DatasetRevision.objects.create(dataset=dataset,
                user_id=user.id, status=fields['status'],
                category=Category.objects.get(id=fields['category']), filename=fields['file_name'],
                end_point=fields['end_point'], impl_type=fields['impl_type'],
                impl_details=impl_details, size=fields['file_size'],
                license_url=fields['license_url'], spatial=fields['spatial'],
                frequency=fields['frequency'], mbox=fields['mbox'])

        DatasetI18n.objects.create(dataset_revision=dataset_revision,
            language=fields['language'], title=fields['title'],
            description=fields['description'], notes=fields['notes'])

        dataset_revision.add_tags(fields['tags'])
        dataset_revision.add_sources(fields['sources'])

        return dataset, dataset_revision

    def update(self, dataset_revision, changed_fields, **fields):
        builder = DatasetImplBuilderWrapper(changed_fields=changed_fields, **fields).builder

        # TODO: Fix that
        #if builder.has_changed(changed_fields):
        #    # Build impl_details if necessary
        fields['impl_details'] = builder.build()

        changed_fields.append('impl_details')

        dataset_revision.update(changed_fields, **fields)

        DatasetI18n.objects.get(dataset_revision=dataset_revision, language=fields['language']).update(changed_fields, **fields)

        dataset_revision.add_tags(fields['tags'])
        dataset_revision.add_sources(fields['sources'])

        return dataset_revision


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
        
        query = query.values('filename', 'dataset__user__nick', 'dataset__type', 'status', 'id', 'impl_type',
                             'dataset__guid', 'category__id', 'dataset__id', 'id', 'category__categoryi18n__name',
                             'dataseti18n__title', 'dataseti18n__description', 'created_at', 'size', 'end_point',
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
        ).values('status', 'id', 'datastreami18n__title', 'datastreami18n__description', 'datastream__user__nick',
                 'created_at')

        return related


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
                     'is_private': 0,
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
