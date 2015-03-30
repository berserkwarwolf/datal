# -*- coding: utf-8 -*-
import operator, logging
from django.db.models import Q, F
from core.models import Dataset, DatasetRevision, DataStream, Visualization, DataStreamRevision, VisualizationRevision


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


class DatastreamDAO():
    """ class for integrated managment of datastream + datastream_revision + datastream_i18n """

    def __init__(self, language=None, resource=None, datastream_id=0, datastream_revision_id=0):
        # internal used resources (optional). You could start by dataset or revision
        if type(resource) == DataStream:
            self.datastream = resource
            self.datastream_revision = DataStreamRevision.objects.get(pk=self.datastream.last_published_revision_id)
        elif type(resource) == DataStreamRevision:
            self.datastream_revision=resource
            self.datastream = resource.datastream
        elif datastream_id > 0:
            self.datastream=DataStream.objects.get(pk=datastream_id)
            self.datastream_revision = DataStreamRevision.objects.get(pk=self.datastream.last_published_revision_id)
        elif datastream_revision_id > 0:
            self.datastream_revision = DataStreamRevision.objects.get(pk=datastream_revision_id)
            self.datastream = self.datastream_revision.datastream
        else:
            self.datastream_revision = None
            self.datastream = None

        if language:
            self.language = language
        elif self.datastream:
            self.language = self.datastream.user.language

    def get(self):
        """ get a full datastream data """
        if self.datastream_revision is None:
            return None
        query = DataStreamRevision.objects.filter(pk=self.datastream_revision.id)
        query = query.filter(datastreami18n__language=self.language, category__categoryi18n__language=self.language)

        query = query.values('status', 'id', 'category__id', 'datastream__id', 'id', 'datastream__guid'
                            , 'category__categoryi18n__name', 'datastreami18n__title'
                            , 'datastreami18n__description', 'datastream__user__id')#TODO add , 'created_at' but not as an date object
        try:
            query = query.order_by('-id')[0]
        except IndexError:
            query = None

        return query

    def query(self, account_id, language=None, page=0, itemsxpage=10, order='-id', filters_dict=None):
        """ query for full datastream lists"""
        if not language:
            language = self.language

        """
        query = DataStreamRevision.objects.filter(user__account=account_id)
        query = query.filter(datastreami18n__language=language)
        query = query.filter(category__categoryi18n__language=language)
        """
        query = DataStreamRevision.objects.filter(id=F('datastream__last_published_revision'),
                                                user__account=account_id,
                                               datastreami18n__language=language,
                                               category__categoryi18n__language=language)
        if filters_dict:
            # Construct the query with Q.
            # Extracted from: http://www.michelepasin.org/blog/2010/07/20/the-power-of-djangos-q-objects/

            predicates = []
            for filter_class, filter_value in filters_dict.iteritems():
                if filter_value:
                    predicates.append((filter_class + '__in', filter_value))
            q_list = [Q(x) for x in predicates]
            if predicates:
                query = query.filter(reduce(operator.and_, q_list))


        total_resources = query.count()
        query = query.values('status', 'id', 'category__id', 'datastream__id', 'datastream__user__id'
                            , 'category__categoryi18n__name', 'datastreami18n__title'
                            , 'dataset__datasetrevision__dataseti18n__title', 'datastream__guid'
                            , 'dataset__datasetrevision__end_point'
                            , 'datastreami18n__description', 'datastream__user__nick', 'created_at','dataset')

        query = query.order_by(order)
        # Limit the size.
        nfrom = page * itemsxpage
        nto = nfrom + itemsxpage
        query = query[nfrom:nto]

        return query, total_resources

    def query_related_resources(self):
        """ get all related resources for measuring impact """

        ret = {}
        ds_json = self.get()
        ret['datastreams']= [ds_json] if ds_json else []
        # visualizations = Visualization.objects.filter(datastream=self.datastream)
        visualizations = Visualization.objects.filter(last_revision__visualization__datastream=self.datastream)
        ret['visualizations'] = []
        for visualization in visualizations:
            vz = VisualizationDAO(resource=visualization)
            ret['visualizations'].append(vz.get())
        return ret


class VisualizationDAO():
    """ class for integrated managment of viz + viz_revision + viz_i18n """

    def __init__(self, language=None, resource=None, visualization_id=0, visualization_revision_id=0):
        # internal used resources (optional). You could start by visualization or revision

        if type(resource) == Visualization:
            self.visualization = resource
            self.visualization_revision = VisualizationRevision.objects.get(pk=self.visualization.last_published_revision_id)
        elif type(resource) == VisualizationRevision:
            self.visualization_revision = resource
            self.visualization = resource.visualization
        elif visualization_id > 0:
            self.visualization=Visualization.objects.get(pk=visualization_id)
            self.visualization_revision = VisualizationRevision.objects.get(pk=self.visualization.last_published_revision_id)
        elif visualization_revision_id > 0:
            self.visualization_revision = VisualizationRevision.objects.get(pk=visualization_revision_id)
            self.visualization = self.visualization_revision.visualization
        else:
            self.visualization_revision=None
            self.visualization=None

        if language:
            self.language = language
        elif self.visualization:
            self.language = self.visualization.user.language


    def get(self):
        """ get a full datastream data """

        if self.visualization_revision is None:
            return None

        query = VisualizationRevision.objects.filter(visualization=self.visualization)
        query = query.filter(visualizationi18n__language=self.language)
        query = query.values('status', 'id', 'visualization__id', 'visualizationi18n__title', 'visualization__guid'
                            , 'visualizationi18n__description', 'visualization__user__id')

        try:
            query = query.order_by('-id')[0]
        except IndexError:
            query = None

        return query

    def query(self, account_id, language=None, page=0, limit=10, order='-id'):
        """ query for full visualization lists"""
        if not language:
            language = self.language

        query = VisualizationRevision.objects.filter(user__account=account_id)
        query = query.filter(visualizationi18n__language=language)
        query = query.values('status', 'id', 'visualization__id', 'visualization__user__id'
                            , 'visualizationi18n__title'
                            , 'visualizationi18n__description', 'created_at')
        query = query.order_by(order)

        return query


    def query_related_resources(self):
        """ get all related resources for measuring impact """

        ret = {}
        vz_json = self.get()
        ret['visualization']= [vz_json] if vz_json else []

        return ret
