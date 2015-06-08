from abc import ABCMeta, abstractmethod

from core.helpers import class_for_name
from core import settings


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

# TODO: Verificar este codigo para hacer el import dinamicamente
mail_service = None
class_name = settings.EMAIL_SERVICE.split('.')[-1]
module_name = settings.EMAIL_SERVICE.split('.{}'.format(class_name))[0]
mail_service = class_for_name(module_name=module_name, class_name=class_name)

#TODO: Cuando ande el dinamico borrar esto
#mail_service = None
#if settings.EMAIL_SERVICE == 'core.lib.mail.mailchimp_backend.MailchimpMailService':
#    from core.lib.mail.mailchimp import MailchimpMailService
#    mail_service = MailchimpMailService()
#elif settings.EMAIL_SERVICE == 'core.lib.mail.django_backend.DjangoMailService':
#    from core.lib.mail.django_backend import DjangoMailService
#    mail_service = DjangoMailService()
