from django.test import TestCase, TransactionTestCase, LiveServerTestCase
from django.db.models import F, Max

from core.search.elastic import ElasticsearchFinder
from core.engine import preview_chart
from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices, ODATA_FREQUENCY
from core.models import User, Category, Dataset, DatasetRevision
from core.lifecycle.datasets import DatasetLifeCycleManager

from workspace.exceptions import *
from workspace.middlewares.catch import ExceptionManager as ExceptionManagerMiddleWare
from django.test.client import RequestFactory
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
import os
from core.auth.auth import AuthManager
import re
from workspace.manageDatasets.forms import *

class ExpectionsTest(TransactionTestCase):
    def setUp(self):
        self.user_nick = 'administrador'
        self.user = User.objects.get(nick=self.user_nick)

        settings.TEMPLATE_DIRS = list(settings.TEMPLATE_DIRS)
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'workspace', 'templates'))
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'microsites', 'templates'))
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'api', 'templates'))
        settings.TEMPLATE_DIRS = tuple(settings.TEMPLATE_DIRS)

    def SearchText(self,text,expression):
        pattern=re.compile(expression, flags=re.IGNORECASE)
        return re.search(pattern, text)

    def FakeRequest(self, space, type_response):
        request = RequestFactory().get('/'+space+'/', HTTP_ACCEPT=type_response)
        request.user = AnonymousUser()
        request.auth_manager = AuthManager(language="en")
        return request

    def test_exception_generator(self):
        e = Exception.__new__(eval(options['exception']))
        space = 'workspace'
        type_response = 'text/html'
        request = self.FakeRequest(space,type_response)
        middleware = ExceptionManagerMiddleWare()

        ObjHttpResponse = middleware.process_exception(request,e)
        self.assertContains(ObjHttpResponse._container[0],unicode(e.title),html=True)
        self.assertContains(ObjHttpResponse._container[0],unicode(e.description),html=True)

class ExpectionsTest(TransactionTestCase):
    def setUp(self):
        self.user_nick = 'administrador'
        self.user = User.objects.get(nick=self.user_nick)

        settings.TEMPLATE_DIRS = list(settings.TEMPLATE_DIRS)
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'workspace', 'templates'))
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'microsites', 'templates'))
        settings.TEMPLATE_DIRS.append(os.path.join(settings.PROJECT_PATH, 'api', 'templates'))
        settings.TEMPLATE_DIRS = tuple(settings.TEMPLATE_DIRS)

    def SearchText(self,text,expression):
        pattern=re.compile(expression, flags=re.IGNORECASE)
        return re.search(pattern, text)

    def FakeRequest(self, space, type_response):
        request = RequestFactory().get('/'+space+'/', HTTP_ACCEPT=type_response)
        request.user = AnonymousUser()
        request.auth_manager = AuthManager(language="en")
        return request

    def test_exception_generator(self):
        e = Exception.__new__(eval(options['exception']))
        space = 'workspace'
        type_response = 'text/html'
        request = self.FakeRequest(space,type_response)
        middleware = ExceptionManagerMiddleWare()

        ObjHttpResponse = middleware.process_exception(request,e)
        self.assertContains(ObjHttpResponse._container[0],unicode(e.title),html=True)
        self.assertContains(ObjHttpResponse._container[0],unicode(e.description),html=True)




class LifeCycleManagerTestCase(TransactionTestCase):
    fixtures = ['account.json', 'accountlevel.json', 'category.json', 'categoryi18n.json', 'grant.json',
                'preference.json', 'privilege.json', 'role.json', 'threshold.json', 'user.json', ]

    def setUp(self):
        self.end_point = 'http://nolaborables.com.ar/API/v1/2013'
        self.user_nick = 'administrador'
        self.user_admin = User.objects.get(nick='administrador')
        self.user_editor = User.objects.get(nick='editor')
        self.user_publicador = User.objects.get(nick='publicador')

        self.user = User.objects.get(nick=self.user_nick)
        self.category = Category.objects.filter(account_id=self.user.account.id).order_by('-id')[0]
        self.collect_type = CollectTypeChoices.SELF_PUBLISH
        self.source_type = SourceImplementationChoices.HTML

    def create_dataset(self, status=StatusChoices.DRAFT, user=None):
        life_cycle = DatasetLifeCycleManager(user=user, language=user.language)

        dataset_rev = life_cycle.create(
            title='Test Dataset',
            collect_type=self.collect_type,
            description="Descripcion del dataset",
            end_point=self.end_point,
            notes='Test notes',
            category=self.category.id,
            impl_type=self.source_type,
            file_name='',
            status=status
        )

        dataset = dataset_rev.dataset
        return dataset, dataset_rev

    def test_create_dataset_as_admin(self):
        """
        [Lifecycle] Test de creacion de dataset como usuario administrador
        """
        dataset, rev = self.create_dataset(user=self.user_admin)

        new_dataset = Dataset.objects.get(id=dataset.id)

        # Verifico los campos del dataset
        self.assertEqual(new_dataset.user, self.user_admin)
        self.assertEqual(new_dataset.type, self.source_type)
        self.assertFalse(new_dataset.is_dead)
        self.assertIsNot(new_dataset.guid, '')
        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertIsNone(new_dataset.last_published_revision)

    def test_create_dataset_as_editor(self):
        """
        [Lifecycle] Test de creacion de dataset como usuario editor
        """
        dataset, rev = self.create_dataset(user=self.user_editor)

        new_dataset = Dataset.objects.get(id=dataset.id)

        # Verifico los campos del dataset
        self.assertEqual(new_dataset.user, self.user_editor)
        self.assertEqual(new_dataset.type, self.source_type)
        self.assertFalse(new_dataset.is_dead)
        self.assertIsNot(new_dataset.guid, '')
        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertIsNone(new_dataset.last_published_revision)

    def test_publish_dataset_as_admin(self):
        """
        [Lifecycle] Test de publicacion de dataset como usuario administrador
        """
        dataset, rev = self.create_dataset(user=self.user_admin)

        life = DatasetLifeCycleManager(self.user_admin, dataset_revision_id=rev.id)
        life.publish()

        new_dataset = Dataset.objects.get(id=dataset.id)

        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertEqual(new_dataset.last_published_revision, DatasetRevision.objects.get(dataset=new_dataset))

    def test_publish_dataset_as_editor(self):
        """
        [Lifecycle] Test de publicacion de dataset como usuario editor
        """
        dataset, rev = self.create_dataset(user=self.user_editor)

        life = DatasetLifeCycleManager(self.user_editor, dataset_revision_id=rev.id)
        life.publish()

        new_dataset = Dataset.objects.get(id=dataset.id)

        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertEqual(new_dataset.last_published_revision, DatasetRevision.objects.get(dataset=new_dataset))

    def test_unpublish_dataset_as_admin(self):
        """
        [Lifecycle] Test de despublicar de dataset como usuario administrador
        """
        dataset, rev = self.create_dataset(user=self.user_admin)

        life = DatasetLifeCycleManager(self.user_admin, dataset_revision_id=rev.id)
        life.publish()

        new_dataset = Dataset.objects.get(id=dataset.id)

        life = DatasetLifeCycleManager(self.user_admin, dataset_id=new_dataset.id)
        life.unpublish()

        new_dataset = Dataset.objects.get(id=dataset.id)

        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertIsNone(new_dataset.last_published_revision)

    def test_unpublish_dataset_as_editor(self):
        """
        [Lifecycle] Test de despublicar de dataset como usuario editor
        """
        dataset, rev = self.create_dataset(user=self.user_editor)

        life = DatasetLifeCycleManager(self.user_editor, dataset_revision_id=rev.id)
        life.publish()

        new_dataset = Dataset.objects.get(id=dataset.id)

        life = DatasetLifeCycleManager(self.user_editor, dataset_id=new_dataset.id)
        life.unpublish()

        new_dataset = Dataset.objects.get(id=dataset.id)

        self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
        self.assertIsNone(new_dataset.last_published_revision)

    # def test_create_dataset_published(self):
    #     """
    #     Testing Lifecycle Manager Create Dataset Method
    #     """
    #     self.create_dataset(status = StatusChoices.PUBLISHED)
    #
    #     new_dataset = Dataset.objects.get(id=self.dataset.id)
    #
    #     # Verifico los campos del dataset
    #     self.assertEqual(new_dataset.user, self.user)
    #     self.assertEqual(new_dataset.type, self.source_type)
    #     self.assertFalse(new_dataset.is_dead)
    #     self.assertIsNot(new_dataset.guid, '')
    #     self.assertEqual(new_dataset.last_revision, DatasetRevision.objects.get(dataset=new_dataset))
    #     self.assertEqual(new_dataset.last_revision, new_dataset.last_published_revision)

    # def test_remove_last_revision(self):
    #     """
    #     Testing Lifecycle Manager Remove Dataset Method
    #     """
    #     self.create_dataset()
    #
    #     old_dataset = self.dataset
    #     old_dataset_revision = self.dataset.last_revision
    #
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.remove()
    #
    #     # Verifico que elimine el dataset
    #     self.assertIs(Dataset.objects.filter(id=old_dataset.id).count(), 0)
    #
    #     # Verifico que elimine la revision
    #     self.assertIs(DatasetRevision.objects.filter(id=old_dataset_revision.id).count(), 0)

    # def test_send_to_review(self):
    #     """
    #     Testing Lifecycle Manager send to review
    #     """
    #     self.create_dataset()
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.send_to_review()
    #
    #     queryset = DatasetRevision.objects.filter(dataset=self.dataset)
    #
    #     # Debe tener solo una Revision
    #     self.assertEqual(queryset.count(), 1)
    #
    #     # El estado de la ultima revision debe ser PENDING REVIEW
    #     self.assertEqual(queryset[0].status, StatusChoices.PENDING_REVIEW)
    #
    #     # Ultima revision es la unica revision
    #     self.assertEqual(queryset[0], self.dataset.last_revision)

    # def test_accept(self):
    #     """
    #     Testing Lifecycle Manager accept Method
    #     """
    #     self.create_dataset()
    #
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.send_to_review()
    #     lifecycle.accept()
    #
    #     queryset = DatasetRevision.objects.filter(dataset=self.dataset)
    #
    #     # Debe tener solo una Revision
    #     self.assertEqual(queryset.count(), 1)
    #
    #     # El estado de la ultima revision debe ser APPROVED
    #     self.assertEqual(queryset[0].status, StatusChoices.APPROVED)

    # def test_publish(self):
    #     """
    #     Testing Lifecycle Manager publish Method
    #     """
    #     self.create_dataset()
    #
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.send_to_review()
    #     lifecycle.accept()
    #     lifecycle.publish()
    #
    #     queryset = DatasetRevision.objects.filter(dataset=self.dataset)
    #
    #     # Debe tener solo una Revision
    #     self.assertEqual(queryset.count(), 1)
    #
    #     # El estado de la ultima revision debe ser PUBLISHED
    #     self.assertEqual(queryset[0].status, StatusChoices.PUBLISHED)

    # def test_create_new_revisions(self):
    #     """
    #     Testing Lifecycle Manager creating new revisions
    #     """
    #     self.create_dataset()
    #
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.send_to_review()
    #     lifecycle.accept()
    #     lifecycle.publish()
    #
    #     # Edito el recurso
    #     new_revision = lifecycle.edit(collect_type=self.collect_type, changed_fields=['title'],
    #                                           language=self.user.language,  title='Nuevo titulo',
    #                                           category=self.dataset_revision.category.id, file_name='',
    #                                           end_point=self.end_point, impl_type=self.source_type, file_size=0,
    #                                           license_url='', spatial='', frequency='monthly', mbox='', impl_details='',
    #                                           description='Nueva descripcion', notes='', tags=[], sources=[],
    #                                           status=StatusChoices.PUBLISHED)
    #
    #     queryset = DatasetRevision.objects.filter(dataset=self.dataset)
    #
    #     # Debe tener dos Revisiones
    #     self.assertEqual(queryset.count(), 2)
    #
    #     # El estado de la ultima revision debe ser PUBLISHED
    #     self.assertEqual(new_revision.status, StatusChoices.PUBLISHED)
    #
    #     # La ultima revision no debe ser la primera que creamos
    #     self.assertIsNot(self.dataset.last_revision, self.dataset_revision)

    # def test_remove_last_revision_with_revisions(self):
    #     """
    #     Testing Lifecycle Manager remove revisions
    #     """
    #     self.create_dataset()
    #     old_dataset = self.dataset
    #
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.send_to_review()
    #     lifecycle.accept()
    #     lifecycle.publish()
    #
    #     # Edito el recurso
    #     lifecycle.edit(collect_type=self.collect_type, changed_fields=['title'],
    #                                           language=self.user.language,  title='Nuevo titulo',
    #                                           category=self.dataset_revision.category.id, file_name='',
    #                                           end_point=self.end_point, impl_type=self.source_type, file_size=0,
    #                                           license_url='', spatial='', frequency='monthly', mbox='', impl_details='',
    #                                           description='Nueva descripcion', notes='', tags=[], sources=[],
    #                                           status=StatusChoices.PUBLISHED)
    #
    #     # Edito el recurso
    #     last_revision = lifecycle.edit(collect_type=self.collect_type, changed_fields=['title'],
    #                                           language=self.user.language,  title='Nuevo titulo 1',
    #                                           category=self.dataset_revision.category.id, file_name='',
    #                                           end_point=self.end_point, impl_type=self.source_type, file_size=0,
    #                                           license_url='', spatial='', frequency='monthly', mbox='', impl_details='',
    #                                           description='Nueva descripcion 1', notes='', tags=[], sources=[],
    #                                           status=StatusChoices.PUBLISHED)
    #
    #     # Debe tener 3 Revisiones
    #     revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
    #     self.assertEqual(revision_count, 3)
    #
    #     # Verifico el last revision ID
    #     last_revision_id = DatasetRevision.objects.filter(dataset=self.dataset).aggregate(Max('id'))['id__max']
    #     self.assertEqual(last_revision_id, Dataset.objects.get(id=self.dataset.id).last_revision.id)
    #     self.assertEqual(last_revision_id, last_revision.id)
    #
    #
    #     # Verifico el last published revision ID
    #     last_published_revision_id = DatasetRevision.objects.filter(dataset=self.dataset, status=StatusChoices.PUBLISHED).aggregate(Max('id'))['id__max']
    #     self.assertEqual(last_published_revision_id, last_revision.dataset.last_published_revision.id)
    #
    #     lifecycle.remove()
    #
    #     # Debe tener 2 Revisiones
    #     revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
    #     self.assertEqual(revision_count, 2)
    #
    #     # Verifico el last revision ID
    #     last_revision_id = DatasetRevision.objects.filter(dataset=self.dataset).aggregate(Max('id'))['id__max']
    #     self.assertEqual(last_revision_id, Dataset.objects.get(id=self.dataset.id).last_revision.id)
    #
    #     # Remove
    #     self.dataset = Dataset.objects.get(id=self.dataset.id)
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.remove()
    #     self.dataset = Dataset.objects.get(id=self.dataset.id)
    #
    #     # Debe tener 1 Revisiones
    #     revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
    #     self.assertEqual(revision_count, 1)
    #
    #     # Verifico el last revision ID
    #     last_revision_id = DatasetRevision.objects.filter(dataset=self.dataset).aggregate(Max('id'))['id__max']
    #     self.assertEqual(last_revision_id, self.dataset.last_revision.id)
    #
    #     # Remove
    #     self.dataset = Dataset.objects.get(id=self.dataset.id)
    #     lifecycle = DatasetLifeCycleManager(user=self.user, language=self.user.language,
    #                                         dataset_revision_id=self.dataset.last_revision.id)
    #     lifecycle.remove()
    #
    #     # Debe tener 0 Revisiones
    #     revision_count = DatasetRevision.objects.filter(dataset=self.dataset).count()
    #     self.assertEqual(revision_count, 0)
    #
    #     # Verifico que elimine el dataset
    #     self.assertIs(Dataset.objects.filter(id=old_dataset.id).count(), 0)


class TestEngine(TestCase):

    def test_preview_chart(self):
        """
        [Engine] Test de vista previa de graficos
        """
        query = {
            'pInvertedAxis': u'',
            'pNullValuePreset': u'',
            'pHeaderSelection': u'K1:K1',
            'pId': 70703,
            'pType': u'linechart',
            'pData': u'K2:K4',
            'pNullValueAction': u'exclude',
            'pLabelSelection': u'C2:C4',
            'pInvertData': u''
        }
        result, content_type = preview_chart(query)
        # print result
        assert content_type == 'application/json; charset=UTF-8'

    def test_preview_map(self):
        """
        [Engine] Test de vista previa de mapas
        """
        query = {
            'pId': 70703,
            'pType': 'mapchart',
            'pNullValueAction': 'exclude',
            'pNullValuePreset': '',
            'pData': 'C2:C12',
            'pLatitudSelection': 'K2:K12',
            'pLongitudSelection': 'L2:L12',
            'pHeaderSelection': '',
            'pTraceSelection': '',
            # 'pZoom': '1',
            # 'pBounds': '-24.237324317659557;-45.949525292619;-42.98732431765956;-95.230775292619'
        }
        result, content_type = preview_chart(query)
        # print result, content_type
        assert content_type == 'application/json; charset=UTF-8'


class TestElasticSearch(TestCase):

    def test_es_search(self):
        """
        [ElasticSearch] Test de busqueda en elastic search
        """
        es = ElasticsearchFinder()
        resource = ["ds", "dt", "db", "chart", "vt"]

        query = 'iniciativas'
        category_filters = ['finanzas']
        results, searchtime, facets = es.search(
            query=query,
            account_id=1,
            category_filters=category_filters
        )
        for result in results:
            pass

        assert len(results) == 2
