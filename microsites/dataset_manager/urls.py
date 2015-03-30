from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^(?P<dataset_id>\d+)-(?P<slug>[A-Za-z0-9\-]+).download$', 'core.dataset_manager.views.action_download', name='dataset_manager.action_download'),
)
