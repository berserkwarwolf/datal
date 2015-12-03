from core.models import *
from core.http import add_domains_to_permalinks
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO


def retrieveDatastreams(resourceIds, language):

    datastreamIds = []
    visualizationIds = []
            
    for resource in resourceIds:
        if resource['type']== 'chart':
            visualizationIds.append(resource['id'])
        elif resource['type']== 'ds':
            datastreamIds.append(resource['id'])
            
    datastreams = []
    if datastreamIds:
        idsDataStream = ','.join(datastreamIds)
        datastreams =  DataStreamDBDAO().query_hot_n(10,language, hot = idsDataStream)
            
    if visualizationIds:
        idsVisualization = ','.join(visualizationIds)
        datastreams +=  VisualizationDBDAO().query_hot_n(language, hot = idsVisualization)
    return datastreams

def retrieveResourcePermalinks(resourceIds, language):

    datastreamIds = []
    visualizationIds = []
            
    for resource in resourceIds:
        if resource['type']== 'chart':
            visualizationIds.append(resource['id'])
        elif resource['type']== 'ds':
            datastreamIds.append(resource['id'])
            
    resources = []
    if datastreamIds:
        idsDataStream = ','.join(datastreamIds)
        resources =  DataStreamDBDAO().query_hot_n(10,language, hot = idsDataStream)
            
    if visualizationIds:
        idsVisualization = ','.join(visualizationIds)
        resources +=  VisualizationDBDAO.query_hot_n(language, hot = idsVisualization)

 
    add_domains_to_permalinks(resources)

    return resources
