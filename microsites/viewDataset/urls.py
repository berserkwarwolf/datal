from django.conf.urls import *
from microsites.viewDataset.views import *

urlpatterns = patterns('',
    url(r'^(?P<dataset_id>\d+)/(?P<slug>[A-Za-z0-9\-]+)$', 'action_view', name='manageDatasets.action_view'),
    url(r'^(?P<dataset_id>\d+)-(?P<slug>[A-Za-z0-9\-]+).download$', 'core.dataset_manager.views.action_download', name='dataset_manager.action_download'),

)