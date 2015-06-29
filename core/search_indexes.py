from haystack import indexes
from core.models import *
import time

class DatasetIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    docid = indexes.CharField(model_attr="dataset_id")
    dataset_id = indexes.CharField(model_attr="dataset_id")
    datasetrevision_id = indexes.CharField(model_attr="id")
    owner_nick = indexes.CharField(model_attr="user__nick")
    end_point = indexes.CharField(model_attr='end_point')
    type = indexes.CharField(default="dt")

    # Probar!!!
    account_id = indexes.CharField(model_attr='dataset__user__account__id')

    parameters = indexes.MultiValueField()

    def prepare_docid(self, obj):
	return "DT::DATASET-ID-" + str(obj.dataset.id),

    def prepare_parameters(self, obj):
	return []

    def get_model(self):
        return DatasetRevision


    def prepare(self, object):
        self.prepared_data = super(DatasetIndex, self).prepare(object)

	dataseti18n = DatasetI18n.objects.get(dataset_revision=object)
        tags = object.tagdataset_set.all().values_list('tag__name', flat=True)
	category = object.category.categoryi18n_set.all()[0]

	self.prepared_data['title'] = dataseti18n.title
	self.prepared_data['description'] = dataseti18n.description
	self.prepared_data['timestamp'] = int(time.mktime(object.created_at.timetuple()))

	text = [dataseti18n.title, dataseti18n.description, object.user.nick, str(object.dataset.guid)]

        tags = object.tagdataset_set.all().values_list('tag__name', flat=True)
        text.extend(tags)

	self.prepared_data['texto'] = ' '.join(text)
	self.prepared_data['tags'] = ' '.join(tags)
	self.prepared_data['categories'] = {'id':unicode(category.category_id), "name": category.name}


        return self.prepared_data
