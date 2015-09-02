# -*- coding: utf-8 -*-
import logging
from django.db.models import F, Max
from django.conf import settings

from core.daos.visualizations import VisualizationSearchDAOFactory, VisualizationDBDAO
from core.models import VisualizationRevision, Visualization, VisualizationI18n
from core.choices import StatusChoices, ActionStreams
from core.exceptions import VisualizationNotFoundException, IllegalStateException, ParentNotPuslishedException
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

    def create(self, datastream_rev=None, language=None, **fields):
        """ Create a new Visualization """

        self.visualization, self.visualization_revision = VisualizationDBDAO().create(
            datastream_rev=datastream_rev,
            user=self.user,
            language=language,
            **fields
        )

        self._log_activity(ActionStreams.CREATE)
        return self.visualization_revision

    def edit(self, allowed_states=EDIT_ALLOWED_STATES, changed_fields=None, **fields):
        pass

    def _move_childs_to_draft(self):
        pass

    def reject(self, allowed_states=REJECT_ALLOWED_STATES):
        """ reject a visualization revision """

        if self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                from_state=self.visualization_revision.status,
                to_state=StatusChoices.DRAFT,
                allowed_states=allowed_states
            )

        self.visualization_revision.status = StatusChoices.DRAFT
        self.visualization_revision.save()
        self._log_activity(ActionStreams.REJECT)

    def _update_last_revisions(self):
        """ update last_revision_id and last_published_revision_id """

        last_revision_id = VisualizationRevision.objects.filter(
            visualization=self.visualization
        ).aggregate(Max('id'))['id__max']

        if last_revision_id:
            self.visualization.last_revision = VisualizationRevision.objects.get(pk=last_revision_id)
            last_published_revision_id = VisualizationRevision.objects.filter(
                visualization=self.visualization,
                status=StatusChoices.PUBLISHED).aggregate(Max('id')
            )['id__max']

            if last_published_revision_id:
                    self.visualization.last_published_revision = VisualizationRevision.objects.get(
                        pk=last_published_revision_id)

            self.visualization.save()
        else:
            # Si fue eliminado pero falta el commit, evito borrarlo nuevamente
            if self.visualization.id:
                self.visualization.delete()

    def _publish_childs(self):
        """
        Publica todos los hijos
        No se implementa ya que visualizaciones no tiene modelos hijo
        :return:
        """
        pass

    def _send_childs_to_review(self):
        """
        No implementado ya que las visualizaciones no tienen hijos
        :return:
        """
        pass

    def save_as_draft(self):
        self.visualization_revision.clone()
        self._update_last_revisions()

    def _remove_all(self):
        self.visualization.delete()

    def _log_activity(self, action_id):
        title = self.visualizationi18n.title if self.visualizationi18n else ''

        return super(VisualizationLifeCycleManager, self)._log_activity(
            action_id,
            self.visualization_revision.visualization.id,
            settings.TYPE_VISUALIZATION,
            self.visualization_revision.id,
            title
        )

    def accept(self, allowed_states=ACCEPT_ALLOWED_STATES):
        """ accept a visualization revision """

        if self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                from_state=self.visualization_revision.status,
                to_state=StatusChoices.APPROVED,
                allowed_states=allowed_states
            )

        self.visualization_revision.status = StatusChoices.APPROVED
        self.visualization_revision.save()
        self._log_activity(ActionStreams.ACCEPT)

    def _unpublish_all(self):
        """
        Despublica todas las revisiones de la visualizacion y la de todos sus dashboards hijos en cascada
        No se implementa ya que visualizaciones no tiene modelos hijo
        """
        VisualizationRevision.objects.filter(
            visualization__id=self.visualization.id,
            status=StatusChoices.PUBLISHED
        ).exclude(
            id=self.visualization_revision.id
        ).update(status=StatusChoices.DRAFT)

    def remove(self, killemall=False, allowed_states=REMOVE_ALLOWED_STATES):
        """ Elimina una revision o todas las revisiones de un visualizacion """

        if self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                from_state=self.visualization_revision.status,
                to_state=None,
                allowed_states=allowed_states
            )

        if killemall:
            self._remove_all()
        else:
            revcount = VisualizationRevision.objects.filter(
                visualization=self.visualization.id,
                status=StatusChoices.PUBLISHED
            ).count()

            if revcount == 1:
                # Si la revision a eliminar es la unica publicada entonces despublicar todas las visualizaciones
                # en cascada
                self._unpublish_all()

            # Fix para evitar el fallo de FK con las published revision. Luego la funcion update_last_revisions
            # completa el valor correspondiente.
            self.visualization.last_published_revision=None
            self.visualization.save()

            self.visualization_revision.delete()

        self._update_last_revisions()

        self._log_activity(ActionStreams.DELETE)

    def unpublish(self, killemall=False, allowed_states=UNPUBLISH_ALLOWED_STATES):
        """ Despublica la revision de un dataset """
        if self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                from_state=self.visualization_revision.status,
                to_state=StatusChoices.DRAFT,
                allowed_states=allowed_states
            )

        if killemall:
            self._unpublish_all()
        else:
            revcount = VisualizationRevision.objects.filter(
                visualization=self.visualization.id,
                status=StatusChoices.PUBLISHED
            ).count()

            if revcount == 1:
                self._unpublish_all()
            else:
                self.visualization_revision.status = StatusChoices.DRAFT
                self.visualization_revision.save()

        search_dao = VisualizationSearchDAOFactory().create(self.visualization_revision)
        search_dao.remove()

        self._update_last_revisions()

        self._log_activity(ActionStreams.UNPUBLISH)

    def publish(self, allowed_states=PUBLISH_ALLOWED_STATES, parent_status=None):
        """ Publica una revision de visualizacion """
        logger.info('[LifeCycle - Visualizations - Publish] Publico Rev {}.'.format(
            self.visualization_revision.id
        ))
        if self.visualization_revision.status not in allowed_states:
            logger.info('[LifeCycle - Visualizations - Publish] Rev. {} El estado {} no esta entre los estados de edicion permitidos.'.format(
                self.visualization_revision.id, self.visualization_revision.status
            ))
            raise IllegalStateException(
                from_state=self.visualization_revision.status,
                to_state=StatusChoices.PUBLISHED,
                allowed_states=allowed_states
            )
        if parent_status != StatusChoices.PUBLISHED:
            if self.visualization_revision.visualization.datastream.last_revision.status != StatusChoices.PUBLISHED:
                raise ParentNotPuslishedException()

        self._publish_childs()
        self.visualization_revision.status = StatusChoices.PUBLISHED
        self.visualization_revision.save()

        self._update_last_revisions()

        search_dao = VisualizationSearchDAOFactory().create(self.visualization_revision)
        search_dao.add()

        self._log_activity(ActionStreams.PUBLISH)

    def send_to_review(self, allowed_states=SEND_TO_REVIEW_ALLOWED_STATES):
        """ Envia a revision un datastream """

        if self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                from_state=self.visualization_revision.status,
                to_state=StatusChoices.PENDING_REVIEW,
                allowed_states=allowed_states)

        self._send_childs_to_review()

        self.visualization_revision.status = StatusChoices.PENDING_REVIEW
        self.visualization_revision.save()
        self._log_activity(ActionStreams.REVIEW)
