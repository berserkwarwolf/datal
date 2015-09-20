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
    page=forms.IntegerField(required=False)
    limit=forms.IntegerField(required=False)
    output=forms.CharField(max_length=100, required=False)

    #def clean(self):
    #    cleaned_data = super(DatastreamRequestForm, self).clean()

        # TODO: define default values on settings.py
    #    if not cleaned_data['page']:
    #        cleaned_data['page'] = 0
    #    if not cleaned_data['limit']:
    #        cleaned_data['limit'] = 50
    #    return cleaned_data


class InvokeFormSet(BaseFormSet):
    is_argument=re.compile("(?P<argument>\D+)(?P<order>\d+)").match
    is_id=re.compile("(?P<doc_type>\S+)_id$").match


    def __init__(self, *args, **kwargs):
        new_args=[]
        for i,j in enumerate(args):
            aux=dict(j)
            aux.update({'form-TOTAL_FORMS': u'1', 'form-INITIAL_FORMS': u'0','form-MAX_NUM_FORMS': u''})
            new_args.append(aux)

        self._defaults=kwargs.get("default",[])

        super(InvokeFormSet, self).__init__(*new_args)

    def _update_defaults(self):

        for arg in self._defaults:
            key="pArgument%s" % arg["position"]
            value = self.data.get(key,None)

            if value in (None, ""):
                self.data[key]=arg["default"]
                
    def clean(self):

        #self.data = dict(self.data)
        #self.data.update({'form-TOTAL_FORMS': u'1', 'form-INITIAL_FORMS': u'0','form-MAX_NUM_FORMS': u''})

        if any(self.errors):
            return

        # aplicamos los valores defaults
        self._update_defaults()

        self.forms=[]
        for key in self.data.keys():
            match=self.is_argument(key)

            # si es pAlgoNN
            if match:
                try:
                    f=ArgumentForm({"argument": key, 'value': PrimitiveComputer().compute(self.data[key])})
                    if f.is_valid():
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
                    self.forms.append(f)
                else:
                    raise forms.ValidationError(u"id (%s/%s) no válido" % (int(self.data[key]),match.group("doc_type")), code="id_not_valid")
                continue

        # faltaría meter un form generico que tome un arumento y un valor para el resto de los argumentos
        # y quitar este de acá abajo
        f=DatastreamRequestForm(self.data)
        if f.is_valid():
            self.forms.append(f)

    def _get_doc_dict(self, doc_type):
        if doc_type in ["datastream_revision", "datastream"]:
            return "ds"
        elif doc_type in ["visualization_revision","visualization"]: 
            return "vz"
