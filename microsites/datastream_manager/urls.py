from django.conf.urls import *
from microsites.datastream_manager.views import hits_stats

urlpatterns = patterns('',

    # Agregado por ignacio feijoo
    # este url lo saque de microsites/viewDataStream/urls.py
    # ya que como /dataviews/ID/GUID/ no resolvia
    url(r'^(?P<id>\d+)/(?P<slug>[A-Za-z0-9\-]+)/$', 'microsites.viewDataStream.views.view',
        name='viewDataStream.view'),


    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).download$', 'core.downloadDatastream.views.download',
        name='datastream_manager.download'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).csv$', 'core.exportDataStream.views.action_csv',
        name='datastream_manager.action_csv'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).html$', 'core.exportDataStream.views.action_html',
        name='datastream_manager.action_html'),
    url(r'^(?P<id>\d+)-(?P<slug>[A-Za-z0-9\-]+).xls(?:$|x$)', 'core.exportDataStream.views.action_xls',
        name='datastream_manager.action_xls'),
    url(r'^updategrid$', 'core.exportDataStream.views.action_updategrid',
        name='datastream_manager.action_updategrid'),
    url(r'^get_last_30_days_datastream/(?P<id>\d+)$', hits_stats,
        name='datastream_manager.get_last_30_days_datastream'),
    url(r'^category/(?P<category_slug>[A-Za-z0-9\-]+)/$', 'microsites.search.views.action_browse',
        name='search.action_browse'),
    url(r'^category/(?P<category_slug>[A-Za-z0-9\-]+)/page/(?P<page>\d+)/$', 'microsites.search.views.action_browse',
        name='search.action_browse'),
    url(r'^invoke$', 'core.exportDataStream.views.action_invoke'),
)
