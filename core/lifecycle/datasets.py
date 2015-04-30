# -*- coding: utf-8 -*-
from django.db.models import F, Max
from django.db import transaction
from core.builders.datasets import DatasetImplBuilderWrapper
from core.choices import ActionStreams, StatusChoices
from core.models import DatasetRevision, Dataset, DataStreamRevision, DatasetI18n
from core.lifecycle.resource import AbstractLifeCycleManager
from core.lifecycle.datastreams import DatastreamLifeCycleManager
from core.lib.datastore import *
from core.exceptions import DatasetNotFoundException, IlegalStateException
from core.daos.datasets import DatasetDBDAO, DatasetSearchDAOFactory


CREATE_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.PENDING_REVIEW, StatusChoices.PUBLISHED]
PUBLISH_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.PENDING_REVIEW, StatusChoices.APPROVED]
UNPUBLISH_ALLOWED_STATES = [StatusChoices.PUBLISHED]
SEND_TO_REVIEW_ALLOWED_STATES = [StatusChoices.DRAFT]
ACCEPT_ALLOWED_STATES = [StatusChoices.PENDING_REVIEW]
REJECT_ALLOWED_STATES = [StatusChoices.PENDING_REVIEW]
REMOVE_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.APPROVED, StatusChoices.PUBLISHED ]
EDIT_ALLOWED_STATES = [StatusChoices.DRAFT, StatusChoices.APPROVED, StatusChoices.PUBLISHED]


class DatasetLifeCycleManager(AbstractLifeCycleManager):
    """ Manage a Dataset Life Cycle"""

    def __init__(self, user, resource=None, language=None, dataset_id=0, dataset_revision_id=0):
        super(DatasetLifeCycleManager, self).__init__(user, language)
        # Internal used resources (optional). You could start by dataset or revision

        try:
            if type(resource) == Dataset:
                self.dataset = resource
                self.dataset_revision = DatasetRevision.objects.select_related().get(pk=self.dataset.last_revision_id)
            elif type(resource) == DatasetRevision:
                self.dataset_revision = resource
                self.dataset=resource.dataset
            elif dataset_id > 0:
                self.dataset = Dataset.objects.get(pk=dataset_id)
                self.dataset_revision = DatasetRevision.objects.select_related().get(pk=self.dataset.last_revision_id)
            elif dataset_revision_id > 0:
                self.dataset_revision = DatasetRevision.objects.select_related().get(pk=dataset_revision_id)
                self.dataset = self.dataset_revision.dataset
            else:
                self.dataset_revision = None
                self.dataset = None
        except Dataset.DoesNotExist, DatasetRevision.DoesNotExist:
            raise DatasetNotFoundException()

        if self.dataset and self.dataset_revision:
            self.dataseti18n = DatasetI18n.objects.get(dataset_revision=self.dataset_revision,
                                                       language=self.dataset.user.language)

    def create(self, collect_type='index', allowed_states=CREATE_ALLOWED_STATES, language=None, **fields):
        """ Create a new Dataset """

        # Check for allowed states
        status = fields.get('status', StatusChoices.DRAFT)

        if int(status) not in allowed_states:
            raise IlegalStateException(allowed_states)

        language = fields.get('language', language)

        # Process file_data if exists
        file_data = fields.get('file_data', None)
        if file_data is not None:
            fields['file_size'] = file_data.size
            fields['file_name'] = file_data.name
            fields['end_point'] = 'file://' + active_datastore.create(self.user.account.id, self.user.id,
                                                                      settings.AWS_BUCKET_NAME, file_data)

        impl_details = DatasetImplBuilderWrapper(**fields).build()

        self.dataset, self.dataset_revision = DatasetDBDAO().create(user=self.user,
            collect_type=collect_type, title=fields['title'], description=fields['description'],
            language=language, status=status, category=fields['category'], impl_type=fields['impl_type'],
            file_name=fields['file_name'], end_point=fields['end_point'], file_size=fields.get('file_size', 0),
            notes=fields.get('notes', ''), license_url=fields.get('license_url',''), spatial=fields.get('spatial', ''),
            frequency=fields.get('frequency', ''), mbox=fields.get('mbox', ''), tags=fields.get('tags', []),
            sources=fields.get('sources', []), params=fields.get('params', []), impl_details=impl_details)

        self.dataseti18n = DatasetI18n.objects.get(
            dataset_revision=self.dataset_revision,
            language=self.dataset.user.language
        )

        self._update_last_revisions()
        self._log_activity( ActionStreams.CREATE)

        return self.dataset_revision

    def publish(self, allowed_states=PUBLISH_ALLOWED_STATES):
        """ Publica una revision de dataset """

        if self.dataset_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.dataset_revision)

        status = StatusChoices.PUBLISHED
        try:
            self._publish_childs()
        except IlegalStateException:
            # Si alguno de los hijos no se encuentra al menos aprobado,
            # entonces el dataset no es publicado quedando en estado aprobado
            status = StatusChoices.APPROVED

        self.dataset_revision.status = status
        self.dataset_revision.save()

        search_dao = DatasetSearchDAOFactory().create()
        search_dao.add(self.dataset_revision)

        self._update_last_revisions()

        self._log_activity(ActionStreams.PUBLISH)

    def _publish_childs(self):
        """ Intenta publicar la ultima revision de los datastreams hijos"""

        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(dataset=self.dataset.id,
                                                                                id=F('datastream__last_revision__id'))

            for datastream in datastreams:
                DatastreamLifeCycleManager(user=self.user, datastream_id=datastream.id).publish(
                    allowed_states=[StatusChoices.APPROVED])

    def unpublish(self, killemall=False, allowed_states=UNPUBLISH_ALLOWED_STATES):
        """ Despublica la revision de un dataset """

        if self.dataset_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.dataset_revision)

        if killemall:
            self._unpublish_all()
        else:
            revcount = DatasetRevision.objects.filter(dataset=self.dataset.id, status=StatusChoices.PUBLISHED).count()

            if revcount == 1:
                self._unpublish_all()
            else:
                self.dataset_revision.status = StatusChoices.DRAFT
                self.dataset_revision.save()

        search_dao = DatasetSearchDAOFactory().create()
        search_dao.remove(self.dataset_revision)

        self._update_last_revisions()

        self._log_activity(ActionStreams.UNPUBLISH)

    def _unpublish_all(self):
        """ Despublica todas las revisiones del dataset y la de todos sus datastreams hijos en cascada """

        DatasetRevision.objects.filter(dataset=self.dataset.id, status=StatusChoices.PUBLISHED)\
            .exclude(id=self.dataset_revision.id).update(status=StatusChoices.DRAFT)

        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(
                dataset=self.dataset.id,
                id=F('datastream__last_published_revision__id'),
                status=StatusChoices.PUBLISHED
            )

            for datastream in datastreams:
                DatastreamLifeCycleManager(self.user, datastream_id=datastream.id).unpublish(killemall=True)

    def send_to_review(self, allowed_states=SEND_TO_REVIEW_ALLOWED_STATES):
        """ Envia a revision un dataset """

        if self.dataset_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.dataset_revision)

        self._send_childs_to_review()

        self.dataset_revision.status = StatusChoices.PENDING_REVIEW
        self.dataset_revision.save()

    def _send_childs_to_review(self):
        """ Envia a revision todos los datastreams hijos en cascada """

        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(
                dataset=self.dataset.id,
                id=F('datastream__last_revision__id'),
                status=StatusChoices.DRAFT
            )

            for datastream in datastreams:
               DatastreamLifeCycleManager(self.user, datastream_id=datastream.id).send_to_review()

    def accept(self, allowed_states=ACCEPT_ALLOWED_STATES):
        """ accept a dataset revision """

        if self.dataset_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.dataset_revision)

        self.dataset_revision.status = StatusChoices.APPROVED
        self.dataset_revision.save()

    def reject(self, allowed_states=REJECT_ALLOWED_STATES):
        """ reject a dataset revision """

        if self.dataset_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.dataset_revision )

        self.dataset_revision.status = StatusChoices.DRAFT
        self.dataset_revision.save()

    def remove(self, killemall=False, allowed_states=REMOVE_ALLOWED_STATES):
        """ Elimina una revision o todas las revisiones de un dataset y la de sus datastreams hijos en cascada """

        # Tener en cuenta que si es necesario ejecutar varios delete, debemos crear un nuevo objecto LifeCycle

        if self.dataset_revision.status not in allowed_states:
            raise IlegalStateException(allowed_states, self.dataset_revision)

        if self.dataset_revision.status == StatusChoices.PUBLISHED:
            search_dao = DatasetSearchDAOFactory().create()
            search_dao.remove(self.dataset_revision)

        if killemall:
            self._remove_all()
        else:
            revcount = DatasetRevision.objects.filter(dataset=self.dataset.id, status=StatusChoices.PUBLISHED).count()

            if revcount == 1:
                # Si la revision a eliminar es la unica publicada entonces despublicar todos los datastreams en cascada
                self._unpublish_all()

            self.dataset_revision.delete()
            self._update_last_revisions()
            

        self._log_activity(ActionStreams.DELETE)
        self._delete_cache(cache_key='my_total_datasets_%d' % self.dataset.user.id)

    def _remove_all(self):
        self.dataset.delete()
        self._log_activity(ActionStreams.DELETE)
        self._delete_cache(cache_key='my_total_datasets_%d' % self.dataset.user.id)

    def edit(self, allowed_states=EDIT_ALLOWED_STATES, changed_fields=None, **fields):
        """create new revision or update it"""

        old_status = self.dataset_revision.status

        if old_status not in allowed_states:
            raise IlegalStateException(allowed_states, self.dataset_revision)

        if 'status' in fields.keys():
            form_status = fields.pop('status', None)

        file_data = fields.get('file_data', None)
        if file_data is not None:
            fields['file_size'] = file_data.size
            fields['file_name'] = file_data.name
            fields['end_point'] = 'file://' + active_datastore.create(self.user.account.id, self.user.id,
                                                                      settings.AWS_BUCKET_NAME, file_data)
            changed_fields += ['file_size', 'file_name', 'end_point']

        if old_status == StatusChoices.DRAFT:
            self.dataset_revision = DatasetDBDAO().update(
                self.dataset_revision, changed_fields, status=form_status, **fields)
        else:
            self.dataset, self.dataset_revision = DatasetDBDAO().create(
                dataset=self.dataset, user=self.user, status=StatusChoices.DRAFT, **fields)

            self._move_childs_to_draft()

        if form_status == StatusChoices.PUBLISHED:
            self.publish()
        elif old_status == StatusChoices.PUBLISHED and form_status == StatusChoices.DRAFT:
            self.unpublish()
        else:
            self._update_last_revisions()

        return self.dataset_revision

    def _move_childs_to_draft(self):

        with transaction.atomic():
            datastreams = DataStreamRevision.objects.select_for_update().filter(
                dataset=self.dataset.id,
                id=F('datastream__last_revision__id'),
                status=StatusChoices.PUBLISHED
            )

            for datastream in datastreams:
               DatastreamLifeCycleManager(self.user, datastream_id=datastream.id).save_as_draft()

    def save_as_draft(self):
        self.dataset_revision.clone()
        self._update_last_revisions()


    def _log_activity(self, action_id):
        return super(DatasetLifeCycleManager, self)._log_activity(action_id, self.dataset.id, self.dataset.type,
                                                                  self.dataset_revision.id, self.dataseti18n.title)

    def _update_last_revisions(self):
        """ update last_revision_id and last_published_revision_id """

        last_revision_id = DatasetRevision.objects.filter(dataset=self.dataset.id).aggregate(Max('id'))['id__max']

        if last_revision_id:
            self.dataset.last_revision = DatasetRevision.objects.get(pk=last_revision_id)
            last_published_revision_id = DatasetRevision.objects.filter(
                dataset=self.dataset.id,
                status=StatusChoices.PUBLISHED).aggregate(Max('id')
            )['id__max']
            
            if last_published_revision_id:
                self.dataset.last_published_revision = DatasetRevision.objects.get(pk=last_published_revision_id)                   
                
            self.dataset.save()
        else:
            # Si fue eliminado pero falta el commit, evito borrarlo nuevamente
            if self.dataset.id:
                self.dataset.delete()
