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
	'packages': ('junar.workspace'),
}

urlpatterns = patterns('',
	# i18n
	(r'^i18n/', include('django.conf.urls.i18n')),
	(r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),

	url(r'^$', 'junar.workspace.views.home', name='workspace.home'),
	url(r'^signup/$', 'junar.workspace.accounts.views.signup', name='accounts.signup'),
#    url(r'^signup-free/$', 'junar.workspace.accounts.views.signup_free', name='accounts.signup_free'),
	url(r'^signout/$', 'junar.workspace.accounts.views.signout', name='accounts.signout'),
	url(r'^signin/$', 'junar.workspace.accounts.views.signin', name='accounts.signin'),
	url(r'^welcome/$', 'junar.workspace.viewLandingPage.views.load', name='accounts.landing'),
	url(r'^login/$', 'junar.workspace.accounts.views.login', name='accounts.login'),
	url(r'^forgot_password/$', 'junar.workspace.accounts.views.forgot_password', name='accounts.forgot_password'),
	url(r'^recovery/$', 'junar.workspace.accounts.views.recovery', name='accounts.recovery'),
	url(r'^password_recovery/$', 'junar.workspace.accounts.views.password_recovery', name='accounts.password_recovery'),


        url(r'^datasets/', include('junar.workspace.manageDatasets.urls')),
        url(r'^dataviews/', include('junar.workspace.manageDataviews.urls')),
        url(r'^visualizations/', include('junar.workspace.manageVisualizations.urls')),

	# TODO Nacho: Added by Nacho. This should be implemented different. Andres, please review
	
	(r'^accounts/', include('junar.workspace.accounts.urls')),
	(r'^tag_manager/', include('junar.workspace.tag_manager.urls')),
	(r'^source_manager/', include('junar.workspace.source_manager.urls')),
	(r'^viewLandingPage/', include('junar.workspace.viewLandingPage.urls')),
	(r'^admin/', include('junar.workspace.admin_manager.urls')),
	(r'^reports/', include('junar.workspace.reports_manager.urls')),
	(r'^auth/', include('junar.core.auth.urls')),
	(r'^personalizeHome/', include('junar.workspace.personalizeHome.urls')),

	(r'^js_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'js')}),
	(r'^js_workspace/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'workspace', 'js')}),
	(r'^media_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'media')}),
	(r'^media_workspace/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'workspace', 'media')}),
	(r'^media_microsites/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'microsites', 'media')}),

	# please leave me always as the last url pattern
	url(r'^(?P<admin_url>[A-Za-z0-9\-]+)/$', 'junar.workspace.accounts.views.signin', name='accounts.account_signin'),
)

handler404 = 'junar.core.views.action404'
handler500 = 'junar.core.views.action500'
