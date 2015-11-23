from django.conf.urls import *

urlpatterns = patterns('',
    url(r'^$', 'microsites.loadHome.views.load', name='loadHome.load'),
    url(r'^update_list', 'microsites.loadHome.views.update_list', name='loadHome.update_list'),
    url(r'^update_categories', 'microsites.loadHome.views.update_categories', name='loadHome.update_categories'),
)
