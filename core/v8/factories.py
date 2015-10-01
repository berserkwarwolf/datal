# -*- coding: utf-8 -*-

import re

from django import forms
from django.forms.formsets import BaseFormSet
from core.primitives import PrimitiveComputer
from core.v8.commands import *

class CommandFactory(object):
    """Factory de comandos"""

    CONV_DICT={
        "page": "pPage",
        "limit": "pLimit",
        "id": "pId",
        "revision_id": "pId",
        "uniqueBy": "pUniqueBy",
        "orderBy": "pOrderBy",
        "output": "pOutput",
        'data':'pData',
        'headerSelection':'pHeaderSelection',
        'labelSelection':'pLabelSelection',
        'type':'pType',
        'invertData':'pInvertData',
        'invertedAxis':'pInvertedAxis',
        'nullValueAction':'pNullValueAction',
        'nullValuePreset':'pNullValuePreset',
        'zoom':'pZoom',
        'bounds':'pBounds',
        'traces':'pTraceSelection',
        'lat':'pLatitudSelection',
        'lon':'pLongitudSelection',
        'whereExpr':'pWhereExpr',
        'ifModified':'pIfModified',
        'format':'pTableFormat',

        'end_point':'pEndPoint',
        'datasource':'pDataSource',
        'select_statement':'pSelectStatement',
        'impl_details':'pImplDetails',
        'impl_type':'pImplType',
        'bucket_name':'pBucketName',
    }

    def __init__(self, resourse_type):
        self.resourse_type = resourse_type

    def _fix_params(self, filters):
        """ fix filters and other params """
       
        new=[]
        for item in filters:
            print item
            if item[0] in self.CONV_DICT:
                new.append( (self.CONV_DICT[item[0]], item[1]) )
            elif item[0].startswith('pFilter'):
                v1 = item[1]
                new.append((item[0],self._parseOperator(value=v1)))
            elif item[0].startswith('uniqueBy'):
                #>>>>> estas dos lineas de donde sale?
                num = key[-1:]
                filters['pUniqueBy%s' % num] = item[1]
                # <<<<<

                new.append( ('pUniqueBy%s' % num, item[1]) )
            else:
                new.append(item)

        return new

    def _parseOperator(self, value):
        """deja los operadores como lo espera el engine"""

        value = value.replace('[==]', '[0]')
        value = value.replace('[>]', '[1]')
        value = value.replace('[<]', '[2]')
        value = value.replace('[!=]', '[3]')
        value = value.replace('[contains]', '[4]')
        value = value.replace('[>=]', '[5]')
        value = value.replace('[<=]', '[6]')
        value = value.replace('[between]', '[7]')
        value = value.replace('[inlist]', '[8]')
        value = value.replace('[notcontains]', '[9]')
        value = value.replace('[notcontainsall]', '[9]')
        value = value.replace('[notbetween]', '[10]')
        value = value.replace('[notinlist]', '[11]')
        value = value.replace('[notcontainsany]', '[12]')
        value = value.replace('[containsall]', '[13]')
                
        return value

    def _process_items(self, items):
        post_query=[]
        for item in items:
            if "argument" in item.keys():
                post_query.append((item['argument'],item['value'].encode('utf-8')))
            else:
                for i in item.keys():
                    # filtra los parametros vacios
                    if item[i]:
                        post_query.append((i, item[i]))
    

        return self._fix_params(post_query)

class LoadCommandFactory(CommandFactory):
    def create(self, items):
        if self.resourse_type == 'dt':
            return EngineLoadCommand(self._process_items(items))

class PreviewCommandFactory(CommandFactory):
    def create(self, items):
        if self.resourse_type == 'ds':
            return EnginePreviewCommand(self._process_items(items))
        elif self.resourse_type == 'vz':
            return EnginePreviewChartCommand(self._process_items(items))
        
class InvokeCommandFactory(CommandFactory):
    def create(self, items):
        if self.resourse_type == 'ds':
            return EngineInvokeCommand(self._process_items(items))
        elif self.resourse_type == 'vz':
            return EngineChartCommand(self._process_items(items))

class AbstractCommandFactory(object):
    def create(self, command_type, resourse_type, data={}):
        engine = None
        if command_type == 'invoke':
            engine = InvokeCommandFactory(resourse_type).create(data)
        elif command_type == 'load':
            engine = LoadCommandFactory(resourse_type).create(data)
        elif command_type == 'preview':
            engine = PreviewCommandFactory(resourse_type).create(data)
        return engine
