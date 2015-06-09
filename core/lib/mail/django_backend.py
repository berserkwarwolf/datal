import logging

from post_office import mail

from core.lib.mail.mail import MailService
from core import settings


class DjangoMailService(MailService):

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
        except:
            logger = logging.getLogger(__name__)
            logger.error("Failed to send email to {}".format(user.email))
            return False

    def list_subscribe(self, user, language='es', extradata={}):
        return True
