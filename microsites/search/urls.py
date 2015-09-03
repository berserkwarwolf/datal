from django.conf.urls import *
from microsites.search.views import *

urlpatterns = patterns(
    '',
    url(r'^category/(?P<category>.*)$', action_search_by_query_and_category,
        name='search.action_search_by_query_and_category'),
    url(r'^', action_search, name='search.action_search'),
)
