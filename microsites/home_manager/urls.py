from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^$', 'junar.microsites.loadHome.views.load', name='loadHome.load'),
    url(r'^action_update_list', 'junar.microsites.home_manager.views.action_update_list', name='home.action_update_list'),
    url(r'^action_update_categories', 'junar.microsites.home_manager.views.action_update_categories', name='home.action_update_categories'),
)
