# -*- coding: utf-8 -*-
"""
Wrappers para sftp y s3  
Si quiere agregar el suyo extienda la clase datastore e implemente los metodos abstractos. Luego definalo en core/settings.py, instancielo 
y asignelo a la variable active
"""
from django.conf import settings
from core.exceptions import *
from abc import ABCMeta, abstractmethod
from uuid import uuid4 as UUID
import logging


class Datastore:
    """ Clase abstracta de la cual todos los tipos de datastore deben heredar """
    __metaclass__ = ABCMeta

    @abstractmethod 
    def create(self, account_id, user_id, bucket_name, file_data):
        pass

    @abstractmethod 
    def build_url(self, **kwargs):
        pass

    @abstractmethod     
    def update(self, bucket_name, end_point, file_data):
        pass


class s3(Datastore):
    """ Crea y actualiza archivos en S3"""

    def __init__(self):
        self.connection = S3Connection(settings.AWS_ACCESS_KEY, settings.AWS_SECRET_KEY)

    def build_url(self, **kwargs):
        pass

    def create(self, account_id, user_id, bucket_name, file_data):
        """ Crea un archivo en S3 dentro de un bucket. La ruta hacia el archivo se genera dando vuelta los ids de la cuenta y el usuario.
            El nombre del archivo con UUID"""
        try:
            end_point = "%s/%s/%d" %(str(account_id)[::-1], str(user_id)[::-1], UUID())

            self._save(bucket_name, end_point, file_data)

            return end_point
        except Exception, e:
            logger = logging.getLogger(__name__)
            logger.error('S3CreateException: %s IN %s [%s, %s, %s]' % (str(e), end_point, account_id, user_id, bucket_name)) 
            raise S3CreateException(e)        

    def generate_url(self, bucket_name, **kwargs):
        """ Genera una url para poder acceder a un archivo desde afuera """
        key = kwargs['key']
        response_headers = kwargs.get('response_headers', None)
        force_http = kwargs.get('force_http', True)

        return self.connection.generate_url(300, 'GET', bucket_name, key, response_headers = response_headers, force_http=force_http)

    def update(self, bucket_name, file_name, file_data):
        """ Actualiza un archivo en S3. El nombre del archivo se encuentra precedido por la ruta hacia el mismo."""        
        try:
            self._save(bucket_name, file_name, File)
        except Exception, e:
            raise S3UpdateException(e)

    def _save(self, bucket_name, end_point, File):
        k = Key(self.connection.get_bucket(bucket_name))
        k.key = end_point
        k.set_contents_from_file(File)
        
        
class sftp(Datastore):
    """ creates and updates files on sftp """

    connection = None

    def __init__(self):
        self.base_folder = settings.SFTP_DATASTORE_REMOTEBASEFOLDER # remote path for saving all resources
        self.tmp_folder = settings.SFTP_DATASTORE_LOCALTMPFOLDER # local base folder for saving temporary files before upload
        self.public_base_url = settings.SFTP_PUBLIC_BASE_URL # url for donwloading resources

    def _connect(self):
        """ don't use at INIT because it hangs all application"""

        self.connection = sftp.Connection(host=settings.SFTP_DATASTORE_HOSTNAME, port=settings.SFTP_DATASTORE_PORT, username=settings.SFTP_DATASTORE_USER, password=settings.SFTP_DATASTORE_PASSWORD, log=True)

        # list all buckets (folders)
        self.buckets = self.connection.listdir(path=self.base_folder)

    def create(self, account_id, user_id, bucket_name, file_data):
        """ upload data (file) to the bueck_name folder, Return a key for identify this file
        data is a file_name
        """
        try:
            #we save as buket_name / account_id / user_id / UUID
            folder = '%s/%s' % (str(account_id)[::-1], str(user_id)[::-1])
            
            remote_path = '%s/%s/%s' % (self.base_folder, bucket_name, folder)

            if not self.connection:
                self.connect()

            self.connection.execute('mkdir -p %s' % remote_path)

            file_name = UUID()

            remote_path += '/'.join(file_name)

            local_path = file_data.path

            self._put(local_path=local_path, remote_path=remote_path)

            return '%s/%s' % (folder, file_name)
        except Exception, e:
            raise SFTPCreateException(e)


    def build_url(self, bucket_name, key, response_headers=None, force_http=True):
        """ return an URL for downloading resource
        S3 allows expire seconds if it's a private resource, we don't #TODO """
        return '%s/%s/%s' % (self.public_base_url, bucket_name, key)

    def update(self, bucket_name, end_point, file_data):
        """ update file for existing resource """        

        try:
            remote_path = "%s/%s/%s" % (self.base_folder, bucket_name, end_point)

            local_path = file_data.path

            self._put(local_path=local_path, remote_path = remote_path)
        except:
            raise SFTPUpdateException(e)

    def _put(self, local_path, remote_folder):
        """ ensure path and save """
        if not self.connection:
            self.connect()

        self.connection.put(local_path, remotepath = remote_path)

active_datastore = None
if settings.USE_DATASTORE == 's3':
    # imports for S3
    from boto.s3.connection import S3Connection
    from boto.s3.key import Key

    active_datastore = s3()

elif settings.USE_DATASTORE == 'sftp':
    # imports for sftp
    import sftp

    active_datastore = sftp()
else:
    raise DatastoreNotFoundException() #TODO define this error