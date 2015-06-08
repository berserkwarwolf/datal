# -*- coding: utf-8 -*-
import memcache, logging

from django.conf import settings

from core import choices
from core.models import Preference


class Preferences():
    def __init__(self, account_id):
        self.data = dict()
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
                    self.data[key] = Preference.objects.get_value_by_account_id_and_key(
                        self.data['account_id'],
                        key=key.replace('_', '.')
                    )
                except Preference.DoesNotExist:
                    self.data[key] = ''
                else:
                    self.save_on_cache(key, self.data[key])

        return self.data[key]

    def load(self, keys):
        preferences = Preference.objects.filter(key__in=keys, account=self.data['account_id']).values('key', 'value')
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
