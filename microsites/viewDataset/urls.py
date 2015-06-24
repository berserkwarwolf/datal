from django.conf.urls import patterns, url

from core.dataset_manager.views import action_download
from microsites.viewDataset.views import action_view

urlpatterns = patterns('',
    url(r'^(?P<dataset_id>\d+)/(?P<slug>[\w-]+)', action_view, name='manageDatasets.action_view'),
    url(r'^(?P<dataset_id>\d+)-(?P<slug>[\w-]+).download$', action_download, name='dataset_manager.action_download'),
)
