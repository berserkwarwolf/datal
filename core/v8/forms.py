# -*- coding: utf-8 -*-

import re

from django import forms
from django.forms.formsets import BaseFormSet
from core.primitives import PrimitiveComputer
from core.v8.commands import *

class ArgumentForm(forms.Form):
    name=forms.CharField(max_length=16, widget=forms.TextInput(), required=True)
    value=forms.CharField(max_length=100, widget=forms.TextInput(), required=True)

class RequestForm(forms.Form):
    revision_id = forms.IntegerField(required=True)
    page = forms.IntegerField(required=False)
    limit = forms.IntegerField(required=False)
    output=forms.CharField(max_length=100, required=False)
    passticket = forms.CharField(required=False)
    if_modified_since = forms.IntegerField(required=False)
    ttl = forms.IntegerField(required=False)

class RequestFormSet(BaseFormSet):
    _is_argument=re.compile("(?P<argument>\D+)(?P<order>\d+)").match


    def __init__(self, *args, **kwargs):
        new_args=[]
        for i,j in enumerate(args):
            aux=dict(j)

            for key in aux.keys():
                aux['form-0-%s' % key]=aux[key]
            aux.update({'form-TOTAL_FORMS': u'1', 'form-INITIAL_FORMS': u'0','form-MAX_NUM_FORMS': u''})
            new_args.append(aux)

        self._defaults=kwargs.get("default",[])

        super(RequestFormSet, self).__init__(*new_args)

    def _update_defaults(self):

        for arg in self._defaults:
            key="pArgument%s" % arg["position"]
            value = self.data.get(key,None)

            if value in (None, ""):
                self.data[key]=arg["default"]
                
    def clean(self):

        if any(self.errors):
            return

        # aplicamos los valores defaults
        self._update_defaults()

        #self.forms=[]
        for key in self.data.keys():
            # evitamos los form-algo
            if key[0:4] == "form":
                continue

            match=self._is_argument(key)

            # si es AlgoNN
            if match:
                try:

                    f=ArgumentForm({"name": key, 'value': PrimitiveComputer().compute(self.data[key])})
                    if f.is_valid():
                        self.forms.append(f)
                    else:
                        self.errors.append({key: [u"argumento no válido (%s)", self.data[key]]})
                        raise forms.ValidationError(u"argumento no válido", code="argument_not_valid")
                except TypeError,e:
                    self.errors.append({'value': [u"expected string or buffer (%s)" % e]})
                    raise forms.ValidationError(u"expected string or buffer", code="typeerror")
                
                #no me gusta, debería tener un map y un filter, refactorear vago!
                continue

    def _get_doc_dict(self, doc_type):
        if doc_type in ["datastream_revision", "datastream"]:
            return "ds"
        elif doc_type in ["visualization_revision","visualization"]: 
            return "vz"
        elif doc_type in ["dataset_revision","dataset"]: 
            return "ds"

    def _serialize_data(self, l):
        self.cleaned_data_plain.update({l['name']: l['value']})

    def get_cleaned_data_plain(self):
        """Serializa el cleaned_data para el motor"""

        if self.cleaned_data:
            self.cleaned_data_plain = self.cleaned_data[0]
            map(self._serialize_data, self.cleaned_data[1:])
            
            return self.cleaned_data_plain
            
        return {}
            
