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
    'packages': ('junar.core'),
}

urlpatterns = patterns('',
    # i18n
    (r'^i18n/', include('django.conf.urls.i18n')),
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),

    (r'^accounts/', include('junar.workspace.accounts.urls')),
    (r'^dataset/', include('junar.workspace.dataset_manager.urls')),
    (r'^review/', include('junar.workspace.review_manager.urls')),

    (r'^js_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'js')}),
    (r'^media_core/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(settings.PROJECT_PATH, 'core', 'media')}),

    # please leave me always as the last url pattern
    url(r'^(?P<admin_url>[A-Za-z0-9\-]+)/$', 'junar.workspace.accounts.views.signin', name='accounts.account_signin'),
)

handler404 = 'junar.core.views.action404'
handler500 = 'junar.core.views.action500'