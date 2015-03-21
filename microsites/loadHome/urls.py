from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^$', 'junar.microsites.loadHome.views.load', name='loadHome.load'),
    url(r'^action_update_list', 'junar.microsites.loadHome.views.action_update_list', name='loadHome.action_update_list'),
    url(r'^action_update_categories', 'junar.microsites.loadHome.views.action_update_categories', name='loadHome.action_update_categories'),
)
