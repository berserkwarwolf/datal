from django.conf.urls import patterns, url

from workspace.manageDatasets.views import download
from microsites.viewDataset.views import view

urlpatterns = patterns('',
    url(r'^(?P<dataset_id>\d+)/(?P<slug>[\w-]+)', view, name='manageDatasets.view'),
    url(r'^(?P<dataset_id>\d+)-(?P<slug>[\w-]+).download$', download, name='manageDatasets.download'),
)
