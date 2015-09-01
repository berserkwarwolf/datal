# -*- coding: utf-8 -*-
from django.db.models import F, Max
from django.db import transaction
from core.choices import ActionStreams
from core.models import DatasetRevision, DataStreamRevision, DataStream, DatastreamI18n, VisualizationRevision
from core.lifecycle.resource import AbstractLifeCycleManager
from core.lib.datastore import *
from core.exceptions import IllegalStateException, DataStreamNotFoundException
from core.daos.datastreams import DataStreamDBDAO, DatastreamSearchDAOFactory
from .visualizations import VisualizationLifeCycleManager


logger = logging.getLogger(__name__)
CREATE_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.PENDING_REVIEW, StatusChoices.APPROVED, StatusChoices.PUBLISHED]
PUBLISH_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.PENDING_REVIEW, StatusChoices.APPROVED, StatusChoices.PUBLISHED]
UNPUBLISH_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.PUBLISHED]
SEND_TO_REVIEW_ALLOWED_STATES = [StatusChoices.DRAFT]
ACCEPT_ALLOWED_STATES = [StatusChoices.PENDING_REVIEW]
REJECT_ALLOWED_STATES = [StatusChoices.PENDING_REVIEW]
REMOVE_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.APPROVED, StatusChoices.PUBLISHED ]
EDIT_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.APPROVED, StatusChoices.PUBLISHED]


class DatastreamLifeCycleManager(AbstractLifeCycleManager):
    """ Manage a Datastream revision Life Cycle"""

    def __init__(self, user, resource=None, language=None, datastream_id=0, datastream_revision_id=0):
        super(DatastreamLifeCycleManager, self).__init__(user, language)
        # Internal used resources (optional). You could start by dataset or revision

        try:
            if type(resource) == DataStream:
                self.datastream = resource
                self.datastream_revision = DataStreamRevision.objects.select_related().get(
                    pk=self.datastream.last_revision_id)
            elif type(resource) == DataStreamRevision:
                self.datastream_revision = resource
                self.datastream = resource.datastream
            elif datastream_id > 0:
                self.datastream = DataStream.objects.get(pk=datastream_id)
                self.datastream_revision = DataStreamRevision.objects.select_related().get(
                    pk=self.datastream.last_revision_id)
            elif datastream_revision_id > 0:
                self.datastream_revision = DataStreamRevision.objects.select_related().get(pk=datastream_revision_id)
                self.datastream = self.datastream_revision.datastream
            else:
                self.datastream_revision = None
                self.datastream = None
        except DataStream.DoesNotExist, DataStreamRevision.DoesNotExist:
            raise DataStreamNotFoundException()

        self.datastreami18n = None
        if self.datastream and self.datastream_revision:
            self.datastreami18n = DatastreamI18n.objects.get(
                datastream_revision=self.datastream_revision,
                language=self.datastream.user.language
            )

    def create(self, allowed_states=CREATE_ALLOWED_STATES, **fields):
        """ Create a new DataStream """

        # Check for allowed states
        status = int(fields.get('status', StatusChoices.DRAFT))

        if int(status) not in allowed_states:
            raise IllegalStateException(
                                    from_state=None,
                                    to_state=status,
                                    allowed_states=allowed_states)

        #language = fields.get('language', self.user.language)
        #category = Category.objects.get(pk=fields['category_id'])
        self.datastream, self.datastream_revision = DataStreamDBDAO().create(
            user=self.user,
            #category=category,
            #language=language,
            **fields
        )

        self._log_activity(ActionStreams.CREATE)

        # permite publicar al crear
        if status == StatusChoices.PUBLISHED:
            self.publish(allowed_states=CREATE_ALLOWED_STATES)
        else:
            self._update_last_revisions()

        return self.datastream_revision

    def publish(self, allowed_states=PUBLISH_ALLOWED_STATES, parent_status=None):
        """ Publica una revision de dataset """
        logger.info('[LifeCycle - Datastreams - Publish] Publico Rev {}.'.format(
            self.datastream_revision.id
        ))
        if self.datastream_revision.status not in allowed_states:
            logger.info('[LifeCycle - Datastreams - Publish] Rev. {} El estado {} no esta entre los estados de edicion permitidos.'.format(
                self.datastream_revision.id, self.datastream_revision.status
            ))
            raise IllegalStateException(
                                    from_state=self.datastream_revision.status,
                                    to_state=StatusChoices.PUBLISHED,
                                    allowed_states=allowed_states)
        if parent_status != StatusChoices.PUBLISHED:
            if self.datastream_revision.dataset.last_revision.status != StatusChoices.PUBLISHED:
                raise ParentNotPuslishedException()

        self._publish_childs()
        self.datastream_revision.status = StatusChoices.PUBLISHED
        self.datastream_revision.save()

        self._update_last_revisions()

        search_dao = DatastreamSearchDAOFactory().create(self.datastream_revision)
        search_dao.add()

        self._log_activity(ActionStreams.PUBLISH)

    def _publish_childs(self):
        """ Intenta publicar la ultima revision de los datastreams hijos"""
        with transaction.atomic():
            visualization_revisions = VisualizationRevision.objects.select_for_update().filter(
                visualization__datastream__id=self.datastream.id,
                id=F('visualization__last_revision__id')
            )
            publish_fail = list()
            for visualization_revision in visualization_revisions:
                logger.info('[LifeCycle - Datastream - Publish Childs] Datastream {} Publico Visualization Rev. hijo {}.'.format(
                    self.datastream.id, visualization_revision.id
                ))
                try:
                    VisualizationLifeCycleManager(
                        user=self.user,
                        visualization_revision_id=visualization_revision.id
                    ).publish(
                        allowed_states=[StatusChoices.APPROVED],
                        parent_status=StatusChoices.PUBLISHED
                    )
                except IllegalStateException:
                    publish_fail.append(visualization_revision)

            if publish_fail:
                raise ChildNotApprovedException(self.datastream.last_revision)

    def unpublish(self, killemall=False, allowed_states=UNPUBLISH_ALLOWED_STATES):
        """ Despublica la revision de un dataset """

        if self.datastream_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.datastream_revision.status,
                                    to_state=StatusChoices.DRAFT,
                                    allowed_states=allowed_states)


        if killemall:
            self._unpublish_all()
        else:
            revcount = DatasetRevision.objects.filter(dataset=self.datastream.id, status=StatusChoices.PUBLISHED).count()

            if revcount == 1:
                self._unpublish_all()
            else:
                self.datastream_revision.status = StatusChoices.DRAFT
                self.datastream_revision.save()

        search_dao = DatastreamSearchDAOFactory().create(self.datastream_revision)
        search_dao.remove()

        self._update_last_revisions()

        self._log_activity(ActionStreams.UNPUBLISH)

    def _unpublish_all(self):
        """ Despublica todas las revisiones del dataset y la de todos sus datastreams hijos en cascada """

        DatasetRevision.objects.filter(dataset=self.datastream.id, status=StatusChoices.PUBLISHED).exclude(
            id=self.datastream_revision.id).update(status=StatusChoices.DRAFT)

        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(
                dataset=self.datastream.id,
                id=F('datastream__last_published_revision__id'),
                status=StatusChoices.PUBLISHED)

            for datastream in datastreams:
                DatastreamLifeCycleManager(self.user, datastream_id=datastream.id).unpublish(killemall=True)

    def send_to_review(self, allowed_states=SEND_TO_REVIEW_ALLOWED_STATES):
        """ Envia a revision un dataset """

        if self.datastream_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.datastream_revision.status,
                                    to_state=StatusChoices.PENDING_REVIEW,
                                    allowed_states=allowed_states)

        self._send_childs_to_review()

        self.datastream_revision.status = StatusChoices.PENDING_REVIEW
        self.datastream_revision.save()
        self._log_activity(ActionStreams.REVIEW)

    def _send_childs_to_review(self):
        """ Envia a revision todos los datastreams hijos en cascada """

        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(
                dataset=self.datastream.id,
                id=F('datastream__last_revision__id'),
                status=StatusChoices.DRAFT)

            for datastream in datastreams:
               DatastreamLifeCycleManager(self.user, datastream_id=datastream.id).send_to_review()

    def accept(self, allowed_states=ACCEPT_ALLOWED_STATES):
        """ accept a dataset revision """

        if self.datastream_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.datastream_revision.status,
                                    to_state=StatusChoices.APPROVED,
                                    allowed_states=allowed_states)

        self.datastream_revision.status = StatusChoices.APPROVED
        self.datastream_revision.save()
        self._log_activity(ActionStreams.ACCEPT)

    def reject(self, allowed_states=REJECT_ALLOWED_STATES):
        """ reject a dataset revision """

        if self.datastream_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.datastream_revision.status,
                                    to_state=StatusChoices.DRAFT,
                                    allowed_states=allowed_states)

        self.datastream_revision.status = StatusChoices.DRAFT
        self.datastream_revision.save()
        self._log_activity(ActionStreams.REJECT)

    def remove(self, killemall=False, allowed_states=REMOVE_ALLOWED_STATES):
        """ Elimina una revision o todas las revisiones de un dataset y la de sus datastreams hijos en cascada """

        if self.datastream_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.datastream_revision.status,
                                    to_state=None,
                                    allowed_states=allowed_states)

        if killemall:
            self._remove_all()
        else:
            revcount = DatasetRevision.objects.filter(dataset=self.datastream.id, status=StatusChoices.PUBLISHED).count()

            if revcount == 1:
                ## Si la revision a eliminar es la unica publicada entonces despublicar todos los datastreams en cascada
                self._unpublish_all()

            # Fix para evitar el fallo de FK con las published revision. Luego la funcion update_last_revisions
            # completa el valor correspondiente.
            self.datastream.last_published_revision=None
            self.datastream.save()

            self.datastream_revision.delete()

        self._update_last_revisions()

        self._log_activity(ActionStreams.DELETE)

    def _remove_all(self):
        self.datastream.delete()

    def edit(self, allowed_states=EDIT_ALLOWED_STATES, changed_fields=None, **fields):
        """ Create new revision or update it """
        form_status = None

        if 'status' in fields.keys():
            form_status = int(fields.pop('status', None))

        old_status = self.datastream_revision.status
        if old_status not in allowed_states:
            # Si el estado fallido era publicado, queda aceptado
            if form_status and form_status == StatusChoices.PUBLISHED:
                self.accept()
            raise IllegalStateException(from_state=old_status, to_state=form_status, allowed_states=allowed_states)
        if old_status == StatusChoices.PUBLISHED:
            self.datastream, self.datastream_revision = DataStreamDBDAO().create(
                datastream=self.datastream,
                dataset=self.datastream_revision.dataset,
                user=self.datastream_revision.user,
                status=form_status,
                parameters=self.datastream_revision.datastreamparameter_set.all(),
                **fields
            )

            self._move_childs_to_draft()

            if form_status == StatusChoices.DRAFT:
                self.unpublish()
            else:
                self._update_last_revisions()
        else:
            # Actualizo sin el estado
            self.datastream_revision = DataStreamDBDAO().update(
                self.datastream_revision,
                status=old_status,
                changed_fields=changed_fields,
                **fields
            )

            if form_status == StatusChoices.PUBLISHED:
               # Intento publicar, si falla, queda aceptado

                try:
                    self.publish()
                except:
                    self.accept()
                    raise
            else:
                self.datastream_revision.status = form_status
                self.datastream_revision.save()

        return self.datastream_revision

    def _move_childs_to_draft(self):

        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(
                dataset=self.datastream.id,
                id=F('datastream__last_revision__id'),
                status=StatusChoices.PUBLISHED)

            for datastream in datastreams:
               DatastreamLifeCycleManager(self.user, datastream_id=datastream.id).save_as_draft()

    def save_as_draft(self):
        self.datastream_revision.clone()
        self._update_last_revisions()

    def _log_activity(self, action_id):
        title = self.datastreami18n.title if self.datastreami18n else ''

        return super(DatastreamLifeCycleManager, self)._log_activity(action_id, self.datastream_revision.dataset.id,
            self.datastream_revision.dataset.type, self.datastream_revision.id, title)

    def _update_last_revisions(self):
        """ update last_revision_id and last_published_revision_id """

        last_revision_id = DataStreamRevision.objects.filter(datastream=self.datastream).aggregate(Max('id'))['id__max']

        if last_revision_id:
            self.datastream.last_revision = DataStreamRevision.objects.get(pk=last_revision_id)
            last_published_revision_id = DataStreamRevision.objects.filter(
                datastream=self.datastream,
                status=StatusChoices.PUBLISHED).aggregate(Max('id')
            )['id__max']

            if last_published_revision_id:
                    self.datastream.last_published_revision = DataStreamRevision.objects.get(
                        pk=last_published_revision_id)

            self.datastream.save()
        else:
            # Si fue eliminado pero falta el commit, evito borrarlo nuevamente
            if self.datastream.id:
                self.datastream.delete()
