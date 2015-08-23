from django.db.models import Q
from django.conf import settings
from core.http import get_domain
from core.models import Application, Account, UserPassTickets, User
from core.models import Preference
from core.helpers import get_domain_with_protocol
from urlparse import urlparse
from rest_framework import authentication
from rest_framework import exceptions
import logging

logger = logging.getLogger(__name__)

class DatalApiAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        user_id = None
        account_id = None

        current_date = self._get_current_date()

        # check if we are at a account domain or at junar

        account_id = self.resolve_account(request)
        #if not account_id:
        #    raise exceptions.AuthenticationFailed('No account')

        passticket = request.GET.get('passticket', None)
        if passticket:
            user_id = UserPassTickets.objects.resolve_user_id(passticket, request.response)

        if not user_id:
            user_id = self.resolve_user(request, account_api=account_id == True)
            if not user_id:
                raise exceptions.AuthenticationFailed('No user') 

        user = User.objects.get(pk=user_id)
        account_id = account_id or user.account.id

        account = Account.objects.get(pk=account_id)

        language = account.get_preference('account.language') or 'en'

        bucket_name = account.get_preference('account.bucket.name')
        if not bucket_name:
            bucket_name = settings.AWS_BUCKET_NAME

        preferences = account.get_preferences()

        microsite_domain = self.get_microsite_domain(account.id)

        return (
            user, {
                'account': account,
                'bucket_name': bucket_name,
                'passticket':passticket,
                'language': language,
                'preferences': preferences,
                'microsite_domain': microsite_domain,
            }
        )

    def get_microsite_domain(self, account_id ):
        """
        get the account.domain preference by account_id
        """
        try:
            account_domain = Preference.objects.values('value').get(key='account.domain', account = account_id)['value']
            account_domain = 'http://' + account_domain
        except Preference.DoesNotExist:
            account_domain = get_domain_with_protocol('microsites')
        return account_domain

    def resolve_user(self, request, account_api = False):
        try:
            # checking environments
            auth_key = request.GET.get('auth_key')
            referer = request.META.get('HTTP_REFERER', None)
            application = Application.objects.values('type', 'auth_key', 'public_auth_key', 'domains', 'user_id').get(Q(auth_key = auth_key) | Q(public_auth_key = auth_key), valid = True)

            if self.is_key_valid(application, auth_key, referer, account_api):
                return application['user_id']
                
        except Application.DoesNotExist:
            return None

    def is_key_valid(self, application, auth_key, referer, account_api):
        """ Checks if the key is authorized """

        # '00' -> 'TRIAL'
        # trial at prod?... no sir!
        if not account_api and application['type'] == '00' and settings.ENVIRONMENT == 'prod':
            return False

        # public key check
        domains = application['domains']
        if domains:
            if application['public_auth_key'] == auth_key and not self.check_referer(referer, domains):
                return False

        return True

    def check_referer(self, referer, authorized_domains):

        if not referer:
            return False

        parsed_referer= urlparse(referer)
        domains_with_wildcards = [ domain_with_wildcards for domain_with_wildcards in authorized_domains.split('\n') if domain_with_wildcards ]

        for domain_with_wildcards in domains_with_wildcards:
            to_match_domain = domain_with_wildcards.replace('.', '\.').replace('*', '.*').strip()
            if re.search(to_match_domain, parsed_referer.netloc):
                return True
        return False

    def resolve_account(self, request, domain):
        try:
            domain = get_domain(request)

            if domain.find("api.dev.junar.com") > -1:
                dom = domain.split(".")
                account = Account.objects.get(pk=int(dom[0]))
            else:
                account = Account.objects.filter(preference__key = 'account.api.domain', preference__value = domain, status = Account.ACTIVE).first()

            return account.id
        except Account.DoesNotExist:
            return None

    def _get_current_date(self):
        import datetime
        now = datetime.datetime.now()
        return now.strftime("%Y-%m-%d")