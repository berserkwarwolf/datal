from django.conf.urls import *
from .views import action_search_source
from .views import action_search_source_select2

urlpatterns = patterns(
    '',
    url(r'^action_search$', action_search_source, name='source_manager.action_search'),

    # URL para Select 2: Despues de migrar todos a select 2, debemos limpiar action_search_source, y el import.
    url(r'^action_search_select2$', action_search_source_select2, name='source_manager.action_search_select2'),
)
