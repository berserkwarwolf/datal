from django.conf.urls import patterns, url

from core.downloadDataset.views import action_download
from microsites.viewDataset.views import view

urlpatterns = patterns('',
    url(r'^(?P<dataset_id>\d+)/(?P<slug>[\w-]+)', view, name='manageDatasets.action_view'),
    url(r'^(?P<dataset_id>\d+)-(?P<slug>[\w-]+).download$', action_download, name='dataset_manager.action_download'),
)
