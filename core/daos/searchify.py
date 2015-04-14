# -*- coding: utf-8 -*-
import time
import json

from core.lib.searchify import SearchifyIndex


class SearchifyDAO:
    """ index or unindex resources on searchiy """
    
    def index(self, resource_get):
        """ dataset version for searchify """
        if resource_get['resource_type'] == 'dataset':
            doc = self.create_dataset_doc(resource_get)
        elif resource_get['resource_type'] == 'datastream':
            doc = self.create_datastream_doc(resource_get)
        elif resource_get['resource_type'] == 'visualization':
            doc = self.create_visualization_doc(resource_get)
        SearchifyIndex().get().indexit(doc)

    def unindex(self, resource_get):
        """ remove from searchify """
        if resource_get['resource_type'] == 'dataset':
            doc = self.create_dataset_doc(resource_get)
        elif resource_get['resource_type'] == 'datastream':
            doc = self.create_datastream_doc(resource_get)
        elif resource_get['resource_type'] == 'visualization':
            doc = self.create_visualization_doc(resource_get)
        SearchifyIndex().get().delete_documents(doc)
    
    def create_dataset_doc(self, dataset_get):
        
        dataset = dataset_get # for remembering to uset DAO dataset get function
        
        text = [dataset['title'], dataset['description'], dataset['user_nick'], str(dataset['dataset_id']) ] #DS uses GUID, but here doesn't exists. We use ID
        text.extend(dataset['tags']) # datastream has a table for tags but seems unused. I define get_tags funcion for dataset.
        text.extend(dataset['sources'])
        text = ' '.join(text)
        
        tags = ','.join(dataset['tags'])
        sources = ','.join(dataset['sources'])
        timestamp = int(time.mktime(dataset['created_at'].timetuple()))
        parameters = '' #TODO full this
        
        doc = {'docid' : "DT::DATASET-ID-%d" % dataset['dataset_id'],
            'fields' :
                {'type' : 'dt',
                 'dataset_id': dataset['dataset_id'],
                 'datasetrevision_id': dataset['dataset_revision_id'] ,
                 'title': dataset['title'] ,
                 'text': text ,
                 'description': dataset['description'] ,
                 'owner_nick' : dataset['user_nick'] ,
                 'tags' : tags ,
                 'sources' : sources ,
                 'account_id' : dataset['account_id'] ,
                 'parameters': parameters ,
                 'timestamp': timestamp,
                 'end_point': dataset['end_point'],
                },
            'categories': {'id': dataset['category_id'], 'name': dataset['category_name'] }
            }

        """ #TODO add xtra facets
        doc = add_facets_to_doc(self, account, doc)
        doc['fields'].update(get_meta_data_dict(dataset.metadata))
        """ 
        return doc

    def create_datastream_doc(self, datastream_get):
        datastream = datastream_get
        tags = ','.join(datastream['tags'])
        timestamp = int(time.mktime(datastream['created_at'].timetuple()))
        
        parameters = []
        for parameter in datastream['parameters']:
            parameters.append({'name': parameter.name, 'description': parameter.description})
        if parameters:
            parameters = json.dumps(parameters)
        else:
            parameters = ''

        text = [datastream['title'], datastream['description'], datastream['user_nick'], datastream['guid']]
        text.extend(datastream['tags'])
        text = ' '.join(text)
        
        doc = {
            'docid' : "DS::" + datastream['guid'],
            'fields' :
                {'type' : 'ds',
                 'datastream_id': datastream['datastream_id'],
                 'datastreamrevision_id': ['datastream.datastream_revision_id'],
                 'title': datastream['title'],
                 'text': text,
                 'description': datastream['description'],
                 'owner_nick' : datastream['user_nick'],
                 'tags' : tags,
                 'account_id' : datastream['account_id'],
                 'parameters': parameters,
                 'timestamp': timestamp,
                 'end_point': datastream['end_point'],
                },
            'categories': {'id': unicode(datastream['category_id']), 'name': datastream['category_name']}
            }

        """ #TODO add xtra facets 
        doc = add_facets_to_doc(self, account, doc)
        doc['fields'].update(get_meta_data_dict(datastream.metadata))
        """        
        return doc
        
    def create_visualization_doc(self, visualization_get):
        visualization=visualization_get
        
        text = [visualization['title'], visualization['description'], visualization['user_nick'], visualization['guid']]
        text.extend(visualization['tags'])
        text = ' '.join(text)
        tags = ','.join(visualization['tags'])
        timestamp = int(time.mktime(visualization['created_at'].timetuple()))
        doc = {
                'docid' : "VZ::" + visualization['guid'],
                'fields' :
                    {'type' : 'chart',
                     'visualization_id': visualization['visualization_id'],
                     'visualizationrevision_id': visualization['visualization_revision_id'],
                     'datastream_id': visualization['datastream_id'],
                     'title': visualization['title'],
                     'text': text,
                     'description': visualization['description'],
                     'category_id' : visualization['category_id'],
                     'category_name' : visualization['category_name'],
                     'owner_nick' : visualization['user_nick'],
                     'tags' : tags,
                     'account_id' : visualization['account_id'],
                     'timestamp' : timestamp,
                    },
                'categories': {'id': unicode(visualization['category_id']), 'name': visualization['category_name']}
                }

        """ #TODO add xtra facets
        doc = add_facets_to_doc(self, account, doc)
        doc['fields'].update(get_meta_data_dict(visualization.metadata))
        """
        
        return doc