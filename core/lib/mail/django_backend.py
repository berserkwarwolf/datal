import logging

from post_office import mail

from core.lib.mail.mail import MailService
from core import settings


class DjangoMailService(MailService):

    @staticmethod
    def send_password_recovered_mail(user, password):
        """
        Envio correo con nueva clave
        """
        email_data = dict(nick=user.nick, password=password)
        to = [user.email]

        try:
            mail.send(to, settings.DEFAULT_FROM_EMAIL, template='password_recovered_es', context=email_data,
                      priority='now')
            return True
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error("Failed to send email to {}. Error: {}".format(user.email, e.message))
            return False

    @staticmethod
    def send_forgot_password_mail(user, link):
        """
        Envio correo de cambio de clave
        """
        email_data = dict(url=link)
        to = [user.email]

        try:
            mail.send(to, settings.DEFAULT_FROM_EMAIL, template='reset_password_es', context=email_data,
                      priority='now')
            return True
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error("Failed to send email to {}. Error: {}".format(user.email, e.message))
            return False

    @staticmethod
    def send_welcome_mail(user, link, company):
        """ Notify new admin """

        email_data = dict(
            name=user.name,
            admin_name=user.nick,
            company=company,
            link=link,
        )
        to = [user.email]

        try:
            mail.send(to, settings.DEFAULT_FROM_EMAIL, template='activate_account_es', context=email_data,
                      priority='now')
            return True
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error("Failed to send email to {}. Error: {}".format(user.email, e.message))
            return False

    def list_subscribe(self, user, language='es', extradata={}):
        return True
