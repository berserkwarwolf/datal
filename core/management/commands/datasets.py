from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices
from core.models import User, Category
from core.lifecycle.datasets import DatasetLifeCycleManager


class Command(BaseCommand):
    help = "Run actions into datasets."

    option_list = BaseCommand.option_list + (
        make_option('--create-dummy',
            dest='create_dummy',
            default='',
            help='Create dummy datasets'),

        make_option('--user',
            dest='user',
            default='',
            help='Assign datasets to user given'),

        make_option('--with-revisions',
            action='store_true',
            dest='with_revisions',
            default=False,
            help='Add revisions to Dataset'),
    )

    def handle(self, *args, **options):

        # Creates dummy Datasets
        if options['create_dummy']:
            end_point = 'www.example.com'

            try:
                create_count = int(options['create_dummy'])
            except:
                raise CommandError('Create dummy datasets must provide a number of datasets to create.')

            if 'user' not in options.keys() or not options['user']:
                raise CommandError('Create dummy datasets must provide a user (--user=username) to assign datasets')

            try:
                user = User.objects.get(nick=options['user'])
            except:
                raise CommandError('Can not found User with username {}.'.format(options['user']))

            try:
                category = Category.objects.filter(account_id=user.account.id).order_by('-id')[0]
            except:
                raise CommandError('Can not found Categories for user {}.'.format(user))

            life_cycle = DatasetLifeCycleManager(user=user)
            collect_type = CollectTypeChoices.SELF_PUBLISH
            source_type = SourceImplementationChoices.HTML

            for x in range(0, create_count):
                dataset_revision = life_cycle.create(
                    title='Dummy Dataset',
                    collect_type=collect_type,
                    description="Descripcion del dataset",
                    end_point=end_point,
                    notes='',
                    category=category.id,
                    impl_type=source_type,
                    file_name=''
                )

                if options['with_revisions']:
                    lifecycle = DatasetLifeCycleManager(user=user, language=user.language,
                                                        dataset_revision_id=dataset_revision.id)
                    lifecycle.send_to_review()
                    lifecycle.accept()
                    lifecycle.publish()

                    # Edito el recurso
                    lifecycle.edit(collect_type=collect_type, changed_fields=['title'], language=user.language,
                                   title='Nuevo titulo', category=category.id, file_name='', end_point=end_point,
                                   impl_type=source_type, file_size=0, license_url='', spatial='', frequency='monthly',
                                   mbox='', impl_details='', description='Nueva descripcion', notes='', tags=[],
                                   sources=[], status=StatusChoices.PUBLISHED)

                    # Edito el recurso
                    lifecycle.edit(collect_type=collect_type, changed_fields=['title'], language=user.language,
                                   title='Nuevo titulo 1', category=category.id, file_name='', end_point=end_point,
                                   impl_type=source_type, file_size=0, license_url='', spatial='', frequency='monthly',
                                   mbox='', impl_details='', description='Nueva descripcion', notes='', tags=[],
                                   sources=[], status=StatusChoices.PUBLISHED)

                    # Edito el recurso
                    lifecycle.edit(collect_type=collect_type, changed_fields=['title'], language=user.language,
                                   title='Nuevo titulo 2', category=category.id, file_name='', end_point=end_point,
                                   impl_type=source_type, file_size=0, license_url='', spatial='', frequency='monthly',
                                   mbox='', impl_details='', description='Nueva descripcion', notes='', tags=[],
                                   sources=[], status=StatusChoices.PUBLISHED)

            self.stdout.write('Datasets created successfully')
