# -*- coding: utf-8 -*-
from django import forms
from django.core.validators import validate_comma_separated_integer_list
from django.utils.translation import ugettext_lazy


class VisualizationForm(forms.Form):
    title = forms.CharField(max_length=80, label=u'Title', required=True)
    description = forms.CharField(max_length=140, required=False, label=u'Description')
    notes = forms.CharField(required=False, label=u'Note')


class InitializeChartForm(forms.Form):
    datastream_revision_id = forms.IntegerField(label=ugettext_lazy( 'APP-DATASTREAMREVISION-TEXT' ), required=True)


class ViewChartForm(forms.Form):
    visualization_revision_id = forms.IntegerField(label=ugettext_lazy( 'APP-VISUALIZATIONREVISION-TEXT' ), required=True)


class RequestForm(forms.Form):
    visualization_revision_id = forms.IntegerField(required=False)
    limit = forms.IntegerField(required=False)
    page = forms.IntegerField(required=False)
    bounds = forms.CharField(required=False)
    zoom = forms.IntegerField(required=False)


class PreviewForm(RequestForm):
    null_action = forms.CharField(required=True)
    null_preset = forms.CharField(required=True)
    data = forms.CharField(required=True)
    labels = forms.CharField(required=False)
    headers = forms.CharField(required=False)
    lat = forms.CharField(required=False)
    long = forms.CharField(required=False)
    traces = forms.CharField(required=False)
