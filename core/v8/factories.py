# -*- coding: utf-8 -*-

import re

from django import forms
from django.forms.formsets import BaseFormSet
from core.primitives import PrimitiveComputer
from core.v8.commands import *


class EngineCommandFactory(object):
    def fix_params(self, filters):
        """ fix filters and other params """
       
        new=[]
        for item in filters:
            if item[0].startswith('pFilter'):
                v1 = item[1]
                new.append((item[0],self.parseOperator(value=v1)))
            if item[0].startswith('uniqueBy'):
                num = key[-1:]
                filters['pUniqueBy%s' % num] = item[1]
                
        return filters

    def parseOperator(self, value):
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

    def process_items(self, items):
        post_query=[]
        for item in items:
            if item[0].startswith('pArgument') or item[0].startswith('pFilter'):
                value = item[1]
                post_query.append((item[0],value.encode('utf-8')))

            # filtra los parametros vacios
            elif item[1]:
                post_query.append(item)

        return self.fix_params(post_query)

    def create(self, command_type, items):
        engine = None
        if command_type == 'invoke':
            engine = EngineInvokeCommand(self.process_items(items))
        elif command_type == 'load':
            engine = EngineLoadCommand(self.process_items(items))
        elif command_type == 'preview':
            engine = EnginePreviewCommand(self.process_items(items))
        elif command_type == 'chart':
            engine = EngineChartCommand(self.process_items(items))
        elif command_type == 'preview_chart':
            engine = EnginePreviewChartCommand(self.process_items(items))
        return engine

class AbstractCommandFactory(object):
    def create(self):
        return EngineCommandFactory()
