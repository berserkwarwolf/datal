import json, re, pprint
from django.template.defaultfilters import slugify as django_slugify
from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices
from core.models import User, Category
from core.lifecycle.datasets import DatasetLifeCycleManager

DATASET_FIXTURES = 'core/fixtures/dataset.json'
DATASETI18N_FIXTURES = 'core/fixtures/dataseti18n.json'
DATASETREVISION_FIXTURES = 'core/fixtures/datasetrevision.json'
DATASTREAM_FIXTURES = 'core/fixtures/datastream.json'
DATASTREAMREVISION_FIXTURES = 'core/fixtures/datastreamrevision.json'
SOURCE_FIXTURES = 'core/fixtures/source.json'
SOURCEDATASTREAMREVISION_FIXTURES = 'core/fixtures/sourcedatastream.json'
TAG_FIXTURES = 'core/fixtures/tag.json'


class Command(BaseCommand):
    help = "Run actions into datasets."

    option_list = BaseCommand.option_list + (
        make_option('--migrate-datasets',
            action='store_true',
            dest='migrate_dataset',
            default=False,
            help='Migrate old dataset fixtures'),

        make_option('--migrate-datastream',
            action='store_true',
            dest='migrate_datastream',
            default=False,
            help='Migrate old datastream fixtures'),

        make_option('--migrate-sources',
            action='store_true',
            dest='migrate_sources',
            default=False,
            help='Migrate old sources fixtures'),

        make_option('--migrate-tags',
            action='store_true',
            dest='migrate_tags',
            default=False,
            help='Migrate old tags fixtures'),
    )

    def _set_guid(self, _title, force_random=False):
        #if self._title:
        title_word_list = [ word for word in self.slugify(_title).split('-') if word ][:5]
        guid = ''
        # killing duplicates?
        if not force_random:
            guid = '-'.join(word[:5] for word in title_word_list).upper()
        else:
            import random
            if len(title_word_list) >= 5:
                guid = '-'.join(word[:5] for word in title_word_list[:-1] + [str(random.randint(10000, 99999))]).upper()
            else:
                guid = '-'.join(word[:5] for word in title_word_list + [str(random.randint(10000, 99999))]).upper()
        return guid

    def slugify(self, value):
        value = django_slugify(value)
        value = value.replace('_', '-')
        value = re.sub('[^a-zA-Z0-9]+', '-', value.strip())
        value = re.sub('\-+', '-', value)
        value = re.sub('\-$', '', value)
        return value

    def get_title(self, id):
        title = ''
        for dataseti18n in self.datasetsi18n:
            if id == dataseti18n['fields']['dataset_revision']:
                title = dataseti18n['fields']['title']
        return title

    def get_last_dataset_revision(self, id):
        revision_id = None
        for revision in self.datasetrevision:
            if id == revision['fields']['dataset']:
                revision_id = revision['pk']
        return revision_id

    def get_last_published_dataset_revision(self, id):
        revision_id = None
        for revision in self.datasetrevision:
            if id == revision['fields']['dataset'] and 3 == revision['fields']['status']:
                revision_id = revision['pk']
        return revision_id

    def get_last_datastream_revision(self, id):
        revision_id = None
        for revision in self.datastream_revision:
            if id == revision['fields']['datastream']:
                revision_id = revision['pk']
        return revision_id

    def get_last_published_datastream_revision(self, id):
        revision_id = None
        for revision in self.datastream_revision:
            if id == revision['fields']['datastream'] and 3 == revision['fields']['status']:
                revision_id = revision['pk']
        return revision_id

    def handle(self, *args, **options):
        if options['migrate_dataset']:
            f_dataset = open(DATASET_FIXTURES, 'r')
            f_datasetsi18n = open(DATASETI18N_FIXTURES, 'r')
            f_datasetrevision = open(DATASETREVISION_FIXTURES, 'r')

            self.dataset = json.load(f_dataset)
            self.datasetsi18n = json.load(f_datasetsi18n)
            self.datasetrevision = json.load(f_datasetrevision)

            f_dataset.close()
            f_datasetsi18n.close()
            f_datasetrevision.close()

            datasets = []
            for row in self.dataset:
                revision_id = self.get_last_dataset_revision(row['pk'])
                title = self.get_title(revision_id)
                row['fields']['guid'] = self._set_guid(title, force_random=True)
                row['fields']["created_at"] = "2012-06-04T14:12:52"
                row['fields']["last_revision"] = self.get_last_dataset_revision(row['pk'])
                row['fields']["last_published_revision"] = self.get_last_published_dataset_revision(row['pk'])
                datasets.append(row)

            f_dataset = open('{}.migrated'.format(DATASET_FIXTURES), 'w')
            f_dataset.writelines(json.dumps(datasets, indent=4))
            f_dataset.close()

        if options['migrate_datastream']:
            f_datastream = open(DATASTREAM_FIXTURES, 'r')
            f_datastream_revision = open(DATASTREAMREVISION_FIXTURES, 'r')

            self.datastream = json.load(f_datastream)
            self.datastream_revision = json.load(f_datastream_revision)

            f_datastream.close()
            f_datastream_revision.close()

            datastreams = []
            for row in self.datastream:
                if row['fields'].has_key('is_private'):
                    row['fields'].pop("is_private", None)

                row['fields']["last_revision"] = self.get_last_datastream_revision(row['pk'])
                row['fields']["last_published_revision"] = self.get_last_published_datastream_revision(row['pk'])

                datastreams.append(row)

            f_datastream = open('{}.migrated'.format(DATASTREAM_FIXTURES), 'w')
            f_datastream.writelines(json.dumps(datastreams, indent=4))
            f_datastream.close()

        if options['migrate_sources']:
            f_source = open(SOURCE_FIXTURES, 'r')
            self.source = json.load(f_source)
            f_source.close()

            sources = []
            sourcedatastreamrevision = []
            pk = 0
            for row in self.source:
                datastream_revisions_id = row['fields'].pop("datastream_revision", None)
                for datastream_revision_id in datastream_revisions_id:
                    pk += 1
                    sourcedatastreamrevision.append(dict(
                        pk=pk,
                        model='core.sourcedatastream',
                        fields=dict(
                            source=row['pk'],
                            datastreamrevision=datastream_revision_id
                        )
                    ))
                sources.append(row)

            f_source = open('{}.migrated'.format(SOURCE_FIXTURES), 'w')
            f_source.writelines(json.dumps(sources, indent=4))
            f_source.close()

            f_source = open('{}.migrated'.format(SOURCEDATASTREAMREVISION_FIXTURES), 'w')
            f_source.writelines(json.dumps(sourcedatastreamrevision, indent=4))
            f_source.close()

        if options['migrate_tags']:
            f_tag = open(TAG_FIXTURES, 'r')
            self.tag = json.load(f_tag)
            f_tag.close()

            tags = []
            tagdatasets = []
            tagdatastreams = []

            for row in self.tag:
                pass