# -*- coding: utf-8 -*-

from core.models import *
from core.http import add_domains_to_permalinks
from core.daos.datastreams import DataStreamDBDAO
from core.daos.visualizations import VisualizationDBDAO
import json

class ThemeBuilder(object):
    """docstring for ClassName"""
    def __init__(self, preferences, is_preview, language, account):
        self.preferences = preferences
        self.is_preview = is_preview
        self.language = language
        self.account = account


    def retrieveDatastreams(self, resourceIds, language):

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

    def retrieveResourcePermalinks(self, resourceIds, language):

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

    def parse(self):
        response = {
            'preferences': self.preferences,
            'account': self.account,
            'is_preview': self.is_preview,
            'language': self.language,
            'config': {},
            'datastreams': [],
            'resources': [],
            'featured_accounts': [],
            #devuelve los ID de las cuentas federadas
            # faltaria resolver que hacer con los featured_accounts
            'federated_accounts': [x['id'] for x in self.account.account_set.values('id').all()],
            'categories': [],
            'account_id': None,
            'template_path': None
        }
        
        jsonObject = None
        if self.is_preview:
            jsonObject = json.loads(self.preferences["account_preview"], strict=False)
        elif self.preferences["account_has_home"]:
            jsonObject = json.loads(self.preferences["account_home"], strict=False)


        if jsonObject:
            response['config'] = config = jsonObject['config']
            response['template_path'] = 'loadHome/home_'+jsonObject['theme']+'.html'

            if config:
                if 'sliderSection' in config:
                    response['datastreams'] = self.retrieveDatastreams(
                        config['sliderSection'], self.language)
                if 'linkSection' in config:
                    response['resources'] = self.retrieveResourcePermalinks(
                        config['linkSection'], self.language)

            # en caso de que has_featured_accounts == True, falla el SQL contenido en Account.objects.get_featured_accounts
            # esta porción de código no funciona nunca.
            response['has_featured_accounts'] = self.preferences['account_home_filters'] == 'featured_accounts'
            if response['has_featured_accounts']: # the account have federated accounts (childs)

                featured_accounts = Account.objects.get_featured_accounts(self.account.id)
                response['account_id'] = [featured_account['id'] for featured_account in featured_accounts]

                # bypass para eliminar el error de sql ya que el método Account.objects.get_featured_accounts no trae nada
                response['account_id'] = response['federated_accounts']
                for index, f in enumerate(featured_accounts):
                    featured_accounts[index]['link'] = Account.objects.get(id=f['id']).get_preference('account.domain')
                response['featured_accounts'] = featured_accounts
            else:
                response['account_id'] = self.account.id

            response['categories'] = Category.objects.get_for_home(self.language, response['account_id'])

            return response
