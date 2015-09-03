# -*- coding: utf-8 -*-

import re

from django import forms
from django.forms.formsets import BaseFormSet
from core.primitives import PrimitiveComputer

class ArgumentForm(forms.Form):
    argument=forms.CharField(max_length=16, widget=forms.TextInput(), required=True)
    value=forms.CharField(max_length=100, widget=forms.TextInput(), required=True)

class DatastreamRequestForm(forms.Form):
    page=forms.IntegerField(required=True)
    limit=forms.IntegerField(required=True)
    datastream_revision_id=forms.IntegerField(required=True)
    output=forms.CharField(max_length=100, required=False)


class InvokeFormSet(BaseFormSet):
    is_argument=re.compile("(?P<argument>\D+)(?P<order>\d+)").match

    def clean(self):

        self.data.update({'form-TOTAL_FORMS': u'1', 'form-INITIAL_FORMS': u'0','form-MAX_NUM_FORMS': u''})

        if any(self.errors):
            return

        self.forms=[]
        for key in self.data.keys():
            match=self.is_argument(key)

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

        f=DatastreamRequestForm(self.data)
        if f.is_valid():
            self.forms.append(f)
