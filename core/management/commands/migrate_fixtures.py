import json, re, pprint
from django.core.management.base import BaseCommand, CommandError

from optparse import make_option

from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices
from core.models import User, Category
from core.lifecycle.datasets import DatasetLifeCycleManager
from core.utils import slugify

DATASET_FIXTURES = 'core/fixtures/dataset.json'
DATASETI18N_FIXTURES = 'core/fixtures/dataseti18n.json'
DATASETREVISION_FIXTURES = 'core/fixtures/datasetrevision.json'
DATASTREAM_FIXTURES = 'core/fixtures/datastream.json'
DATASTREAM_PARAMETERS_FIXTURES = 'core/fixtures/datastreamparameters.json'
DATASTREAMI18N_FIXTURES = 'core/fixtures/datastreami18n.json'
DATASTREAMREVISION_FIXTURES = 'core/fixtures/datastreamrevision.json'
SOURCE_FIXTURES = 'core/fixtures/source.json'
SOURCEDATASTREAMREVISION_FIXTURES = 'core/fixtures/sourcedatastream.json'
TAG_FIXTURES = 'core/fixtures/tag.json'
TAGDATASET_FIXTURES = 'core/fixtures/tagdataset.json'
TAGDATASTREAM_FIXTURES = 'core/fixtures/tagdatastream.json'


class Command(BaseCommand):
    help = "Run actions into datasets."

    option_list = BaseCommand.option_list + (
    )

    def _set_guid(self, _title, force_random=False):
        #if self._title:
        title_word_list = [ word for word in slugify(_title).split('-') if word ][:5]
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

    def datastream_revision_exist(self, id):
        for dt in self.datastream_revision:
            if id == dt['pk']:
                return True
        return False

    def datastream_exist(self, id):
        for dt in self.datastream:
            if id == dt['pk']:
                return True
        return False

    def dataset_exist(self, id):
        for dt in self.dataset:
            if id == dt['pk']:
                return True
        return False

    def handle(self, *args, **options):
        # Dataset
        f_dataset = open(DATASET_FIXTURES, 'r')
        f_datasetsi18n = open(DATASETI18N_FIXTURES, 'r')
        f_datasetrevision = open(DATASETREVISION_FIXTURES, 'r')
        f_datastreami18n = open(DATASTREAMI18N_FIXTURES, 'r')
        f_datastream_parameters = open(DATASTREAMI18N_FIXTURES, 'r')

        self.dataset = json.load(f_dataset)
        self.datasetsi18n = json.load(f_datasetsi18n)
        self.datasetrevision = json.load(f_datasetrevision)
        self.datastreami18n = json.load(f_datastreami18n)
        self.datastream_parameter = json.load(f_datastream_parameters)

        f_dataset.close()
        f_datasetsi18n.close()
        f_datasetrevision.close()
        f_datastreami18n.close()
        f_datastream_parameters.close()

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

        # Datastream
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

        # Datastream Revision
        datatream_revisions = []
        for row in self.datastream_revision:
            add = True

            if not row['fields']["rdf_template"]:
                row['fields']["rdf_template"] = ''

            if not self.datastream_exist(row['fields']["datastream"]):
                add = False

            if not self.dataset_exist(row['fields']["dataset"]):
                add = False

            if add:
               datatream_revisions.append(row)

        f_datastreamrevision = open('{}.migrated'.format(DATASTREAMREVISION_FIXTURES), 'w')
        f_datastreamrevision.writelines(json.dumps(datatream_revisions, indent=4))
        f_datastreamrevision.close()

        # DatastreamI18N
        datatreami18ns = []
        for row in self.datastreami18n:
            add = True

            if not self.datastream_revision_exist(row['fields']["datastream_revision"]):
                add = False

            if add:
               datatreami18ns.append(row)

        f_datastreami18n = open('{}.migrated'.format(DATASTREAMI18N_FIXTURES), 'w')
        f_datastreami18n.writelines(json.dumps(datatreami18ns, indent=4))
        f_datastreami18n.close()

        # Datastream parameters
        datatream_parameters = []
        for row in self.datastream_parameter:
            add = True
            if not self.datastream_revision_exist(row['fields']["datastream_revision"]):
                add = False

            if add:
               datatream_parameters.append(row)

        f_datatream_parameters = open('{}.migrated'.format(DATASTREAM_PARAMETERS_FIXTURES), 'w')
        f_datatream_parameters.writelines(json.dumps(datatream_parameters, indent=4))
        f_datatream_parameters.close()

        # Source
        f_source = open(SOURCE_FIXTURES, 'r')
        self.source = json.load(f_source)
        f_source.close()

        sources = []
        sourcedatastreamrevision = []
        pk = 0
        for row in self.source:
            datastream_revisions_id = row['fields'].pop("datastream_revision", None)
            for datastream_revision_id in datastream_revisions_id:
                if self.datastream_revision_exist(datastream_revision_id):
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

        # Tags
        f_tag = open(TAG_FIXTURES, 'r')
        self.tag = json.load(f_tag)
        f_tag.close()

        tags = []
        tagdatasets = []
        tagdatastreams = []

        pk_dataset = 0
        pk_datastream = 0

        for row in self.tag:
            tag_dataset_ids = row['fields'].pop("dataset", [])
            tag_datastreams_ids = row['fields'].pop("datastream", [])
            tag_dashboards_ids = row['fields'].pop("dashboard", [])
            tag_visualizations_ids = row['fields'].pop("visualization", [])
            tag_users_ids = row['fields'].pop("user", [])

            for dataset_id in tag_dataset_ids:
               pk_dataset += 1
               tagdatasets.append(dict(
                    pk=pk_dataset,
                    model='core.tagdataset',
                    fields=dict(
                        tag=row['pk'],
                        datasetrevision=dataset_id
                    )
                ))

            for datastream_id in tag_datastreams_ids:
                if self.datastream_revision_exist(datastream_id):
                    pk_datastream += 1
                    tagdatastreams.append(dict(
                         pk=pk_datastream,
                         model='core.tagdatastream',
                         fields=dict(
                             tag=row['pk'],
                             datastreamrevision=datastream_id
                         )
                    ))

            tags.append(row)

        f_tag = open('{}.migrated'.format(TAG_FIXTURES), 'w')
        f_tag.writelines(json.dumps(tags, indent=4))
        f_tag.close()

        f_tag = open('{}.migrated'.format(TAGDATASET_FIXTURES), 'w')
        f_tag.writelines(json.dumps(tagdatasets, indent=4))
        f_tag.close()

        f_tag = open('{}.migrated'.format(TAGDATASTREAM_FIXTURES), 'w')
        f_tag.writelines(json.dumps(tagdatastreams, indent=4))
        f_tag.close()
