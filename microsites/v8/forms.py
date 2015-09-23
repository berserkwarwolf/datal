# -*- coding: utf-8 -*-

from core.v8.forms import RequestForm

class VisualizationRequestForm(RequestForm):
    bounds = forms.CharField(required=False)
    zoom = forms.IntegerField(required=False)

