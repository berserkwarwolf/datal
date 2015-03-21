from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^create', 'junar.workspace.accounts.views.create', name='accounts.create'),
    url(r'^activate', 'junar.workspace.accounts.views.activate', name='accounts.activate'),
    url(r'^check_admin_url', 'junar.workspace.accounts.views.action_check_admin_url', name='accounts.check_admin_url'),
    url(r'^my_account', 'junar.workspace.accounts.views.my_account', name='accounts.my_account'),
)
