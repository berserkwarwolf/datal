# -*- coding: utf-8 -*-
from django.conf import settings
from django.db.models import Q, F

from core.daos.resource import AbstractVisualizationDBDAO
from core.models import VisualizationRevision


class VisualizationDBDAO(AbstractVisualizationDBDAO):
    """ class for manage access to visualizations' database tables """

    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):

        """ Query for full visualization lists"""

        query = VisualizationRevision.objects.filter(
            id=F('visualization__last_revision'),
            user__account=account_id,
            visualizationi18n__language=language,
            category__categoryi18n__language=language
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