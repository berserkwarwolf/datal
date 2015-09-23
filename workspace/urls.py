import os

from django.conf.urls import *
from django.conf import settings
from django.views.i18n import javascript_catalog
from core.rest import RestDataSetViewSet
from workspace.rest import RestDataStreamViewSet, RestMapViewSet, RestChartViewSet
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'datastreams', RestDataStreamViewSet, base_name='datastreams')
router.register(r'maps', RestMapViewSet, base_name='maps')
router.register(r'charts', RestChartViewSet, base_name='charts')
router.register(r'datasets', RestDataSetViewSet, base_name='datasets')

def jsi18n(request, packages=None, domain=None):
    if not domain:
        domain = 'djangojs'
    return javascript_catalog(request, domain, packages)

js_info_dict = {
    'domain': 'djangojs',
    'packages': ('workspace'),
}

urlpatterns = patterns('',
    (r'^i18n/', include('django.conf.urls.i18n')),
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),
    url(r'^$', 'workspace.views.home', name='workspace.home'),
    url(r'^signup/$', 'workspace.manageMyAccount.views.signup', name='accounts.signup'),
    # url(r'^signup-free/$', 'workspace.manageMyAccount.views.signup_free', name='accounts.signup_free'),
    url(r'^signout/$', 'workspace.manageMyAccount.views.signout', name='accounts.signout'),
    url(r'^signin/$', 'workspace.manageMyAccount.views.signin', name='accounts.signin'),
    url(r'^welcome/$', 'workspace.viewLandingPage.views.load', name='accounts.landing'),
    url(r'^login/$', 'workspace.manageMyAccount.views.login', name='accounts.login'),
    url(r'^forgot_password/$', 'workspace.manageMyAccount.views.forgot_password', name='accounts.forgot_password'),
    url(r'^recovery/$', 'workspace.manageMyAccount.views.recovery', name='accounts.recovery'),
    url(r'^datasets/', include('workspace.manageDatasets.urls')),

    #TODO fix all urls (streams -> dataviews)
    url(r'^dataviews/', include('workspace.manageDataviews.urls')),
    
    url(r'^visualizations/', include('workspace.manageVisualizations.urls')),
   
    # TODO Nacho: Added by Nacho. This should be implemented different. Andres, please review
    (r'^accounts/', include('workspace.manageMyAccount.urls')),
    (r'^tag_manager/', include('workspace.searchTags.urls')),
    (r'^source_manager/', include('workspace.searchSources.urls')),
    (r'^viewLandingPage/', include('workspace.viewLandingPage.urls')),
    (r'^admin/', include('workspace.manageAccount.urls')),
    (r'^auth/', include('core.auth.urls')),
    (r'^personalizeHome/', include('workspace.personalizeHome.urls')),
    (r'^js_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'js')}),
    (r'^js_workspace/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'workspace', 'js')}),
    # Please leave me always as the last url pattern
    url(r'^(?P<admin_url>[A-Za-z0-9\-]+)/$', 'workspace.manageMyAccount.views.signin', name='accounts.account_signin'),
    (r'^rest/', include(router.urls)), 
)

handler404 = 'core.views.action404'
handler500 = 'core.views.action500'
