from django.test import TransactionTestCase

from core.choices import CollectTypeChoices, SourceImplementationChoices
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
        self.life_cycle = DatasetLifeCycleManager(user=self.user)
        self.collect_type = CollectTypeChoices.SELF_PUBLISH
        self.source_type = SourceImplementationChoices.HTML


    def test_create_dataset(self):
        """
        Testing Lifecycle Manager Create Dataset Method
        """

        self.dataset = self.life_cycle.create(
            title='Test Dataset',
            collect_type=self.collect_type,
            description="Descripcion del dataset",
            end_point=self.end_point,
            notes='',
            category=self.category.id,
            impl_type=self.source_type,
            file_name=''
        )

        new_dataset = Dataset.objects.get(id=self.dataset.id)

        # Verifico los campos del dataset
        self.assertEqual(new_dataset.user, self.user)
        self.assertEqual(new_dataset.type, self.source_type)
        self.assertFalse(new_dataset.is_dead)
        self.assertIsNot(new_dataset.guid, '')
        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertIsNone(new_dataset.last_published_revision)
