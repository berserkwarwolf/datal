from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.choices import CollectTypeChoices, SourceImplementationChoices
from core.models import Dataset, User, Category
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
                life_cycle.create(
                    title='Dummy Dataset',
                    collect_type=collect_type,
                    description="Descripcion del dataset",
                    end_point=end_point,
                    notes='',
                    category=category.id,
                    impl_type=source_type,
                    file_name=''
                )

            self.stdout.write('Datasets created successfully')