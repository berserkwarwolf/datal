from django.conf.urls import *
from microsites.search.views import *

urlpatterns = patterns('',
    # FOR EXAMPLE http://recursos.datos.gob.cl/search/category/name:Finanzas
    url(r'^category/(?P<filter>.*)$', action_search_by_query_and_category, name='search.action_search_by_query_and_category'),
    url(r'^', action_search, name='search.action_search'),
)
