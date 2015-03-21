from django.core.urlresolvers import reverse
from junar.core.helpers import slugify
from junar.core.managers import IndexTankFinder
import datetime

class HomeFinder(IndexTankFinder):

    order_by = {'0': 'title', '1': 'timestamp'}

    def __init__(self):
        IndexTankFinder.__init__(self)

    def get_datastream_dictionary(self, doc):

        id = doc['datastream_id']
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('datastream_manager.action_view', kwargs={'id': id, 'slug': slug})
        created_at = datetime.datetime.fromtimestamp(int(doc['timestamp']))

        return dict(id=id
                    , title = title
                    , category = doc['category_name']
                    , created_at = created_at
                    , permalink = permalink
                    , type=doc['type'].upper()
                    , account_id = int(doc['account_id'])
                   )

    def get_dataset_dictionary(self, doc):

        dataset_id = doc['dataset_id']
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('manageDatasets.action_view', urlconf = 'junar.microsites.urls', kwargs={'id': dataset_id, 'slug': slug})
        created_at = datetime.datetime.fromtimestamp(int(doc['timestamp']))

        return dict(id=dataset_id
                    , title = title
                    , category = doc['category_name']
                    , created_at = created_at
                    , permalink = permalink
                    , type=doc['type'].upper()
                    , account_id = int(doc['account_id'])
                   )

    def get_visualization_dictionary(self, doc):

        id = doc['visualization_id']
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('chart_manager.action_view', kwargs={'id': id, 'slug': slug})
        created_at = datetime.datetime.fromtimestamp(int(doc['timestamp']))

        return dict(id=id
                    , title = title
                    , category = doc['category_name']
                    , created_at = created_at
                    , permalink = permalink
                    , type=doc['type'].upper()
                    , account_id = int(doc['account_id'])
                   )

    def get_dashboard_dictionary(self, doc):

        id = doc['dashboard_id']
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('dashboard_manager.action_view', kwargs={'id': id, 'slug': slug})
        created_at = datetime.datetime.fromtimestamp(int(doc['timestamp']))

        return dict(id=id
                    , title = title
                    , category = doc['category_name']
                    , created_at = created_at
                    , permalink = permalink
                    , type=doc['type'].upper()
                    , account_id = int(doc['account_id'])
           )
