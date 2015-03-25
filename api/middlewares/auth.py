from django.db.models import Q
from django.conf import settings
from core.http import get_domain
from core.models import Application, Account, Threshold, UserPassTickets, User
from core.cache import Cache
from api.http import HttpResponseTooManyRequests, HttpResponseUnauthorized, HttpResponseForbidden, HttpResponse
from api.exceptions import *
from urlparse import urlparse

import time
import re

import json

class AuthMiddleware(object):

    def process_request(self, request):

        request.user_id = None
        request.account_id = None
        request.account = None
        current_date = self._get_current_date()
        auth_key = request.REQUEST.get('auth_key')
            
        request.cache_key = 'API::AUTH_KEY::%s::%s' % (auth_key, current_date)

        # check if we are at a account domain or at junar
        domain = get_domain(request)

        if not domain or domain == settings.API_BASE_URI:
            response = self.is_valid_request(request)

            if not isinstance(response, HttpResponse):
                request.user_id = response
                self.check_account(request)

            else:
                return response

        else:
            response = self.is_valid_account_request(request)
            if not isinstance(response, HttpResponse):
                request.account_id = response
                request.account = Account.objects.get(pk=request.account_id)
                bucket_name = request.account.get_preference('account.bucket.name')
                if not bucket_name:
                    bucket_name = settings.AWS_BUCKET_NAME
                request.bucket_name= bucket_name
                valid_user_request = self.is_valid_request(request, account_api = True)
                if isinstance(valid_user_request, HttpResponse):
                    return valid_user_request
                else:
                    request.user_id = valid_user_request
            else:
                return response

        # check for passticket
        self.check_passticket(request)

        return None

    def check_passticket(self, request):
        passticket = request.REQUEST.get('passticket', False)
        if passticket:
            request.user_id = UserPassTickets.objects.resolve_user_id(passticket, request.response)

    def check_account(self, request):
        if request.user_id:
            user = User.objects.get(pk=request.user_id)
            request.user = user
            request.account = user.account


    def is_valid_request(self, request, account_api = False):
        try:
            # checking environments
            auth_key = request.REQUEST.get('auth_key')
            referer = request.META.get('HTTP_REFERER', None)
            application = Application.objects.values('type', 'auth_key', 'public_auth_key', 'domains', 'user_id').get(Q(auth_key = auth_key) | Q(public_auth_key = auth_key), valid = True)

            if not self.is_key_valid(application, auth_key, referer, account_api):
                return HttpResponseUnauthorized(json.dumps({"error": 401, "message": "Unauthorized"}))
                # process_exception not work in process_request raise InvalidKey('Unauthorized')

        except Application.DoesNotExist:
            return HttpResponseUnauthorized(json.dumps({"error": 401, "message": "Unauthorized"}))
            # process_exception not work in process_request raise InvalidKey('Auth Key not exists')
        else:
            # checking throttle
            too_many_requests, wait = self.too_many_requests(auth_key, application['type'], request)
            if too_many_requests:
                return HttpResponseTooManyRequests(json.dumps({"error": 429, "message": "AuthKey Too Many Requests"}), wait)

        return application['user_id']

    def is_valid_account_request(self, request):
        # get a domain in preferences that matches the current domain, if exists
        # register the access and continue
        account_id = self.resolve_account(request)
        if not account_id:
            return HttpResponseForbidden(json.dumps({"error": 403, "message": "Forbidden"}))

        too_many_requests, wait = self.account_too_many_requests(account_id)
        if too_many_requests:
            return HttpResponseTooManyRequests(json.dumps({"error": 429, "message": "API Too Many Requests"}), wait)

        return account_id

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

    def too_many_requests(self, auth_key, type, request):
        """ Checks if the key has sent too many request """

        # preparing data
        calls_per_day = settings.API_TYPE[type]['calls_per_day']
        now = int(time.time())

        # gettings data from cache
        c = Cache()
        key = request.cache_key

        count, last_request = c.hmget(key, ['count', 'last_request'])
        try: count = int(count)
        except: count = 0

        try: last_request = int(last_request)
        except: last_request = 0

        # checking calls_per_day
        if not count and not last_request:
            count = 1
        elif count < calls_per_day:
            count = count + 1
        else:
            wait = 0 # calculate the wait time for tomorrow
            return (True, wait)

        # checking lapse_between_calls
        lapse = settings.API_TYPE[type]['lapse_between_calls']
        if not last_request or lapse == 0 or ( last_request + lapse <= now ):
            c.hmset(key, {'count': count, 'last_request': now})
            return (False, 0)
        else:
            wait = int(last_request + lapse - now)
            return (True, wait)


    def account_too_many_requests(self, account_id):
        """ Checks if the account has received too many request """

        # preparing data
        calls_per_month = Threshold.objects.get_limit_by_code_and_account_id('api.account_monthly_calls', account_id)

        # gettings data from cache
        c = Cache()
        current_date = self._get_current_date()
        key = 'API::ACCOUNT::%s::%s' % (account_id, current_date)

        year_month = current_date[:7]
        key_to_count = 'API::ACCOUNT::%s::%s*' % (account_id, year_month)

        count = 0
        for key_date in c.keys(key_to_count):
            cache_values = c.hgetall(key_date)
            if cache_values:
                count = count + int(cache_values['count'])

        # checking calls_per_month
        if not count:
            count = 1
        elif calls_per_month == -1 or count < calls_per_month:
            count = count + 1
        else:
            wait = 0 # calculate the wait time for tomorrow
            return (True, wait)

        c.hmset(key, {'count': count})
        return (False, 0)

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

    def resolve_account(self, request):
        try:
            domain = get_domain(request)

            if domain.find("api.dev.junar.com") > -1:
                dom = domain.split(".")
                account = Account.objects.get(pk=int(dom[0]))
            else:
                account = Account.objects.get(preference__key = 'account.api.domain', preference__value = domain, status = Account.ACTIVE)

            return account.id
        except Account.DoesNotExist:
            return None

    def _get_current_date(self):
        import datetime
        now = datetime.datetime.now()
        return now.strftime("%Y-%m-%d")
