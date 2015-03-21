# -*- coding: utf-8 -*-
from django.conf import settings

"""Inversion Of Control """

class DependenciesInjector(object):

    def process_request(self, request):
        """
        Checks user, role and account
        """
        if request.user == None:
            request.preferences = {}
            return None

        preferences = request.user.account.get_preferences()
        request.preferences = preferences
        request.is_private_site = False

        bucket_name = preferences['account_bucket_name']
        if not bucket_name:
            bucket_name = settings.AWS_BUCKET_NAME

        request.bucket_name = bucket_name

        return None