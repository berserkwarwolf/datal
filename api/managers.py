from django.core.urlresolvers import reverse
from django.db import connection
from api.exceptions import Http400
from core.helpers import slugify, get_mimetype, get_file_type_from_extension
from core import managers
from core.models import *
from core.managers import IndexTankFinder as core_IndexTankFinder
from api.sources_manager.utils import *

def resolve_user_id(self, passticket, default_user_id):
    try:
        return super(managers.UserPassTicketsManager, self).values('user_id').get(uuid = passticket)['user_id']
    except self.model.DoesNotExist:
        return default_user_id

managers.UserPassTicketsManager.resolve_user_id = resolve_user_id

# CategoryManager
def get_ordered(self, language, account_id):
    from django.db.models import Count
    categories_dict = []
    qset = super(managers.CategoryManager, self).values('id', 'categoryi18n__name', 'categoryi18n__slug')
    qset = qset.filter(categoryi18n__language = language, account_id = account_id)
    qset = qset.annotate(num_datastreams=Count('datastreamrevision__datastream'))
    qset = qset.order_by('-num_datastreams')

    # @todo: hardcoded catalog limit
    for category in qset[:12]:
        # remove when the above query use HAVING
        if category['num_datastreams'] != 0:
            categories_dict.append({'id': category['id'],
                                    'name': category['categoryi18n__name'],
                                    'slug': category['categoryi18n__slug'],
                                    })
    return categories_dict
managers.CategoryManager.get_ordered = get_ordered



class IndexTankFinder(core_IndexTankFinder):

    def __init__(self):
        core_IndexTankFinder.__init__(self)

    def get_visualization_dictionary(self, doc):
        guid = doc['docid'].split('::')[1]
        id = doc['visualization_id']
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('chart_manager.action_view', urlconf = 'microsites.urls', kwargs={'id': id, 'slug': slug})
        return {
            "id": guid,
            "title": title,
            "description": doc['description'],
            "created_at": doc['timestamp'],
            "tags": [ tag for tag in doc['tags'].split(',') if tag ],
            "link": permalink
        }


    def get_dashboard_dictionary(self, doc):

        guid = doc['docid'].split('::')[1]
        id = doc['dashboard_id']
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('dashboard_manager.action_view', urlconf = 'microsites.urls', kwargs={'id': id, 'slug': slug})
        return {
            "id": guid,
            "title": title,
            "description": doc['description'],
            "created_at": doc['timestamp'],
            "tags": [ tag for tag in doc['tags'].split(',') if tag ],
            "link": permalink,
        }

    def get_datastream_dictionary(self, doc):

        guid = doc['docid'].split('::')[1]
        id = doc['datastream_id']
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('datastream_manager.action_view', urlconf = 'microsites.urls', kwargs={'id': id, 'slug': slug})
        return {
            "id": guid,
            "title": title,
            "description": doc['description'],
            "created_at": doc['timestamp'],
            "tags": [ tag for tag in doc['tags'].split(',') if tag ],
            "link": permalink,
        }

    def get_dataset_dictionary(self, doc):

        dataset_id = doc['dataset_id']
        guid = doc['docid'].split('::')[1]
        title = doc['title']
        slug = slugify(title)
        permalink = reverse('manageDatasets.action_view', urlconf = 'microsites.urls', kwargs={'id': dataset_id, 'slug': slug})

        return {
            "id": guid,
            "title": title,
            "description": doc['description'],
            "created_at": doc['timestamp'],
            "tags": [ tag for tag in doc['tags'].split(',') if tag ],
            "link": permalink,
        }

class FinderManager(managers.FinderManager):

    def __init__(self, finder_class = IndexTankFinder,
                 failback_finder_class = IndexTankFinder):

        self.finder_class = finder_class
        self.failback_finder_class = failback_finder_class
        managers.FinderManager.__init__(self)



def get_messages_by_account(self, account_id, date):

    sql = """SELECT `ao_tasks`.`guid`,
                    `ao_messages`.`message`,
                    `ao_messages`.`created_at`
             FROM `ao_tasks`
             INNER JOIN `ao_alerts` ON (`ao_alerts`.`task_id` = `ao_tasks`.`id`)
             INNER JOIN `ao_messages` ON (`ao_messages`.`alert_id` = `ao_alerts`.`id`)
             WHERE `ao_alerts`.`account_id` = %s AND `ao_messages`.`created_at` > %s"""

    cursor = connection.cursor()
    cursor.execute(sql, (account_id, date))
    row = cursor.fetchone()
    messages = []
    while row:
        messages.append({'guid': row[0],
                         'message': row[1],
                         'created_at': str(row[2])
                       })
        row = cursor.fetchone()

    return messages
managers.MessageManager.get_by_account = get_messages_by_account
