import logging

from django.core.mail import send_mail
from django.template.loader import render_to_string

from core.lib.mail.mail import MailService
from core import settings


class DjangoMailService(MailService):
    def send_welcome_mail(self, user, link, company):
        """ Notify new admin """

        email_data = dict(
            name=user.name,
            admin_name=user.nick,
            company=company,
            link=link,
        )
        subject = render_to_string('workspace/templates/accounts/account_activation_subject.txt')
        message = render_to_string('workspace/templates/accounts/account_activation_email.txt', email_data)
        to = [user.email]

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, to, fail_silently=False)
            return True
        except:
            logger = logging.getLogger(__name__)
            logger.error("Failed to send email to {}".format(user.email))
            return False

    def list_subscribe(self, user, language='es', extradata={}):
        return True
