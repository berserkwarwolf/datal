from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^$', 'microsites.loadHome.views.load', name='loadHome.load'),
    url(r'^action_update_list', 'microsites.loadHome.views.action_update_list', name='loadHome.action_update_list'),
    url(r'^action_update_categories', 'microsites.loadHome.views.action_update_categories', name='loadHome.action_update_categories'),
)
