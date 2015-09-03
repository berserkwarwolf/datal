import os

from django.conf.urls import *
from django.conf import settings
from django.views.i18n import javascript_catalog


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
    url(r'^signup/$', 'workspace.accounts.views.signup', name='accounts.signup'),
    # url(r'^signup-free/$', 'workspace.accounts.views.signup_free', name='accounts.signup_free'),
    url(r'^signout/$', 'workspace.accounts.views.signout', name='accounts.signout'),
    url(r'^signin/$', 'workspace.accounts.views.signin', name='accounts.signin'),
    url(r'^welcome/$', 'workspace.viewLandingPage.views.load', name='accounts.landing'),
    url(r'^login/$', 'workspace.accounts.views.login', name='accounts.login'),
    url(r'^forgot_password/$', 'workspace.accounts.views.forgot_password', name='accounts.forgot_password'),
    url(r'^recovery/$', 'workspace.accounts.views.recovery', name='accounts.recovery'),
    url(r'^datasets/', include('workspace.manageDatasets.urls')),

    #TODO fix all urls (streams -> dataviews)
    url(r'^dataviews/', include('workspace.manageDataviews.urls')),
    
    url(r'^visualizations/', include('workspace.manageVisualizations.urls')),
   
    # TODO Nacho: Added by Nacho. This should be implemented different. Andres, please review
    (r'^accounts/', include('workspace.accounts.urls')),
    (r'^tag_manager/', include('workspace.searchTags.urls')),
    (r'^source_manager/', include('workspace.source_manager.urls')),
    (r'^viewLandingPage/', include('workspace.viewLandingPage.urls')),
    (r'^admin/', include('workspace.admin_manager.urls')),
    (r'^reports/', include('workspace.reports_manager.urls')),
    (r'^auth/', include('core.auth.urls')),
    (r'^personalizeHome/', include('workspace.personalizeHome.urls')),
    (r'^js_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'js')}),
    (r'^js_workspace/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'workspace', 'js')}),
    # Please leave me always as the last url pattern
    url(r'^(?P<admin_url>[A-Za-z0-9\-]+)/$', 'workspace.accounts.views.signin', name='accounts.account_signin'),
)

handler404 = 'core.views.action404'
handler500 = 'core.views.action500'
