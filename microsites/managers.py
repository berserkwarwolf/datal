from django.core.urlresolvers import reverse
from core.helpers import slugify
from core import managers
from core.search import *


# CategoryManager
def get_for_browse(self, category_slug, account_id, language):
    category_query = super(CategoryManager, self).values('id', 'categoryi18n__name')
    category_query = category_query.get(categoryi18n__language = language
                                        , categoryi18n__slug=category_slug, account = account_id)
    return {'id': category_query['id'], 'name': category_query['categoryi18n__name']}

managers.CategoryManager.get_for_browse = get_for_browse

class FinderManager(finder.FinderManager):

    def __init__(self):
        self.finder_class = elastic.ElasticsearchFinder
        self.failback_finder_class = elastic.ElasticsearchFinder
        finder.FinderManager.__init__(self)
