# -*- coding: utf-8 -*-

import re

from django import forms
from django.forms.formsets import BaseFormSet
from core.primitives import PrimitiveComputer
from core.v8.commands import *

class ArgumentForm(forms.Form):
    argument=forms.CharField(max_length=16, widget=forms.TextInput(), required=True)
    value=forms.CharField(max_length=100, widget=forms.TextInput(), required=True)

class DocumentForm(forms.Form):
    pId=forms.IntegerField(required=True)
    doc_type=forms.CharField(max_length=2, required=True)

class DatastreamRequestForm(forms.Form):
    page=forms.IntegerField(required=True)
    limit=forms.IntegerField(required=True)
    output=forms.CharField(max_length=100, required=False)


class InvokeFormSet(BaseFormSet):
    is_argument=re.compile("(?P<argument>\D+)(?P<order>\d+)").match
    is_id=re.compile("(?P<doc_type>\S+)_id$").match

    data_items=[]

    def __init__(self, *args, **kwargs):
        new_args=[]
        for i,j in enumerate(args):
            aux=dict(j)
            aux.update({'form-TOTAL_FORMS': u'1', 'form-INITIAL_FORMS': u'0','form-MAX_NUM_FORMS': u''})
            new_args.append(aux)
        super(InvokeFormSet, self).__init__(*new_args, **kwargs)

    def get_data(self):
        return self.data_items

    def clean(self):

        #self.data = dict(self.data)
        #self.data.update({'form-TOTAL_FORMS': u'1', 'form-INITIAL_FORMS': u'0','form-MAX_NUM_FORMS': u''})

        if any(self.errors):
            return

        self.forms=[]
        for key in self.data.keys():
            match=self.is_argument(key)

            # si es pAlgoNN
            if match:
                try:
                    f=ArgumentForm({"argument": key, 'value': PrimitiveComputer().compute(self.data[key])})
                    if f.is_valid():
                        self.data_items.append( (f.cleaned_data['argument'],f.cleaned_data['value']) )
                        self.forms.append(f)
                    else:
                        self.errors.append({'value': [u"argumento no válido"]})
                        raise forms.ValidationError(u"argumento no válido", code="argument_not_valid")
                except TypeError:
                    self.errors.append({'value': [u"expected string or buffer"]})
                    raise forms.ValidationError(u"expected string or buffer", code="typeerror")
                
                #no me gusta, debería tener un map y un filter, refactorear vago!
                continue

            # Si es el pk
            match=self.is_id(key)
            if match:
                f=DocumentForm({"pId": int(self.data[key]), "doc_type": self._get_doc_dict(match.group("doc_type"))})
                if f.is_valid():
                    self.data_items.append( ("pId",f.cleaned_data['pId']))
                    self.data_items.append( ("doc_type",f.cleaned_data['doc_type']))
                    self.forms.append(f)
                else:
                    raise forms.ValidationError(u"id (%s/%s) no válido" % (int(self.data[key]),match.group("doc_type")), code="id_not_valid")
                continue

        # faltaría meter un form generico que tome un arumento y un valor para el resto de los argumentos
        # y quitar este de acá abajo
        f=DatastreamRequestForm(self.data)
        if f.is_valid():
            self.data_items.append( ("pLimit",f.cleaned_data['limit']))
            self.data_items.append( ("pPage",f.cleaned_data['page']))
            self.data_items.append( ("pOutput",f.cleaned_data['output']))
            self.forms.append(f)

    def _get_doc_dict(self, doc_type):
        if doc_type in ["datastream_revision", "datastream"]:
            return "ds"
        elif doc_type in ["visualization_revision","visualization"]: 
            return "vz"