from django.test import TransactionTestCase

from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices
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


    def create_dataset(self):
        life_cycle = DatasetLifeCycleManager(user=self.user)

        self.dataset = life_cycle.create(
            title='Test Dataset',
            collect_type=self.collect_type,
            description="Descripcion del dataset",
            end_point=self.end_point,
            notes='',
            category=self.category.id,
            impl_type=self.source_type,
            file_name=''
        )

    def send_to_review(self):
        # Send to review
        lifecycle = DatasetLifeCycleManager(user=self.user, dataset_revision_id=self.dataset.last_revision.get().id)
        dataset_revision = lifecycle.edit(changed_fields=['status'],
                                          language=self.user.language,  status=StatusChoices.PENDING_REVIEW,
                                          title='Test Dataset', collect_type=self.collect_type,
                                          description="Descripcion del dataset", end_point=self.end_point, notes='',
                                          category=self.category.id, impl_type=self.source_type, file_name='', tags=[],
                                          sources=[])

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

    def test_send_to_review(self):
        """
        Testing Lifecycle Manager Send to Review Dataset Method
        """
        self.create_dataset()
        self.send_to_review()


    def test_remove_last_revision(self):
        """
        Testing Lifecycle Manager Remove Dataset Method
        """
        self.create_dataset()

        old_dataset = self.dataset
        old_dataset_revision = self.dataset.last_revision.get()

        lifecycle = DatasetLifeCycleManager(user=self.user, dataset_revision_id=self.dataset.last_revision.get().id)
        lifecycle.remove()

        # Verifico que elimine el dataset
        self.assertIs(Dataset.objects.filter(id=old_dataset.id).count(), 0)

        # Verifico que elimine la revision
        self.assertIs(DatasetRevision.objects.filter(id=old_dataset_revision.id).count(), 0)

    def test_send_to_review_dataset(self):
        """
        Testing Lifecycle Manager send to review
        """
        self.create_dataset()
        self.send_to_review()

        queryset = DatasetRevision.objects.filter(dataset=self.dataset)

        # Debe tener solo un Dataset Revision
        self.assertEqual(queryset.count(), 1)

        # El estado de la ultima revision debe ser PENDING REVIEW
        self.assertEqual(queryset[0].status, StatusChoices.PENDING_REVIEW)
    