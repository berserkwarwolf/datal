# -*- coding: utf-8 -*-

from django import forms
from core.choices import VISUALIZATION_TYPES
from core.v8.forms import RequestForm


class DatastreamRequestForm(RequestForm):
    tableid = forms.CharField(required=False)
    #datastream_revision_id = forms.IntegerField(required=True)

# es el único que no hereda del RequestForm
class DatastreamPreviewForm(forms.Form):
    end_point = forms.CharField(required=False)
    impl_type = forms.CharField(required=False)
    impl_details = forms.CharField(required=False)
    datasource = forms.CharField(required=False)
    select_statement = forms.CharField(required=False)
    rdf_template = forms.CharField(required=False)
    bucket_name = forms.CharField(required=False)
    limit = forms.IntegerField(required=False)


class VisualizationRequestForm(RequestForm):
    bounds = forms.CharField(required=False)
    zoom = forms.IntegerField(required=False)


class VisualizationPreviewForm(VisualizationRequestForm):
    type = forms.ChoiceField(required=True, choices=VISUALIZATION_TYPES)
    nullValueAction = forms.CharField(required=True)
    nullValuePreset = forms.CharField(required=False)
    invertData = forms.CharField(required=False)
    invertedAxis = forms.CharField(required=False)
    data = forms.CharField(required=True)
    labels = forms.CharField(required=False)
    headers = forms.CharField(required=False)
    lat = forms.CharField(required=False)
    lon = forms.CharField(required=False)
    traces = forms.CharField(required=False)


class VisualizationPreviewMapForm(VisualizationRequestForm):
    nullValueAction = forms.CharField(required=True)
    nullValuePreset = forms.CharField(required=False)

    data = forms.CharField(required=True)
    lat = forms.CharField(required=True)
    lon = forms.CharField(required=True)

    headers = forms.CharField(required=False)
    traces = forms.CharField(required=False)
