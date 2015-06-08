from abc import ABCMeta, abstractmethod

from core import settings
from core.exceptions import MailServiceNotFoundException
from core.lib.mail.mailchimp import MailchimpMailService


class MailService():
    __metaclass__ = ABCMeta
        
    @abstractmethod
    def send_welcome_mail(self, user, link, company):
        """ Para usuarios nuevos del sistema """
        pass

    @abstractmethod
    def list_subscribe(self):
        """ Suscribir a la lista de usuarios del sistema"""
        pass

mail_service = None
if settings.USE_MAILSERVICE == 'mailchimp':
    mail_service = MailchimpMailService()
else:
    raise MailServiceNotFoundException()
