from django.test import TransactionTestCase
from django.db.models import F, Max

from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices, ODATA_FREQUENCY
from core.models import User, Category, Dataset, DatasetRevision
from core.lifecycle.datasets import DatasetLifeCycleManager


class LifeCycleManagerTestCase(TransactionTestCase):
    fixtures = ['account.json', 'accountlevel.json', 'category.json', 'categoryi18n.json', 'grant.json',
                'preference.json', 'privilege.json', 'role.json', 'threshold.json', 'user.json', ]

    def setUp(self):
        self.end_point = 'www.example.com'
        self.user_nick = 'administrador'

        self.user = User.objects.get(nick=self.user_nick)
        self.category = Category.objects.filter(account_id=self.user.account.id).order_by('-id')[0]
        self.collect_type = CollectTypeChoices.SELF_PUBLISH
        self.source_type = SourceImplementationChoices.HTML

    def create_dataset(self, status = StatusChoices.DRAFT):
        life_cycle = DatasetLifeCycleManager(user=self.user, language=self.user.language)

        self.dataset_revision = life_cycle.create(
            title='Test Dataset',
            collect_type=self.collect_type,
            description="Descripcion del dataset",
            end_point=self.end_point,
            notes='',
            category=self.category.id,
            impl_type=self.source_type,
            file_name='',
            status=status
        )

        self.dataset = self.dataset_revision.dataset

    def test_create_dataset(self):
        """
        Testing Lifecycle Manager Create Dataset Method
        """
        self.create_dataset()

        new_dataset = Dataset.objects.get(id=self.dataset.id)

        # Verifico los campos del dataset
        self.assertEqual(new_dataset.user, self.user)
        self.assertEqual(new_dataset.type, self.source_type)
        self.assertFalse(new_dataset.is_dead)
        self.assertIsNot(new_dataset.guid, '')
        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertIsNone(new_dataset.last_published_revision)

    def test_create_dataset_published(self):
        """
        Testing Lifecycle Manager Create Dataset Method
        """
        self.create_dataset(status = StatusChoices.PUBLISHED)

        new_dataset = Dataset.objects.get(id=self.dataset.id)

        # Verifico los campos del dataset
        self.assertEqual(new_dataset.user, self.user)
        self.assertEqual(new_dataset.type, self.source_type)
        self.assertFalse(new_dataset.is_dead)
        self.assertIsNot(new_dataset.guid, '')
        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertEqual(new_dataset.last_revision, new_dataset.last_published_revision)

    def test_remove_last_revision(self):
        """
        Testing Lifecycle Manager Remove Dataset Method
        """
        self.create_dataset()

        old_dataset = self.dataset
        old_dataset_revision = self.dataset.last_revision

        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.remove()

        # Verifico que elimine el dataset
        self.assertIs(Dataset.objects.filter(id=old_dataset.id).count(), 0)

        # Verifico que elimine la revision
        self.assertIs(DatasetRevision.objects.filter(id=old_dataset_revision.id).count(), 0)

    def test_send_to_review(self):
        """
        Testing Lifecycle Manager send to review
        """
        self.create_dataset()
        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.send_to_review()

        queryset = DatasetRevision.objects.filter(dataset=self.dataset)

        # Debe tener solo una Revision
        self.assertEqual(queryset.count(), 1)

        # El estado de la ultima revision debe ser PENDING REVIEW
        self.assertEqual(queryset[0].status, StatusChoices.PENDING_REVIEW)

        # Ultima revision es la unica revision
        self.assertEqual(queryset[0], self.dataset.last_revision)

    def test_accept(self):
        """
        Testing Lifecycle Manager accept Method
        """
        self.create_dataset()

        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.send_to_review()
        lifecycle.accept()

        queryset = DatasetRevision.objects.filter(dataset=self.dataset)

        # Debe tener solo una Revision
        self.assertEqual(queryset.count(), 1)

        # El estado de la ultima revision debe ser APPROVED
        self.assertEqual(queryset[0].status, StatusChoices.APPROVED)

    def test_publish(self):
        """
        Testing Lifecycle Manager publish Method
        """
        self.create_dataset()

        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.send_to_review()
        lifecycle.accept()
        lifecycle.publish()

        queryset = DatasetRevision.objects.filter(dataset=self.dataset)

        # Debe tener solo una Revision
        self.assertEqual(queryset.count(), 1)

        # El estado de la ultima revision debe ser PUBLISHED
        self.assertEqual(queryset[0].status, StatusChoices.PUBLISHED)

    def test_create_new_revisions(self):
        """
        Testing Lifecycle Manager creating new revisions
        """
        self.create_dataset()

        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.send_to_review()
        lifecycle.accept()
        lifecycle.publish()

        # Edito el recurso
        new_revision = lifecycle.edit(collect_type=self.collect_type, changed_fields=['title'],
                                              language=self.user.language,  title='Nuevo titulo',
                                              category=self.dataset_revision.category.id, file_name='',
                                              end_point=self.end_point, impl_type=self.source_type, file_size=0,
                                              license_url='', spatial='', frequency='monthly', mbox='', impl_details='',
                                              description='Nueva descripcion', notes='', tags=[], sources=[],
                                              status=StatusChoices.PUBLISHED)

        queryset = DatasetRevision.objects.filter(dataset=self.dataset)

        # Debe tener dos Revisiones
        self.assertEqual(queryset.count(), 2)

        # El estado de la ultima revision debe ser PUBLISHED
        self.assertEqual(new_revision.status, StatusChoices.PUBLISHED)

        # La ultima revision no debe ser la primera que creamos
        self.assertIsNot(self.dataset.last_revision, self.dataset_revision)

    def test_remove_last_revision_with_revisions(self):
        """
        Testing Lifecycle Manager remove revisions
        """
        self.create_dataset()
        old_dataset = self.dataset

        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.send_to_review()
        lifecycle.accept()
        lifecycle.publish()

        # Edito el recurso
        lifecycle.edit(collect_type=self.collect_type, changed_fields=['title'],
                                              language=self.user.language,  title='Nuevo titulo',
                                              category=self.dataset_revision.category.id, file_name='',
                                              end_point=self.end_point, impl_type=self.source_type, file_size=0,
                                              license_url='', spatial='', frequency='monthly', mbox='', impl_details='',
                                              description='Nueva descripcion', notes='', tags=[], sources=[],
                                              status=StatusChoices.PUBLISHED)

        # Edito el recurso
        last_revision = lifecycle.edit(collect_type=self.collect_type, changed_fields=['title'],
                                              language=self.user.language,  title='Nuevo titulo 1',
                                              category=self.dataset_revision.category.id, file_name='',
                                              end_point=self.end_point, impl_type=self.source_type, file_size=0,
                                              license_url='', spatial='', frequency='monthly', mbox='', impl_details='',
                                              description='Nueva descripcion 1', notes='', tags=[], sources=[],
                                              status=StatusChoices.PUBLISHED)

        # Debe tener 3 Revisiones
        revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
        self.assertEqual(revision_count, 3)

        # Verifico el last revision ID
        last_revision_id = DatasetRevision.objects.filter(dataset=self.dataset).aggregate(Max('id'))['id__max']
        self.assertEqual(last_revision_id, Dataset.objects.get(id=self.dataset.id).last_revision.id)
        self.assertEqual(last_revision_id, last_revision.id)
        
        
        # Verifico el last published revision ID
        last_published_revision_id = DatasetRevision.objects.filter(dataset=self.dataset, status=StatusChoices.PUBLISHED).aggregate(Max('id'))['id__max']
        self.assertEqual(last_published_revision_id, last_revision.dataset.last_published_revision.id)

        lifecycle.remove()

        # Debe tener 2 Revisiones
        revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
        self.assertEqual(revision_count, 2)

        # Verifico el last revision ID
        last_revision_id = DatasetRevision.objects.filter(dataset=self.dataset).aggregate(Max('id'))['id__max']
        self.assertEqual(last_revision_id, Dataset.objects.get(id=self.dataset.id).last_revision.id)

        # Remove
        self.dataset = Dataset.objects.get(id=self.dataset.id)
        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.remove()
        self.dataset = Dataset.objects.get(id=self.dataset.id)

        # Debe tener 1 Revisiones
        revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
        self.assertEqual(revision_count, 1)

        # Verifico el last revision ID
        last_revision_id = DatasetRevision.objects.filter(dataset=self.dataset).aggregate(Max('id'))['id__max']
        self.assertEqual(last_revision_id, self.dataset.last_revision.id)

        # Remove
        self.dataset = Dataset.objects.get(id=self.dataset.id)
        lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
                                            dataset_revision_id=self.dataset.last_revision.id)
        lifecycle.remove()

        # Debe tener 0 Revisiones
        revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
        self.assertEqual(revision_count, 0)

        # Verifico que elimine el dataset
        self.assertIs(Dataset.objects.filter(id=old_dataset.id).count(), 0)