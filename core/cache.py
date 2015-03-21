from redis import Redis
from django.conf import settings

class Cache:

    def __init__(self, db = settings.REDIS_DB):
        self.writer_host = settings.REDIS_WRITER_HOST
        self.reader_host = settings.REDIS_READER_HOST
        self.port = settings.REDIS_PORT
        self.db = db
        self._redis_reader = None
        self._redis_writer = None

    def set_db(self, db):
        self.db = db
        self._redis_reader = None
        self._redis_writer = None
        return self

    def _get_reader(self):
        if self._redis_reader is None:
            self._redis_reader = Redis(host=self.reader_host, port=self.port, db=self.db)
        return self._redis_reader

    def _get_writer(self):
        if self._redis_writer is None:
            self._redis_writer = Redis(host=self.writer_host, port=self.port, db=self.db)
        return self._redis_writer

    def _get_writer_for_db(self, db = None):
        if db is None:
            return self._get_writer()

        self._redis_writer = Redis(host=self.writer_host, port=self.port, db=db)
        return self._redis_writer

    ''' primitives '''
    def set(self, key, value, timeout = 0):
        writer = self._get_writer()

        writer.set(key, value)
        if timeout > 0:
            if writer.expire(key, timeout) != 1:
                writer.delete(key)

    def get(self, key, default = None):
        value = self._get_reader().get(key)
        if value is None:
            return default
        return value

    def lpop(self, key):
        return self._get_reader().lpop(key)

    def lrange(self, key, start, stop):
        return self._get_reader().lrange(key,start,stop)

    def hmset(self, name, mapping):
        return self._get_writer().hmset(name, mapping)

    def hmget(self, name, keys):
        return self._get_reader().hmget(name, keys)

    def hgetall(self, name):
        return self._get_reader().hgetall(name)

    def hincrby(self, name, key, amount=1):
        return self._get_writer().hincrby(name, key, amount)

    def incr(self, key, amount=1):
        self._get_writer().incrby(key, amount)
        return self.get(key, 0)

    def lpush(self, name, value):
        """ put value at the beginning of a redis list """
        return self._get_writer().lpush(name, value)

    def rpush(self, name, value):
        """ put a value at the end of a redis list """
        return self._get_writer().rpush(name, value)

    def delete(self, *names):
        return self._get_writer().delete(*names)

    def keys(self, pattern = '*'):
        return self._get_reader().keys(pattern)

    ''' cache logic '''
    def purge_ds(self, cached_datasets):
        try:
            raw_delete = False
            key_delete = False
            for datastream_revision_id, dataset_revision_id, guid in cached_datasets:
                raw_delete |= self.delete(datastream_revision_id)

                keys = self.keys(str(datastream_revision_id) + '::*')
                if len(keys) > 0:
                    for key in keys:
                        key_delete |= self.delete(key)

            return raw_delete|key_delete
        except Exception:
            return False

    def purge_ws(self, end_points):
        db_cached_dataset = 7
        default_db = self.db
        local_writer = self._get_writer_for_db(db_cached_dataset)
        key_delete = False

        for end_point in end_points:
            keys = local_writer.keys(str(end_point + '*'))
            if len(keys) > 0:
                for key in keys:
                    key_delete |= local_writer.delete(key)

        self.set_db(default_db)
        return key_delete

    def refresh_ws_datasets(self):
        from junar.core.models import DataStreamRevision, DatasetRevision
        cached_datasets = DataStreamRevision.objects.get_guids_with_cache()
        # purge ds from cache
        purge_ds = self.purge_ds(cached_datasets)

        # purge dataset from cache DB 7
        end_points = []
        for datastream_rev_id, dataset_rev_id, guid in cached_datasets:
            try:
                dataset_rev = DatasetRevision.objects.get(pk=dataset_rev_id)
                end_points.append(dataset_rev.end_point)
            except Exception:
                pass
        purge_ws = self.purge_ws(end_points)
        return purge_ds|purge_ws