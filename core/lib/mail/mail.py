from abc import ABCMeta, abstractmethod
from core import settings
from core.exceptions import MailServiceNotFoundException


class MailService():
    __metaclass__ = ABCMeta
        
    @abstractmethod
    def send_welcome_mail(self):
        """ para usuarios nuevos del sistema """
        pass

    @abstractmethod
    def list_subscribe(self):
        """ suscribir a la lista de usuarios del sistema"""
        pass

mail_service = None
if settings.USE_MAILSERVICE == 'mailchimp':
    from core.lib.mail.mailchimp import MailchimpMailService
    mail_service = MailchimpMailService()
else:
    raise MailServiceNotFoundException()