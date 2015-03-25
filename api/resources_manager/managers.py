from api.managers import IndexTankFinder as api_IndexTankFinder

class IndexTankFinder(api_IndexTankFinder):

    def __init__(self):
        api_IndexTankFinder.__init__(self)

    def get_visualization_dictionary(self, doc):
        dictionary = api_IndexTankFinder.get_visualization_dictionary(self, doc)
        dictionary['type'] = 'visualization'
        return dictionary

    def get_dashboard_dictionary(self, doc):
        dictionary = api_IndexTankFinder.get_dashboard_dictionary(self, doc)
        dictionary['type'] = 'dashboard'
        return dictionary

    def get_datastream_dictionary(self, doc):
        dictionary = api_IndexTankFinder.get_datastream_dictionary(self, doc)
        dictionary['type'] = 'datastream'
        return dictionary

    def get_dataset_dictionary(self, doc):
        dictionary = api_IndexTankFinder.get_dataset_dictionary(self, doc)
        dictionary['type'] = 'dataset'
        return dictionary
