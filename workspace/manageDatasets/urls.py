from django.conf.urls import patterns, url

from workspace.manageDatasets.views import *

urlpatterns = patterns(
    '',
    url(r'^$', index, name='manageDatasets.index'),
    url(r'^(?P<revision_id>\d+)$', action_view, name='manageDatasets.view'),
    url(r'^create$', list, name='manageDatasets.create'),
    url(r'^create/(?P<collect_type>[a-z]+)$', create, name='manageDatasets.create_type'),
    url(r'^edit$', edit, name='manageDatasets.edit'),
    url(r'^edit/(?P<dataset_revision_id>\d+)/$', edit, name='manageDatasets.edit'),
    url(r'^filter$', filter, name='manageDatasets.filter'),
    url(r'^filters.json$', get_filters_json, name='manageDatasets.get_filters'),
    url(r'^remove/(?P<type>[a-z]+)/(?P<dataset_revision_id>\d+)$', remove, name='manageDatasets.remove'),
    url(r'^remove/(?P<dataset_revision_id>\d+)$', remove, name='manageDatasets.remove'),
    url(r'^related_resources$', related_resources, name='manageDatasets.related_resources'),
    url(r'^change_status/(?P<dataset_revision_id>\d+)/$', change_status, name='manageDatasets.change_status'),
    url(r'^action_load$', action_load, name='manageDatasets.action_load'),
    url(r'^action_request_file$', action_request_file, name='dataset_manager.action_request_file'),
    url(r'^check_source_url$', check_source_url, name='check_source_url'),
)
