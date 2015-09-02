from core.models import *
from core.communitymanagers import *
from core.http import add_domains_to_permalinks


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
        datastreams =  DataStream.objects.query_hot_n(10,language, hot = idsDataStream)
            
    if visualizationIds:
        idsVisualization = ','.join(visualizationIds)
        datastreams +=  Visualization.objects.query_hot_n(language, hot = idsVisualization)
    return datastreams

def retrieveResourcePermalinks(resourceIds, language):

    datastreamIds = []
    visualizationIds = []
    dashboardIds = []
            
    for resource in resourceIds:
        if resource['type']== 'chart':
            visualizationIds.append(resource['id'])
        elif resource['type']== 'ds':
            datastreamIds.append(resource['id'])
        elif resource['type']== 'db':
            dashboardIds.append(resource['id'])
            
    resources = []
    if datastreamIds:
        idsDataStream = ','.join(datastreamIds)
        resources =  DataStream.objects.query_hot_n(10,language, hot = idsDataStream)
            
    if visualizationIds:
        idsVisualization = ','.join(visualizationIds)
        resources +=  Visualization.objects.query_hot_n(language, hot = idsVisualization)

    if dashboardIds:
        idsDashboards = ','.join(dashboardIds)
        resources +=  Dashboard.objects.query_hot_n(language, hot = idsDashboards)
        
    add_domains_to_permalinks(resources)

    return resources
