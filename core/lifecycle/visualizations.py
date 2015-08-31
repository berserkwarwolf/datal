# -*- coding: utf-8 -*-
import logging
from core.daos.visualizations import VisualizationDBDAO
from core.models import VisualizationRevision, Visualization, VisualizationI18n
from core.daos.activity_stream import ActivityStreamDAO
from core.choices import StatusChoices
from core.exceptions import VisualizationNotFoundException
from .resource import AbstractLifeCycleManager

logger = logging.getLogger(__name__)

CREATE_ALLOWED_STATES = [
    StatusChoices.DRAFT,
    StatusChoices.PENDING_REVIEW,
    StatusChoices.APPROVED,
    StatusChoices.PUBLISHED
]
PUBLISH_ALLOWED_STATES = [
    StatusChoices.DRAFT,
    StatusChoices.PENDING_REVIEW,
    StatusChoices.APPROVED,
    StatusChoices.PUBLISHED
]
UNPUBLISH_ALLOWED_STATES = [
    StatusChoices.DRAFT,
    StatusChoices.PUBLISHED
]
SEND_TO_REVIEW_ALLOWED_STATES = [
    StatusChoices.DRAFT
]
ACCEPT_ALLOWED_STATES = [
    StatusChoices.PENDING_REVIEW
]
REJECT_ALLOWED_STATES = [
    StatusChoices.PENDING_REVIEW
]
REMOVE_ALLOWED_STATES = [
    StatusChoices.DRAFT,
    StatusChoices.APPROVED,
    StatusChoices.PUBLISHED
]
EDIT_ALLOWED_STATES = [
    StatusChoices.DRAFT,
    StatusChoices.APPROVED,
    StatusChoices.PUBLISHED
]


class VisualizationLifeCycleManager(AbstractLifeCycleManager):
    """ Manage a visualization Life Cycle"""

    def __init__(self, user, resource=None, language=None, visualization_id=0, visualization_revision_id=0):
        super(VisualizationLifeCycleManager, self).__init__(user, language)
        # Internal used resources (optional). You could start by resource or revision
        try:
            if type(resource) == Visualization:
                self.visualization = resource
                self.visualization_revision = VisualizationRevision.objects.select_related().get(
                    pk=self.visualization.last_revision_id
                )
            elif type(resource) == VisualizationRevision:
                self.visualization_revision = resource
                self.visualization = resource.visualization
            elif visualization_id > 0:
                self.visualization = Visualization.objects.get(pk=visualization_id)
                self.visualization_revision = VisualizationRevision.objects.select_related().get(
                    pk=self.visualization.last_revision_id)
            elif visualization_revision_id > 0:
                self.visualization_revision = VisualizationRevision.objects.select_related().get(pk=visualization_revision_id)
                self.visualization = self.visualization_revision.visualization
            else:
                self.visualization_revision = None
                self.visualization = None
        except Visualization.DoesNotExist, VisualizationRevision.DoesNotExist:
            raise VisualizationNotFoundException()

        self.visualizationi18n = None
        if self.visualization and self.visualization_revision:
            self.visualizationi18n = VisualizationI18n.objects.get(
                visualization_revision=self.visualization_revision,
                language=self.visualization.user.language
            )

