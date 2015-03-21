from django.conf.urls import *
from django.conf import settings

import os

def jsi18n(request, packages = None, domain = None):
    if not domain:
        domain = 'djangojs'
    from django.views.i18n import javascript_catalog
    return javascript_catalog(request, domain, packages)

js_info_dict = {
    'domain': 'djangojs',
    'packages': ('junar.microsites'),
}

urlpatterns = patterns('',
    (r'^i18n/', include('django.conf.urls.i18n')),
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),

    url(r'^$', 'junar.microsites.views.home', name='microsites.home'),
    url(r'^a/(\w+)$', 'junar.microsites.views.custom_pages'),
    (r'^dashboards/', include('junar.microsites.dashboard_manager.urls')),

    (r'^visualizations/', include('junar.microsites.viewChart.urls')),
    url(r'^visualizations/embed/(?P<guid>[A-Z0-9\-]+)$', 'junar.microsites.viewChart.views.action_embed', name='chart_manager.action_embed'),

    #(r'^visualizationsb/', include('junar.microsites.chart_manager.urls')),
    #url(r'^visualizationsb/embed/(?P<guid>[A-Z0-9\-]+)$', 'junar.microsites.chart_manager.views.action_embed', name='chart_manager.action_embedb'),

    (r'^datastreams/', include('junar.microsites.datastream_manager.urls')),
    url(r'^datastreams/embed/(?P<guid>[A-Z0-9\-]+)$', 'junar.microsites.datastream_manager.views.action_embed', name='datastream_manager.action_embed'),

    (r'^datasets/', include('junar.microsites.viewDataset.urls')),



    (r'^search/', include('junar.microsites.search.urls')),
    url(r'^developers/$', 'junar.core.developer_manager.views.action_query', name='developer_manager.action_query'),
    url(r'^developers$', 'junar.core.developer_manager.views.action_query', name='developer_manager.action_query'),
    url(r'^developer_manager/action_insert$', 'junar.core.developer_manager.views.action_insert', name='developer_manager.action_insert'),
    (r'^share/', include('junar.microsites.share_manager.urls')),
    url(r'^branded/css/(?P<id>\d+).css$', 'junar.microsites.views.action_css', name='microsites.action_css'),
    url(r'^branded/js/(?P<id>\d+).js$', 'junar.microsites.views.action_js', name='microsites.action_js'),
    url(r'^branded/newcss/(?P<id>\d+).css$', 'junar.microsites.views.action_new_css', name='microsites.action_new_css'),

    url(r'^portal/DataServicesManager/actionEmbed/$', 'junar.core.datastream_manager.views.action_legacy_embed', name='datastream_manager.action_legacy_embed'),
    url(r'^portal/Charts/actionEmbed/$', 'junar.core.chart_manager.views.action_legacy_embed', name='chart_manager.action_legacy_embed'),

    url(r'^is_live$', 'junar.microsites.views.action_is_live', name='microsites.action_is_live'),
    (r'^home/', include('junar.microsites.loadHome.urls')),
    (r'^home', include('junar.microsites.loadHome.urls')),
    url(r'^catalog.xml$', 'junar.microsites.views.action_catalog_xml'),
    (r'^auth/', include('junar.core.auth.urls')),

    url(r'^signout', 'junar.microsites.accounts.views.signout', name='accounts.signout'),
    url(r'^signin', 'junar.microsites.accounts.views.signin', name='accounts.signin'),
    url(r'^login', 'junar.microsites.accounts.views.login', name='accounts.login'),
    (r'^accounts/', include('junar.microsites.accounts.urls')),

    (r'^js_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'js')}),
    (r'^js_microsites/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'microsites', 'js')}),
    (r'^media_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'media')}),
    (r'^media_microsites/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'microsites', 'media')}),
    (r'^media_workspace/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'workspace', 'media')}),

    (r'^transparencia/', include('junar.microsites.transparency_manager.urls')),
    (r'^transparencia', include('junar.microsites.transparency_manager.urls')),

    (r'^transparency/', include('junar.microsites.transparency_manager.urls')),
    (r'^transparency', include('junar.microsites.transparency_manager.urls')),

    url(r'^sitemap', 'junar.microsites.home_manager.views.action_sitemap', name='home_manager.action_sitemap'),

    url(r'^(?P<nick>[A-Za-z0-9\-_\.]+)$', 'junar.microsites.views.action_user'),

)

handler404 = 'junar.core.views.action404'
handler500 = 'junar.core.views.action500'
