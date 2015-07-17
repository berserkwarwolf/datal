from core import search


class ApiFinder(elastic.ElasticsearchFinder):

    def __init__(self):
        elastic.ElasticsearchFinder.__init__(self)

    def get_visualization_dictionary(self, doc):
        dictionary = elastic.ElasticsearchFinder.get_visualization_dictionary(self, doc)
        dictionary['type'] = 'visualization'
        return dictionary

    def get_dashboard_dictionary(self, doc):
        dictionary = elastic.ElasticsearchFinder.get_dashboard_dictionary(self, doc)
        dictionary['type'] = 'dashboard'
        return dictionary

    def get_datastream_dictionary(self, doc):
        dictionary = elastic.ElasticsearchFinder.get_datastream_dictionary(self, doc)
        dictionary['type'] = 'datastream'
        return dictionary

    def get_dataset_dictionary(self, doc):
        dictionary = elastic.ElasticsearchFinder.get_dataset_dictionary(self, doc)
        dictionary['type'] = 'dataset'
        return dictionary
