# -*- coding: utf-8 -*-
from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import Http404
from django.shortcuts import redirect
from junar.core.models import Account
from junar.core.http import get_domain
from junar.core.helpers import get_domain_with_protocol
import logging

class DependencyInjector(object):
    """ Gets the current site & account """

    def process_request(self, request):
        logger = logging.getLogger(__name__)
        domain = get_domain(request)
        logger.debug("process ms request for %s -- %s" % (domain, settings.DOMAINS['microsites']))


        if settings.DOMAINS['microsites'] != domain:

            try:
                # check for develop domains
                logger.debug("Check domain")
                account = Account.objects.get_by_domain(domain)
                logger.debug("domain checked")
                request.account = account

                preferences = account.get_preferences()
                preferences.load_all()
                request.preferences = preferences
                request.is_private_site = False

                bucket_name = preferences['account_bucket_name']
                if not bucket_name:
                    bucket_name = settings.AWS_BUCKET_NAME

                request.bucket_name = bucket_name

                is_signin = request.path.startswith(reverse('accounts.signin'))
                is_login = request.path.startswith(reverse('accounts.login'))
                is_activate = request.path.startswith(reverse('accounts.activate'))
                is_jsi18n = request.path.startswith('/jsi18n')

            except Account.DoesNotExist:
                logger.error('The account do not exists: %s' % domain)
                raise Http404

            language = request.preferences['account_language']
            if language:
                request.session['django_language'] = language
                request.auth_manager.language = language
        else:
            request.bucket_name = settings.AWS_BUCKET_NAME

            if request.META.get('REQUEST_URI') == '/':
                return redirect(get_domain_with_protocol('website'))

        return None
