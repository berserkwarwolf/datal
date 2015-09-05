# -*- coding: utf-8 -*-
from django import forms
from django.utils.translation import ugettext_lazy, ugettext

from core.lifecycle.visualizations import VisualizationLifeCycleManager
from core.choices import VISUALIZATION_LIBS

VISUALIZATION_TYPES = (
    ('columnchart', 'columnchart'),
    ('barchart', 'barchart'),
    ('linechart', 'linechart'),
    ('piechart', 'piechart'),
    ('areachart', 'areachart'),
    ('mapchart', 'mapchart')
)

VISUALIZATION_TEMPLATES = (
    ('basicchart', 'basicchart'),
    ('piechart', 'piechart'),
    ('mapchart', 'mapchart'),
    ('geochart', 'geochart')
)

BOOLEAN_FIELD = (
    ('true', 'true'),
    ('false', 'false')
)

INCLUDE_EXCLUDE = (
    ('include', 'include'),
    ('exclude', 'exclude')
)


class VisualizationForm(forms.Form):
    title = forms.CharField(max_length=80, label=u'Title', required=True)
    description = forms.CharField(max_length=140, required=False, label=u'Description')
    notes = forms.CharField(required=False, label=u'Note')
    type = forms.ChoiceField(required=True, choices=VISUALIZATION_TYPES)
    chartTemplate = forms.ChoiceField(required=True, choices=VISUALIZATION_TEMPLATES)
    showLegend = forms.ChoiceField(required=False, choices=BOOLEAN_FIELD)
    nullValueAction = forms.ChoiceField(required=False, choices=INCLUDE_EXCLUDE)
    nullValuePreset = forms.CharField(required=False, max_length=200)
    range_data = forms.CharField(max_length=300, required=True)
    xTitle = forms.CharField(required=False, max_length=200)
    yTitle = forms.CharField(required=False, max_length=200)
    labelSelection = forms.CharField(required=False, max_length=200)
    headerSelection = forms.CharField(required=False, max_length=200)
    lib = forms.ChoiceField(required=True, choices=VISUALIZATION_LIBS)
    # pInvertData ?
    # lib?
    # pInvertedAxis
    # pCorrelative

    def save(self, request, revision):
        lifecycle = VisualizationLifeCycleManager(user=request.user)
        visualization_rev = lifecycle.create(revision, language=request.user.language,  **self.cleaned_data)

        return dict(
            status='ok',
            revision_id=visualization_rev.id,
            messages=[ugettext('APP-VISUALIZATION-CREATEDSUCCESSFULLY-TEXT')]
        )


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
