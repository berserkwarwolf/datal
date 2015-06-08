from abc import ABCMeta, abstractmethod

from core.helpers import class_for_name
from core import settings
from core.exceptions import MailServiceNotFoundException


class MailService():
    __metaclass__ = ABCMeta

    def __init__(self):
        pass

    @abstractmethod
    def send_welcome_mail(self, user, link, company):
        """ Para usuarios nuevos del sistema """
        pass

    @abstractmethod
    def list_subscribe(self, user, language='es', extradata={}):
        """ Suscribir a la lista de usuarios del sistema"""
        pass

mail_service = None
try:
    class_name = settings.EMAIL_SERVICE.split('.')[-1]
    module_name = settings.EMAIL_SERVICE.split('.{}'.format(class_name))[0]
    mail_service = class_for_name(module_name=module_name, class_name=class_name)
except:
    raise MailServiceNotFoundException()
