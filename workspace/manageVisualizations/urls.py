__author__ = 'jinfanzon'

from django.conf.urls import patterns, url
from workspace.manageVisualizations.views import *
from workspace.manageDataviews.views import filter as filterDataview

urlpatterns = patterns('',
    url(r'^$', list, name='manageVisualizations.list'),
    url(r'^filter$', filter, name='manageVisualizations.filter'),
    url(r'^filter_dataview$', filterDataview, name='manageDataviews.filter'),
    url(r'^remove/(?P<type>[a-z]+)/(?P<id>\d+)$', remove, name='manageVisualizations.remove'),
    url(r'^remove/(?P<id>\d+)$', remove, name='manageVisualizations.remove'),
    url(r'^view$', view, name='manageVisualizations.view'),
    url(r'^create$', create, name='manageVisualizations.create'),
    url(r'^create/(?P<type>[a-z]+)$', create, name='manageVisualizations.create_type'),
    url(r'^related_resources$', related_resources, name='manageVisualizations.related_resources'),


       )
