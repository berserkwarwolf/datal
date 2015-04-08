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
        request.is_private_site = False

        bucket_name = preferences['account_bucket_name']
        if not bucket_name:
            bucket_name = settings.AWS_BUCKET_NAME

        self.read_stats(request)
        request.bucket_name = bucket_name

        return None

    def read_stats(self, request):
        user_id = request.auth_manager.id
        c = Cache(db=0)
        request.stats = {}

        my_total_datasets = c.get('my_total_datasets_' + str(user_id))
        if not my_total_datasets:
            my_total_datasets =  Dataset.objects.filter(user=user_id).count()
            c.set('my_total_datasets_' + str(user_id), my_total_datasets, settings.REDIS_STATS_TTL)
        request.stats['my_total_datasets'] = my_total_datasets

        my_total_datastreams = c.get('my_total_datastreams_' + str(user_id))
        if not my_total_datastreams:
            my_total_datastreams = DataStream.objects.filter(user=user_id).count()
            c.set('my_total_datastreams_' + str(user_id), my_total_datastreams, settings.REDIS_STATS_TTL)
        request.stats['my_total_datastreams'] = my_total_datastreams

        my_total_dashboards = c.get('my_total_dashboards_' + str(user_id))
        if not my_total_dashboards:
            my_total_dashboards = Dashboard.objects.filter(user=user_id).count()
            c.set('my_total_dashboards_' + str(user_id), my_total_dashboards, settings.REDIS_STATS_TTL)
        request.stats['my_total_dashboards'] = my_total_dashboards

        my_total_visualizations = c.get('my_total_visualizations_' + str(user_id))
        if not my_total_visualizations:
            my_total_visualizations = Visualization.objects.filter(user=user_id).count()
            c.set('my_total_visualizations_' + str(user_id), my_total_visualizations, settings.REDIS_STATS_TTL)

        request.stats['my_total_visualizations'] = my_total_visualizations