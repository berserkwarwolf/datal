from core import search

class ThemeFinder(search.elastic.ElasticsearchFinder):
    order_by = {'0': 'title'}

    def __init__(self):
        search.elastic.ElasticsearchFinder.__init__(self)
	self.logger("iniciando themefinder!!!")

    def get_datastream_dictionary(self, doc):
        return dict(id=doc['datastream_id'], label=doc['title'], value=doc['title'], type=doc['type'])

    def get_dataset_dictionary(self, doc):
        return dict(id=doc['dataset_id'], label=doc['title'], value=doc['title'], type=doc['type'])

    def get_visualization_dictionary(self, doc):
        return dict(id=doc['visualization_id'], label=doc['title'], value=doc['title'], type=doc['type'])

    def get_dashboard_dictionary(self, doc):
        return dict(id=doc['dashboard_id'], label=doc['title'], value=doc['title'], type=doc['type'])
