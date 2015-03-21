from junar.core.managers import IndexTankFinder

class ThemeFinder(IndexTankFinder):

    order_by = {'0': 'title'}

    def __init__(self):
        IndexTankFinder.__init__(self)

    def get_datastream_dictionary(self, doc):

        id = doc['datastream_id']
        title = doc['title']
        type = doc['type']



        return dict(id=id
                    , label = title
                    , value = title
                    , type = type)

    def get_dataset_dictionary(self, doc):

        dataset_id = doc['dataset_id']
        title = doc['title']
        collect_type = doc['type']

        return dict(id=dataset_id
                    , label = title
                    , value = title
                    , type = collect_type)

    def get_visualization_dictionary(self, doc):

        id = doc['visualization_id']
        title = doc['title']
        type = doc['type']


        return dict(id=id
                    , label = title
                    , value = title
                    , type = type)
    def get_dashboard_dictionary(self, doc):

        id = doc['dashboard_id']
        title = doc['title']
        type = doc['type']


        return dict(id=id
                    , label = title
                    , value = title
                    , type = type)