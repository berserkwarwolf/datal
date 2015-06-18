# -*- coding: utf-8 -*-
from django.conf import settings
from core.models import Dataset, DataStream, Visualization, Dashboard
from core.cache import Cache
"""Inversion Of Control """


class DependenciesInjector(object):

    def process_request(self, request):
        """
        Checks user, role and account
        """
        if not request.user:
            request.preferences = {}
            return None

        preferences = request.user.account.get_preferences()
        request.preferences = preferences

        bucket_name = preferences['account_bucket_name']
        if not bucket_name:
            bucket_name = settings.AWS_BUCKET_NAME

        request.bucket_name = bucket_name
        self.read_stats(request)
        self.calculate_perc(request)

        return None

    def read_stats(self, request):
        user_id = request.auth_manager.id
        c = Cache(db=0)
        request.stats = {}

        # Stats por usuario
        request.stats['my_total_datasets'] = request.user.get_total_datasets()
        request.stats['my_total_datastreams'] = request.user.get_total_datastreams()
        request.stats['my_total_dashboards'] = request.user.get_total_dashboards()
        request.stats['my_total_visualizations'] = request.user.get_total_visualizations()

        # Stats por cuenta
        request.stats['acount_total_datasets'] = request.account.get_total_datasets()
        request.stats['account_total_datastreams'] = request.account.get_total_datastreams()
        request.stats['my_total_dashboards'] = request.account.get_total_dashboards()
        request.stats['my_total_visualizations'] = request.account.get_total_visualizations()

    def calculate_perc(self, request):
        request.stats['max_resource'] = max( [ request.stats['my_total_datasets'],
                                              request.stats['my_total_datastreams'],
                                              request.stats['my_total_dashboards'],
                                              request.stats['my_total_visualizations'] ] )
        perc = lambda a, b: b > 0 and str(float(a)/float(b) * 100).replace(',', '.') or 0
        request.stats['my_total_perc_datasets']=perc(request.stats['my_total_datasets'], request.stats['max_resource'])
        request.stats['my_total_perc_datastreams']=perc(request.stats['my_total_datastreams'], request.stats['max_resource'])
        request.stats['my_total_perc_dashboards']=perc(request.stats['my_total_dashboards'], request.stats['max_resource'])
        request.stats['my_total_perc_visualizations']=perc(request.stats['my_total_visualizations'], request.stats['max_resource'])