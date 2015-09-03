# -*- coding: utf-8 -*-
from core.models import Visualization, VisualizationRevision


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
