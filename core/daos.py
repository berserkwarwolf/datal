from junar.core import choices
from junar.core.cache import Cache
from django.conf import settings
from django.db import connection
from junar.core.models import Preference
from junar.core.models import User
from junar.core import helpers as LocalHelper
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext
import memcache
import redis
import datetime
import time
import json

from junar.core.lib.searchify import SearchifyIndex

class DataStreamDBDAO:
    def get_last_published_revision(self, guid):
        sql = """   SELECT  MAX(dsr.`id`) AS `datastream_revision_id`,
                        `ao_datastream_revisions`.`datastream_id`
                    FROM `ao_datastream_revisions` dsr
                    INNER JOIN `ao_datastreams` ds ON (ds.`id` = dsr.`datastream_id`)
                    WHERE dsr.`status` = %s AND ds.`guid` = %s
                    GROUP BY dsr.`datastream_id`
                    ORDER BY dsr.`created_at` DESC
                    LIMIT 1"""

        params = [choices.StatusChoices.PUBLISHED, guid]

        cursor = connection.cursor()
        cursor.execute(sql, params)

        return cursor.fetchone()


class ActivityStreamDAO:
    """ class for integrated managment of resource ativities """

    def create(self, account_id, user_id, revision_id, resource_type, resource_id, action_id, resource_title):
        """ Create a redis-hash and then addit to a redis-lits"""
        c = Cache(db=settings.CACHE_DATABASES['activity_resources'])

        timeformat = "%s %s %s %s" % (ugettext('APP-ON-TEXT'), "%B %d, %Y", ugettext('APP-AT-TEXT'), "%H:%M")
        now = datetime.datetime.now()
        time = now.strftime(timeformat)
        l_permalink=""

        #TODO check and fix al urls.
        if int(action_id) != int(choices.ActionStreams.DELETE):
            if resource_type == settings.TYPE_DATASTREAM:
                l_permalink = reverse('manageDataviews.view', urlconf='junar.workspace.urls', kwargs={'revision_id': revision_id})
            elif resource_type == settings.TYPE_VISUALIZATION:
                l_permalink = LocalHelper.build_permalink('manageVisualizations.view', '&visualization_revision_id=' + str(revision_id))
            elif resource_type == settings.TYPE_DATASET:
                l_permalink = reverse('manageDatasets.view', urlconf='junar.workspace.urls', kwargs={'revision_id': revision_id})
            elif resource_type == settings.TYPE_DASHBOARD:
                l_permalink = LocalHelper.build_permalink('dashboard_manager.action_view', '&dashboard_revision_id=' + str(revision_id))

        list_key = 'activity_stream::%s' % str(account_id)
        n=c.incr("%s_counter" % list_key) # count any use of the list indexing hash and never repeat an ID
        activity_key = 'activity.stream_%s:%s' % (str(account_id), str(n))
        activity_value = {"user_id": user_id, "revision_id": revision_id
                        , "type": resource_type, "resource_id": resource_id
                        ,"action_id": action_id
                        , "title": resource_title, "time":time
                        , "resource_link": l_permalink }

        c.hmset(activity_key, activity_value)
        c.lpush(str(list_key), activity_key)
        return list_key, activity_key, activity_value

    def query(self, account_id, limit=-21):
        """ query for last 20 records of activity lists"""
        c = Cache(db=settings.CACHE_DATABASES['activity_resources'])
        list_key = 'activity_stream::%s' % str(account_id)
        activity_keys = c.lrange(str(list_key),limit,-1)
        r = redis.Redis(host='localhost', port=settings.REDIS_PORT,
            db=settings.CACHE_DATABASES['activity_resources'])
        pipeline=r.pipeline()

        for key in activity_keys:
            pipeline.hgetall(key)
        activities = []
        users = {} # avoid duplicated sql queries
        for h in pipeline.execute():
            user_id = h['user_id']
            if not users.get(user_id, None):
                user = User.objects.get(pk=user_id)
                users[user_id] = user
            else:
                user = users[user_id]
            h['user_nick'] = user.nick
            h['user_email'] = user.email
                
            activities.append(h)

        return activities

class Preferences():
    def __init__(self, account_id):
        self.data = {}
        self.data['account_id'] = account_id
        self.memcached = settings.MEMCACHED_ENGINE_END_POINT
        self.engine_cache = False
        if self.memcached:
            try:
                self.engine_cache = memcache.Client(self.memcached, debug=0)
            except:
                #TODO raise an memcache error (?)
                # 'No memcached client could be created.')
                pass


    def __getitem__(self, key):
        """ get item from internal data, or cache or readed from database """
        if not self.data.has_key(key):
            # try from memcache
            value = self.get_from_cache(key)
            if value is not None:
                self.data[key] = value
            else:
                # then try from database
                try:
                    self.data[key] = Preference.objects.get_value_by_account_id_and_key(self.data['account_id'], key = key.replace('_', '.'))
                except Preference.DoesNotExist:
                    self.data[key] = ''
                else:
                    self.save_on_cache(key, self.data[key])

        return self.data[key]

    def load(self, keys):
        preferences = Preference.objects.filter(key__in=keys, account = self.data['account_id']).values('key', 'value')
        for preference in preferences:
            key = preference['key']
            self.data[key.replace('.', '_')] = preference['value']
            keys.remove(key)

        for key in keys:
            self.data[key.replace('.', '_')] = ''

    def keys(self):
        return self.data.keys()

    def __setitem__(self, key, value):
        self.data[key] = value
        self.save_on_cache(str(key), value)

    def load_all(self):
        keys = [pref[0] for pref in choices.ACCOUNT_PREFERENCES_AVAILABLE_KEYS]
        self.load(keys)

    def get_from_cache(self, key):
        if self.engine_cache:
            key = 'preference_%s_%s' % (str(self.data['account_id']), key)
            return self.engine_cache.get(str(key))

        return None

    def save_on_cache(self, key, value):
        if self.engine_cache:
            try:
                key = 'preference_%s_%s' % (str(self.data['account_id']), key)
                self.engine_cache.set(key, value, settings.MEMCACHED_DEFAULT_TTL)
                return True
            except:
                pass

        return False


class SearchifyDAO:
    """ index or unindex resources on searchiy """
    
    def index(self, resource_get):
        """ dataset version for searchify """
        if resource_get['resource_type'] == 'dataset':
            doc = self.create_dataset_doc(resource_get)
        elif resource_get['resource_type'] == 'datastream':
            doc = self.create_datastream_doc(resource_get)
        elif resource_get['resource_type'] == 'visualization':
            doc = self.create_visualization_doc(resource_get)
        SearchifyIndex().get().indexit(doc)

    def unindex(self, resource_get):
        """ remove from searchify """
        if resource_get['resource_type'] == 'dataset':
            doc = self.create_dataset_doc(resource_get)
        elif resource_get['resource_type'] == 'datastream':
            doc = self.create_datastream_doc(resource_get)
        elif resource_get['resource_type'] == 'visualization':
            doc = self.create_visualization_doc(resource_get)
        SearchifyIndex().get().delete_documents(doc)
    
    def create_dataset_doc(self, dataset_get):
        
        dataset = dataset_get # for remembering to uset DAO dataset get function
        
        text = [dataset['title'], dataset['description'], dataset['user_nick'], str(dataset['dataset_id']) ] #DS uses GUID, but here doesn't exists. We use ID
        text.extend(dataset['tags']) # datastream has a table for tags but seems unused. I define get_tags funcion for dataset.
        text.extend(dataset['sources'])
        text = ' '.join(text)
        
        tags = ','.join(dataset['tags'])
        sources = ','.join(dataset['sources'])
        timestamp = int(time.mktime(dataset['created_at'].timetuple()))
        parameters = '' #TODO full this
        
        doc = {'docid' : "DT::DATASET-ID-%d" % dataset['dataset_id'],
            'fields' :
                {'type' : 'dt',
                 'dataset_id': dataset['dataset_id'],
                 'datasetrevision_id': dataset['dataset_revision_id'] ,
                 'title': dataset['title'] ,
                 'text': text ,
                 'description': dataset['description'] ,
                 'owner_nick' : dataset['user_nick'] ,
                 'tags' : tags ,
                 'sources' : sources ,
                 'account_id' : dataset['account_id'] ,
                 'parameters': parameters ,
                 'timestamp': timestamp,
                 'end_point': dataset['end_point'],
                 'is_private': 0,
                },
            'categories': {'id': dataset['category_id'], 'name': dataset['category_name'] }
            }

        """ #TODO add xtra facets
        doc = add_facets_to_doc(self, account, doc)
        doc['fields'].update(get_meta_data_dict(dataset.metadata))
        """ 
        return doc

    def create_datastream_doc(self, datastream_get):
        datastream = datastream_get
        tags = ','.join(datastream['tags'])
        timestamp = int(time.mktime(datastream['created_at'].timetuple()))
        
        parameters = []
        for parameter in datastream['parameters']:
            parameters.append({'name': parameter.name, 'description': parameter.description})
        if parameters:
            parameters = json.dumps(parameters)
        else:
            parameters = ''

        text = [datastream['title'], datastream['description'], datastream['user_nick'], datastream['guid']]
        text.extend(datastream['tags'])
        text = ' '.join(text)
        
        doc = {
            'docid' : "DS::" + datastream['guid'],
            'fields' :
                {'type' : 'ds',
                 'datastream_id': datastream['datastream_id'],
                 'datastreamrevision_id': ['datastream.datastream_revision_id'],
                 'title': datastream['title'],
                 'text': text,
                 'description': datastream['description'],
                 'owner_nick' : datastream['user_nick'],
                 'tags' : tags,
                 'account_id' : datastream['account_id'],
                 'parameters': parameters,
                 'timestamp': timestamp,
                 'end_point': datastream['end_point'],
                 'is_private': 0,
                },
            'categories': {'id': unicode(datastream['category_id']), 'name': datastream['category_name']}
            }

        """ #TODO add xtra facets 
        doc = add_facets_to_doc(self, account, doc)
        doc['fields'].update(get_meta_data_dict(datastream.metadata))
        """        
        return doc
        
    def create_visualization_doc(self, visualization_get):
        visualization=visualization_get
        
        text = [visualization['title'], visualization['description'], visualization['user_nick'], visualization['guid']]
        text.extend(visualization['tags'])
        text = ' '.join(text)
        tags = ','.join(visualization['tags'])
        timestamp = int(time.mktime(visualization['created_at'].timetuple()))
        doc = {
                'docid' : "VZ::" + visualization['guid'],
                'fields' :
                    {'type' : 'chart',
                     'visualization_id': visualization['visualization_id'],
                     'visualizationrevision_id': visualization['visualization_revision_id'],
                     'datastream_id': visualization['datastream_id'],
                     'title': visualization['title'],
                     'text': text,
                     'description': visualization['description'],
                     'category_id' : visualization['category_id'],
                     'category_name' : visualization['category_name'],
                     'owner_nick' : visualization['user_nick'],
                     'tags' : tags,
                     'account_id' : visualization['account_id'],
                     'timestamp' : timestamp,
                     'is_private': 0,
                    },
                'categories': {'id': unicode(visualization['category_id']), 'name': visualization['category_name']}
                }

        """ #TODO add xtra facets
        doc = add_facets_to_doc(self, account, doc)
        doc['fields'].update(get_meta_data_dict(visualization.metadata))
        """
        
        return doc