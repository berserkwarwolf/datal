from django.conf.urls import *
from microsites.viewDataset.views import *
from core.dataset_manager.views import action_download

urlpatterns = patterns('',
    url(r'^(?P<dataset_id>\d+)/(?P<slug>[A-Za-z0-9\-]+)$', action_view, name='manageDatasets.action_view'),
    url(r'^(?P<dataset_id>\d+)-(?P<slug>[A-Za-z0-9\-]+).download$', action_download, name='dataset_manager.action_download'),

)