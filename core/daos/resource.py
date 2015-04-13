# -*- coding: utf-8 -*-
from abc import ABCMeta, abstractmethod
from core.builders.datasets import DatasetImplBuilderWrapper
from core.models import Dataset, DatasetRevision, DatasetI18n, DataStreamRevision, Category
from core.models import DatastreamI18n, DataStream
from core import settings
from django.db.models import Q, F
import operator

class AbstractDatasetDBDAO():
    """ class for manage access to datasets' database tables """

    __metaclass__ = ABCMeta

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

    @abstractmethod
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


class AbstractDataStreamDBDAO():
    """ class for manage access to datastreams' database tables """

    __metaclass__ = ABCMeta

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
        parameters = [] #TODO datastream_revision.datastreamparameter_set.all().values('name', 'value')

        # Get category name
        category = datastream_revision.category.categoryi18n_set.get(language=language)
        datastreami18n = DatastreamI18n.objects.get(datastream_revision=datastream_revision, language=language)
        dataset_revision = datastream_revision.dataset.last_revision
        
        datastream = {'datastream_revision_id': datastream_revision.id
                    , 'dataset_id': datastream_revision.dataset.id
                    , 'user_id': datastream_revision.user.id
                    , 'author': datastream_revision.user.nick
                    , 'account_id': datastream_revision.user.account.id
                    , 'category_id': datastream_revision.category.id
                    , 'category_name': category.name
                    , 'end_point': dataset_revision.end_point
                    , 'collect_type': dataset_revision.impl_type
                    , 'impl_type': dataset_revision.impl_type
                    , 'status': datastream_revision.status
                    , 'modified_at': datastream_revision.created_at
                    , 'meta_text': datastream_revision.meta_text
                    , 'guid': datastream_revision.dataset.guid
                    , 'created_at': datastream_revision.dataset.created_at
                    , 'last_revision_id': datastream_revision.dataset.last_revision_id
                    , 'last_published_revision_id': datastream_revision.dataset.last_published_revision_id
                    , 'title': datastreami18n.title
                    , 'description': datastreami18n.description
                    , 'notes': datastreami18n.notes
                    , 'tags': tags
                    , 'sources': sources
                    , 'parameters': parameters
                    }


        return datastream

    def create(self, datastream=None, user=None, **fields):
        """create a new datastream if needed and a datastream_revision"""

        if datastream is None:
            # Create a new datastream (TITLE is for automatic GUID creation)
            datastream = DataStream.objects.create(user=user, title=fields['title'])

        # meta_text = 

        datastream_revision = DataStreamRevision.objects.create(datastream=datastream
                                                                , user=user
                                                                , dataset=fields['dataset']
                                                                , status=fields['status']
                                                                , category=fields['category']
                                                                , data_source=fields['data_source']
                                                                , select_statement=fields['select_statement'])

        DatastreamI18n.objects.create(datastream_revision=datastream_revision,
            language=fields['language'], title=fields['title'],
            description=fields['description'], notes=fields['notes'])

        datastream_revision.add_tags(fields['tags'])
        datastream_revision.add_sources(fields['sources'])
        datastream_revision.add_parameters(fields['parameters'])

        return datastream, datastream_revision


    def update(self, datastream_revision, changed_fields, **fields):

        datastream_revision.update(changed_fields, **fields)

        DatastreamI18n.objects.get(datastream_revision=datastream_revision, language=fields['language']).update(changed_fields, **fields)

        datastream_revision.add_tags(fields['tags'])
        datastream_revision.add_sources(fields['sources'])

        return datastream_revision


    @abstractmethod
    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
              sort_by='-id', filters_dict=None, filter_name=None, exclude=None):
        """ Consulta y filtra los datastreams por diversos campos """

        query = DataStreamRevision.objects.filter(id=F('datastream__last_revision'), datastream__user__account=account_id,
                                               datastreami18n__language=language, category__categoryi18n__language=language
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
        query = query.values('datastream__user__nick', 'status', 'id', 'datastream__guid'
                , 'category__id', 'datastream__id', 'category__categoryi18n__name'
                , 'datastreami18n__title', 'datastreami18n__description', 'created_at'
                , 'datastream__user__id', 'datastream__last_revision_id'
                , 'dataset__last_revision__dataseti18n__title', 'dataset__last_revision__impl_type'
                , 'dataset__last_revision__id')

        query = query.order_by(sort_by)

        # Limit the size.
        nfrom = page * itemsxpage
        nto = nfrom + itemsxpage
        query = query[nfrom:nto]

        return query, total_resources

    def query_childs(self, dataset_id, language):
        """ Devuelve la jerarquia completa para medir el impacto """

        related = {'visualizations': {}}

        return related