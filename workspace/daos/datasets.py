# -*- coding: utf-8 -*-

from core.daos.datasets import AbstractDatasetDBDAO
from core.choices import SOURCE_IMPLEMENTATION_CHOICES
from workspace import settings
from core.models import DatasetRevision, DatasetI18n, DataStreamRevision
from django.db.models import Q, F
import operator


class DatasetDBDAO(AbstractDatasetDBDAO):
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

    def query_filters(self, account_id=None, language=None):
        """
        Reads available filters from a resource array. Returns an array with objects and their
        i18n names when available.
        """
        query = DatasetRevision.objects.filter(id=F('dataset__last_revision'), dataset__user__account=account_id,
                                               dataseti18n__language=language,
                                               category__categoryi18n__language=language)

        query = query.values('dataset__user__nick', 'status', 'impl_type',
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
                    res.get('dataset__user__nick')))

        return [{'type':k, 'value':v, 'title':title} for k,v,title in filters]

    def query_childs(self, dataset_id, language):
        """ Devuelve la jerarquia completa para medir el impacto """

        related = dict()
        related['datastreams'] = DataStreamRevision.objects.select_related().filter(
            dataset__id=dataset_id,
            datastreami18n__language=language
        ).values('status', 'id', 'datastreami18n__title', 'datastreami18n__description', 'datastream__user__nick',
                 'created_at', 'datastream__last_revision')
        return related

    def create(self, dataset=None, user=None, collect_type='', impl_details=None, **fields):
        """create a new dataset if needed and a dataset_revision"""
        pass
        
    def update(self, dataset_revision, changed_fields, **fields):
        pass
