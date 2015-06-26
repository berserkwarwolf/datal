from haystack import indexes
from core.models import *

class DatasetIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    docid = indexes.CharField(model_attr="dataset_id")
    categories = indexes.CharField(model_attr='category')

    def get_model(self):
        return DatasetRevision
