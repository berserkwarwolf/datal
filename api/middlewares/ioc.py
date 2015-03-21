# -*- coding: utf-8 -*-
"""Inversion Of Control """

class DependenciesInjector(object):

    def process_request(self, request):
        """
        Checks user, role and account
        """
        if request.account == None:
            return None

        preferences = request.account.get_preferences()
        request.preferences = preferences

        return None