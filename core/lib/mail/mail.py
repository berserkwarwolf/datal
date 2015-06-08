import core.settings as settings

from abc import ABCMeta, abstractmethod

from core.helpers import class_for_name
from core.exceptions import MailServiceNotFoundException


class MailService():
    __metaclass__ = ABCMeta

    @abstractmethod
    def send_welcome_mail(self, user, link, company):
        """ Para usuarios nuevos del sistema """
        pass

    @abstractmethod
    def list_subscribe(self, user, language='es', extradata={}):
        """ Suscribir a la lista de usuarios del sistema"""
        pass

    def get_template_message(self, user, link, company):
        avars = [
            {'name':'FNAME', 'content': user.name},
            {'name': 'ADMINNAME', 'content': user.nick},
            {'name': 'COMPANY', 'content': company},
            {'name': 'LINK', 'content': link},
            {'name':'TWITTER:PROFILEURL', 'content': settings.TWITTER_PROFILE_URL},
            {'name':'FACEBOOK:PROFILEURL', 'content': settings.FACEBOOK_PROFILE_URL},
            {'name':'LIST:COMPANY', 'content': settings.MAIL_LIST['LIST_COMPANY']},
            {'name':'LIST:DESCRIPTION', 'content': settings.MAIL_LIST['LIST_DESCRIPTION']},
            {'name':'UNSUB', 'content': settings.MAIL_LIST['LIST_UNSUBSCRIBE']},
            {'name':'UPDATE_PROFILE', 'content': settings.MAIL_LIST['LIST_UPDATE_PROFILE']}
        ]

        to = [{'email': user.email}]

        if user.language == "es":
            tmpl = settings.MAIL_LIST['WELCOME_TEMPLATE_ES']
            sbj = 'Nueva cuenta en Datal'
        else:
            tmpl = settings.MAIL_LIST['WELCOME_TEMPLATE_EN']
            sbj = 'New Datal account'

        message = {'subject':sbj, 'to': to,
                   'from_name': company,
                   'from_email':'alguien@datal.org',
                   'merge': True,
                   'merge_vars': [{'rcpt': user.email,'vars': avars }]
        }
        return [tmpl, message]

mail_service = None
try:
    class_name = settings.EMAIL_SERVICE.split('.')[-1]
    module_name = settings.EMAIL_SERVICE.split('.{}'.format(class_name))[0]
    mail_service = class_for_name(module_name=module_name, class_name=class_name)
except:
    raise MailServiceNotFoundException()
