from django.conf.urls import patterns, url

from workspace.downloadDataset import download
from microsites.viewDataset.views import view

urlpatterns = patterns('',
    url(r'^(?P<dataset_id>\d+)/(?P<slug>[\w-]+)', view, name='manageDatasets.action_view'),
    url(r'^(?P<dataset_id>\d+)-(?P<slug>[\w-]+).download$', download, name='dataset_manager.download'),
)
