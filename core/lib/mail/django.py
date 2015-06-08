import core.settings as settings

from core.lib.mail.mail import MailService


class DjangoMailService(MailService):
    def __init__(self):
        pass

    def send_welcome_mail(self, user, link, company):
        """ Notify new admin """
        template_name, message = self.get_template_message(user=user, link=link, company=company)

        #result = ma.messages.send_template(template_name=template_name, template_content=[], message=message,
        #                                   async=False, ip_pool='Main Pool')
        #if result[0]["reject_reason"] == None:
        #    return True
        #else:
        #    logger = logging.getLogger(__name__)
        #    logger.error("Failed to send email (%s)" % result[0]["reject_reason"])
        #    return False
        return True