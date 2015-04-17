# -*- coding: utf-8 -*-
import logging

from django.db.models import F, Max
from django.db import transaction
from django.conf import settings

from core.choices import ActionStreams, StatusChoices
from core.models import DatasetRevision, Dataset, DataStreamRevision, DataStream, Category
from core.lifecycle.resource import AbstractLifeCycleManager
from core.lib.datastore import *
from core.exceptions import IlegalStateException, DataStreamNotFoundException
from core.daos.datastreams import DataStreamDBDAO, DatastreamSearchDAOFactory

logger = logging.getLogger(__name__)
CREATE_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.PENDING_REVIEW, StatusChoices.PUBLISHED]
PUBLISH_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.PENDING_REVIEW, StatusChoices.APPROVED]
UNPUBLISH_ALLOWED_STATES = [StatusChoices.PUBLISHED]
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
                self.datastream_revision = DataStreamRevision.objects.select_related().get(pk=self.datastream.last_revision_id)
            elif type(resource) == DataStreamRevision:
                self.datastream_revision = resource
                self.datastream=resource.datastream
            elif datastream_id > 0:
                self.datastream = Dataset.objects.get(pk=datastream_id)
                self.datastream_revision = DatasetRevision.objects.select_related().get(pk=self.datastream.last_revision_id)
            elif datastream_revision_id > 0:
                self.datastream_revision = DataStreamRevision.objects.select_related().get(pk=datastream_revision_id)
                self.datastream = self.datastream_revision.dataset
            else:
                self.datastream_revision = None
                self.datastream = None
        except Dataset.DoesNotExist, DatasetRevision.DoesNotExist:
            raise DataStreamNotFoundException()

    def create(self,allowed_states=CREATE_ALLOWED_STATES, **fields):
        """ Create a new DataStream """

        # Check for allowed states
        status = fields.get('status', StatusChoices.DRAFT)

        if int(status) not in allowed_states:
            raise IlegalStateException(allowed_states)

        language = fields.get('language', self.user.language)
        category = Category.objects.get(pk=fields['category_id'])
        self.datastream, self.datastream_revision = DataStreamDBDAO().create(user=self.user,
            title=fields['title'], dataset=fields['dataset'], category=category
            , data_source=fields['data_source'], select_statement=fields['select_statement']
            , language=language , description=fields['description'] 
            , notes=fields.get('notes', ''), status=fields['status']
            , tags=fields['tags'], sources=fields['sources'], parameters=fields['parameters'])

        self._update_last_revisions()
        self._log_activity(ActionStreams.CREATE)

        return self.datastream_revision

    def publish(self, allowed_states=PUBLISH_ALLOWED_STATES):
        """ Publica una revision de dataset """

        if self.datastream_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.datastream_revision)

        status = StatusChoices.PUBLISHED
        try:
            self._publish_childs()
        except IlegalStateException:
            # Si alguno de los hijos no se encuentra al menos aprobado, entonces el dataset no es publicado quedando en estado aprobado
            status = StatusChoices.APPROVED

        self.datastream_revision.status = status
        self.datastream_revision.save()

        search_dao = DatastreamSearchDAOFactory().create()
        search_dao.add(self.datastream_revision)
        
        self._update_last_revisions()

        self._log_activity(ActionStreams.PUBLISH)

    def _publish_childs(self):
        """ Intenta publicar la ultima revision de los datastreams hijos"""
        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(dataset=self.datastream.id,
                                                                                id=F('datastream__last_revision__id'))

            for datastream in datastreams:
                DatastreamLifeCycleManager(self.user, datastream_id=datastream.id).publish(
                    allowed_states=[StatusChoices.APPROVED])

    def unpublish(self, killemall=False, allowed_states=UNPUBLISH_ALLOWED_STATES):
        """ Despublica la revision de un dataset """

        if self.datastream_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.datastream_revision)

        if killemall:
            self._unpublish_all()
        else:
            revcount = DatasetRevision.objects.filter(dataset=self.datastream.id, status=StatusChoices.PUBLISHED).count()

            if revcount == 1:
                self._unpublish_all()
            else:
                self.datastream_revision.status = StatusChoices.DRAFT
                self.datastream_revision.save()

        search_dao = DatastreamSearchDAOFactory().create()
        search_dao.remove(self.datastream_revision)
        
        self._update_last_revisions()

        self._log_activity(ActionStreams.UNPUBLISH)

    def _unpublish_all(self):
        """ Despublica todas las revisiones del dataset y la de todos sus datastreams hijos en cascada """

        DatasetRevision.objects.filter(dataset=self.datastream.id, status=StatusChoices.PUBLISHED).exclude(
            id=self.datastream_revision.id).update(changed_fields=['status'], status=StatusChoices.DRAFT)

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
            raise IlegalStateException(allowed_states, self.datastream_revision)

        self._send_childs_to_review()

        self.datastream_revision.status = StatusChoices.PENDING_REVIEW
        self.datastream_revision.save()

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
            raise IlegalStateException(allowed_states, self.datastream_revision)

        self.datastream_revision.status = StatusChoices.APPROVED
        self.datastream_revision.save()

    def reject(self, allowed_states=REJECT_ALLOWED_STATES):
        """ reject a dataset revision """

        if self.datastream_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.datastream_revision )

        self.datastream_revision.status = StatusChoices.DRAFT
        self.datastream_revision.save()

    def remove(self, killemall=False, allowed_states=REMOVE_ALLOWED_STATES):
        """ Elimina una revision o todas las revisiones de un dataset y la de sus datastreams hijos en cascada """

        if self.datastream_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.datastream_revision)

        if self.datastream_revision.status == StatusChoices.PUBLISHED:
            self.unindex_resource()

        if killemall:
            self._remove_all()
        else:
            revcount = DatasetRevision.objects.filter(dataset=self.datastream.id, status=StatusChoices.PUBLISHED).count()

            if revcount == 1:
                ## Si la revision a eliminar es la unica publicada entonces despublicar todos los datastreams en cascada
                self._unpublish_all()
            else:
                self.datastream_revision.delete()

        self._update_last_revisions()

        self._log_activity(ActionStreams.DELETE)

    def _remove_all(self):
        self.datastream.delete()

    def edit(self, allowed_states=EDIT_ALLOWED_STATES, changed_fields=None, **fields):
        """create new revision or update it"""

        old_status = self.datastream_revision.status
        if old_status  not in allowed_states:
            raise IlegalStateException(allowed_states, self.datastream_revision)

        file_data = fields.get('file_data', None)
        if file_data is not None:
            fields['file_size'] = file_data.size
            fields['file_name'] = file_data.name
            fields['end_point'] = 'file://' + active_datastore.create(self.user.account.id, self.user.id,
                                                                      settings.AWS_BUCKET_NAME, file_data)

            changed_fields += ['file_size', 'file_name', 'end_point']

        if old_status == StatusChoices.DRAFT:

            self.datastream_revision = DataStreamDBDAO().update(self.datastream_revision
                                                            , changed_fields
                                                            , title=fields['title']
                                                            , description=fields['description']
                                                            , language=fields['language']
                                                            , category=fields['category']
                                                            , impl_type=fields['impl_type']
                                                            , file_name=fields['file_name']
                                                            , end_point=fields['end_point']
                                                            , file_size=fields.get('file_size', 0)
                                                            , notes=fields['notes']
                                                            , license_url=fields['license_url']
                                                            , spatial=fields['spatial']
                                                            , frequency=fields['frequency']
                                                            , mbox=fields['mbox']
                                                            , tags=fields['tags']
                                                            , sources=fields['sources']
                                                            , params=fields.get('params', []))

        else:

            self.datastream, self.datastream_revision = DataStreamDBDAO().create(dataset=self.datastream
                                                                        , title=fields['title']
                                                                        , description=fields['description']
                                                                        , language=language
                                                                        , status=StatusChoices.DRAFT
                                                                        , category=fields['category']
                                                                        , impl_type=fields['impl_type']
                                                                        , file_name=fields['file_name']
                                                                        , end_point=fields['end_point']
                                                                        , file_size=fields.get('file_size', 0)
                                                                        , notes=fields['notes']
                                                                        , license_url=fields['license_url']
                                                                        , spatial=fields['spatial']
                                                                        , frequency=fields['frequency']
                                                                        , mbox=fields['mbox']
                                                                        , tags=fields['tags']
                                                                        , sources=fields['sources']
                                                                        , params=fields.get('params', []))

            self._move_childs_to_draft()


        status = fields['status']

        if status == StatusChoices.PUBLISHED:
            self.publish()
        elif old_status == StatusChoices.PUBLISHED and status == StatusChoices.DRAFT:
            self.unpublish()
        else:
            self._update_last_revisions()

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
        return super(DatastreamLifeCycleManager, self)._log_activity(
            action_id,
            self.datastream_revision.dataset.id,
            self.datastream_revision.dataset.type,
            self.datastream_revision.id, "#TODO get title")

    def _update_last_revisions(self):
        """ update last_revision_id and last_published_revision_id """

        last_revision = DataStreamRevision.objects.filter(datastream=self.datastream).aggregate(Max('id'))

        if last_revision is not None:
            self.datastream.last_revision_id = last_revision['id__max']
            last_published_revision = DataStreamRevision.objects.filter(datastream=self.datastream,
                status=StatusChoices.PUBLISHED).aggregate(Max('id')
            )

            last_published_revision_id = last_published_revision is not None and last_published_revision['id__max'] or None

            if last_published_revision_id != self.datastream.last_published_revision_id:
                    self.datastream.last_published_revision_id = last_published_revision_id

            self.datastream.save()
