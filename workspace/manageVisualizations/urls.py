from django.conf.urls import patterns, url
from workspace.manageVisualizations.views import *
from workspace.manageDataviews.views import filter as filterDatastreams


urlpatterns = patterns(
    '',
    # Confirmados
    url(r'^$', index, name='manageVisualizations.index'),
    url(r'^filter_datastream$', filterDatastreams, name='manageDatastream.filter'),
    url(r'^create$', create, name='manageVisualizations.create'),
    url(r'^preview$', preview, name='manageVisualizations.preview'),
    url(r'^(?P<revision_id>\d+)$', action_view, name='manageVisualizations.view'),
    url(r'^remove/(?P<type>[a-z]+)/(?P<visualization_revision_id>\d+)$', remove, name='manageVisualizations.remove'),
    url(r'^remove/(?P<visualization_revision_id>\d+)$', remove, name='manageVisualizations.remove'),
    url(r'^unpublish/(?P<type>[a-z]+)/(?P<visualization_revision_id>\d+)$', unpublish, name='manageVisualizations.unpublish'),
    url(r'^unpublish/(?P<visualization_revision_id>\d+)$', unpublish, name='manageVisualizations.unpublish'),
    url(r'^invoke$', action_invoke, name='manageVisualizations.action_invoke'),

    # Pendientes de revision

    url(r'^filter$', filter, name='manageVisualizations.filter'),

    url(r'^create/(?P<type>[a-z]+)$', create, name='manageVisualizations.create_type'),
    url(r'^related_resources$', related_resources, name='manageVisualizations.related_resources'),
    url(r'^edit$', edit, name='manageVisualizations.edit'),
    url(r'^edit/(?P<visualization_revision_id>\d+)$', edit, name='manageVisualizations.edit'),
)
