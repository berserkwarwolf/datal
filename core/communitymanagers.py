from django.db import connection
from django.core.urlresolvers import reverse
from core.models import *
from core.utils import slugify
from core import helpers

from core.search import *

# CategoryManager
def get_for_browse(self, category_slug, language):
    category_query = super(managers.CategoryManager, self).values('id', 'categoryi18n__name')
    category_query = category_query.filter(categoryi18n__language=language, categoryi18n__slug=category_slug)[0]
    return {'id': category_query['id'], 'name': category_query['categoryi18n__name']}
managers.CategoryManager.get_for_browse = get_for_browse


class FinderManager(finder.FinderManager):
    def __init__(self, finder_class=searchify.IndexTankFinder, failback_finder_class=searchify.IndexTankFinder):
        self.finder_class = finder_class
	    
        self.finder = elastic.ElasticsearchFinder
        self.failback_finder_class = failback_finder_class
        self.failback_finder_class = elastic.ElasticsearchFinder
        finder.FinderManager.__init__(self)
