# -*- coding: utf-8 -*-
import operator
from django.db.models import Q, F
from core.models import Dataset, DatasetRevision, DataStream
from microsites.daos.datastreams import DatastreamDAO

class DatasetDAO():
    """ class for integrated managment of datasets + dataset_revision + dataset_i18n """

    def __init__(self, language=None, resource=None, resource_id=0, resource_revision_id=0):
        if type(resource) == Dataset:
            self.dataset = resource
            self.dataset_revision = DatasetRevision.objects.get(
                pk=self.dataset.last_published_revision_id)
        elif type(resource) == DatasetRevision:
            self.dataset_revision=resource
            self.dataset = resource.dataset
        elif resource_id > 0:
            self.dataset = Dataset.objects.get(pk=resource_id)
            self.dataset_revision = DatasetRevision.objects.get(
                pk=self.dataset.last_published_revision_id)
        elif resource_revision_id > 0:
            self.dataset_revision = DatasetRevision.objects.get(
                pk=resource_revision_id)
            self.dataset = self.dataset_revision.dataset
        else:
            self.dataset_revision = None
            self.dataset = None

        if language:
            self.language = language
        elif self.dataset:
            self.language = self.dataset.user.language

    def get(self):
        """ get a full dataset data """

        if self.dataset_revision is None:
            return None

        query = DatasetRevision.objects.filter(pk=self.dataset_revision.id)
        query = query.filter(dataseti18n__language=self.language)
        query = query.filter(category__categoryi18n__language=self.language)
        query = query.values('filename', 'dataset__user__nick', 'dataset__type', 'status', 'id', 'impl_type'
                            , 'category__id', 'dataset__id', 'id', 'category__categoryi18n__name', 'dataseti18n__title'
                            , 'dataseti18n__description', 'size', 'end_point','dataset__user__id') #TODO add , 'created_at' but not as an date object

        try:
            query = query.order_by('-id')[0]
        except IndexError:
            query = None


        return query

    def query(self, account_id, language=None, page=0, itemsxpage=10, sort_by='-id', filters_dict=None):
        """ Query for full Dataset lists"""
        if not language:
            language = self.language

        query = DatasetRevision.objects.filter(
            id=F('dataset__last_published_revision'),
            dataset__user__account=account_id, dataseti18n__language=language,
            category__categoryi18n__language=language
        )

        if filters_dict:
            predicates = []
            for filter_class, filter_value in filters_dict.iteritems():
                if filter_value:
                    predicates.append((filter_class + '__in', filter_value))
            q_list = [Q(x) for x in predicates]
            if predicates:
                query = query.filter(reduce(operator.and_, q_list))

        total_resources = query.count()
        query = query.values('filename', 'dataset__user__nick', 'dataset__type',
            'status', 'id', 'impl_type', 'category__id', 'dataset__id', 'id',
            'category__categoryi18n__name', 'dataseti18n__title',
            'dataseti18n__description', 'created_at', 'size', 'end_point',
            'dataset__user__id'
        )

        query = query.order_by(sort_by)

        # Limit the size.
        nfrom = page * itemsxpage
        nto = nfrom + itemsxpage
        query = query[nfrom:nto]

        return query, total_resources


    def query_related_resources(self):
        """ get all related resources for measuring impact """

        ret = {}
        ret['datasets'] = [self.get()]
        #datastreams = DataStreamRevision.objects.filter(dataset=self.dataset)
        datastreams = DataStream.objects.filter(last_published_revision__dataset=self.dataset)
        ret['datastreams'] = []
        ret['visualizations'] = []
        for datastream in datastreams:
            ds = DatastreamDAO(resource=datastream)
            resources = ds.query_related_resources()
            ret['datastreams'] = ret['datastreams'] + resources['datastreams']
            ret['visualizations'] = ret['visualizations'] + resources['visualizations']
        return ret