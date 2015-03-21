# -*- coding: utf-8 -*-
from django import forms
from django.core.validators import validate_comma_separated_integer_list
from django.utils.translation import ugettext_lazy

class InitializeChartForm(forms.Form):
    datastream_revision_id = forms.IntegerField(label=ugettext_lazy( 'APP-DATASTREAMREVISION-TEXT' ), required=True)

class ViewChartForm(forms.Form):
    visualization_revision_id = forms.IntegerField(label=ugettext_lazy( 'APP-VISUALIZATIONREVISION-TEXT' ), required=True)
