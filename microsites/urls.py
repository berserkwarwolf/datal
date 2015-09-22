from django.conf.urls import *
from django.conf import settings
from django.views.generic import RedirectView
import os


def jsi18n(request, packages = None, domain = None):
    if not domain:
        domain = 'djangojs'
    from django.views.i18n import javascript_catalog
    return javascript_catalog(request, domain, packages)

js_info_dict = {
    'domain': 'djangojs',
    'packages': ('microsites'),
}

urlpatterns = patterns('',
    url(r'^$', RedirectView.as_view(pattern_name='loadHome.load')),
    (r'^i18n/', include('django.conf.urls.i18n')),
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),

    url(r'^a/(\w+)$', 'microsites.views.custom_pages'),

    (r'^visualizations/', include('microsites.viewChart.urls')),
    url(r'^visualizations/embed/(?P<guid>[A-Z0-9\-]+)$', 'microsites.viewChart.views.action_embed', name='chart_manager.action_embed'),

    #(r'^visualizationsb/', include('microsites.chart_manager.urls')),
    #url(r'^visualizationsb/embed/(?P<guid>[A-Z0-9\-]+)$', 'microsites.chart_manager.views.action_embed', name='chart_manager.action_embedb'),


    # dejamos datastreams para no romper,
    # dataviews como deberia quedar definitivamente
    (r'^datastreams/', include('microsites.viewDataStream.urls')),
    (r'^dataviews/', include('microsites.datastream_manager.urls')),

    url(r'^datastreams/embed/(?P<guid>[A-Z0-9\-]+)$', 'microsites.embedDataStream.views.action_embed',
        name='datastream_manager.embed'),

    (r'^datasets/', include('microsites.viewDataset.urls')),

    (r'^search/', include('microsites.search.urls')),
    #(r'^search$', include('microsites.search.urls')),
    url(r'^developers/$', 'core.manageDeveloper.views.action_query', name='manageDeveloper.action_query'),
    url(r'^developers$', 'core.manageDeveloper.views.action_query', name='manageDeveloper.action_query'),
    url(r'^manageDeveloper/action_insert$', 'core.manageDeveloper.views.action_insert', name='manageDeveloper.action_insert'),
    url(r'^branded/css/(?P<id>\d+).css$', 'microsites.views.action_css', name='microsites.action_css'),
    url(r'^branded/js/(?P<id>\d+).js$', 'microsites.views.action_js', name='microsites.action_js'),
    url(r'^branded/newcss/(?P<id>\d+).css$', 'microsites.views.action_new_css', name='microsites.action_new_css'),

    url(r'^portal/DataServicesManager/actionEmbed/$', 'core.exportDataStream.views.legacy_embed', name='datastream_manager.legacy_embed'),
    url(r'^portal/Charts/actionEmbed/$', 'core.chart_manager.views.action_legacy_embed', name='chart_manager.action_legacy_embed'),

    url(r'^is_live$', 'microsites.views.action_is_live', name='microsites.action_is_live'),
    (r'^home/', include('microsites.loadHome.urls')),
    (r'^home', include('microsites.loadHome.urls')),
    url(r'^catalog.xml$', 'microsites.views.action_catalog_xml'),
    (r'^auth/', include('core.auth.urls')),

    
    (r'^js_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'js')}),
    (r'^js_microsites/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'microsites', 'js')}),

    url(r'^sitemap', 'microsites.home_manager.views.action_sitemap', name='home_manager.action_sitemap'),

)

handler404 = 'core.views.action404'
handler500 = 'core.views.action500'
