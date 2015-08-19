from django.conf.urls import patterns, url
from workspace.manageVisualizations.views import *
from workspace.manageDataviews.views import filter as filterDatastreams


urlpatterns = patterns(
    '',
    # Confirmados
    url(r'^$', list, name='manageVisualizations.list'),
    url(r'^filter_datastream$', filterDatastreams, name='manageDatastream.filter'),

    # Pendientes de revision
    url(r'^(?P<revision_id>\d+)$', action_view, name='manageVisualizations.view'),
    url(r'^filter$', filter, name='manageVisualizations.filter'),

    url(r'^remove/(?P<type>[a-z]+)/(?P<id>\d+)$', remove, name='manageVisualizations.remove'),
    url(r'^remove/(?P<id>\d+)$', remove, name='manageVisualizations.remove'),
    url(r'^view$', view, name='manageVisualizations.view'),
    url(r'^create$', create, name='manageVisualizations.create'),
    url(r'^create/(?P<type>[a-z]+)$', create, name='manageVisualizations.create_type'),
    url(r'^related_resources$', related_resources, name='manageVisualizations.related_resources'),
    url(r'^edit$', edit, name='manageVisualizations.edit'),
    url(r'^edit/(?P<visualization_revision_id>\d+)$', edit, name='manageVisualizations.edit'),
)
