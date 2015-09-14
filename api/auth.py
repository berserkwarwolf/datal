import logging
import re

from django.db.models import Q
from django.conf import settings
from core.models import Application, Account, User, AccountAnonymousUser
from core.http import get_domain, get_domain_by_request
from urlparse import urlparse
from rest_framework import authentication
from rest_framework import exceptions

logger = logging.getLogger(__name__)



class DatalApiAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        user_id = None
        account_id = None

        auth_key = request.query_params.get('auth_key', None)
        if not auth_key:
            return None

        account = self.resolve_account(request)
        if not account:
            raise exceptions.AuthenticationFailed('Invalid Account.')

        application = self.resolve_application(request, auth_key)
        if not application:
            raise exceptions.AuthenticationFailed('Auth Key does not exist.')
        if application.is_public_auth_key(auth_key):
            if not self.check_referer(request, application):
                raise exceptions.AuthenticationFailed('Invalid referer')

        user = self.resolve_user(application, account)

        preferences = account.get_preferences()

        return (
            user, {
                'account': account,
                'preferences': preferences,
                'language': preferences['account.language'],
                'microsite_domain': get_domain(account.id),
            }
        )
    
    def check_referer(self, request, application):

        referer = request.META.get('HTTP_REFERER', None)
        if not referer:
            return False

        if not application.domains:
            return False

        domains = application.domains.split('\n')
        wcardsdoms = [ wcardsdom for wcardsdom in domains if wcardsdom ]

        parsed_referer = urlparse(referer)
        for wcardsdom in wcardsdoms:
            to_match_domain = wcardsdom.replace('.', '\.').replace('*', '.*')
            to_match_domain = to_match_domain.strip()
            if re.search(to_match_domain, parsed_referer.netloc):
                return True
        return False

    def resolve_account(self, request):
        try:
            return Account.objects.filter(
                preference__key='account.api.domain', 
                preference__value=get_domain_by_request(request), 
                status = Account.ACTIVE).first()
        except Account.DoesNotExist:
            return None

    def resolve_application(self, request, auth_key):
        try:
            return Application.objects.filter(
                Q(auth_key = auth_key) | Q(public_auth_key = auth_key), 
                valid=True
            ).first()
        except Application.DoesNotExist:
            return None

    def resolve_user(self, application, account):
        if application.user_id:
            try:
                return User.objects.get(pk=application.user_id)
            except User.DoesNotExist:
                return AccountAnonymousUser(account)
        return AccountAnonymousUser(account)