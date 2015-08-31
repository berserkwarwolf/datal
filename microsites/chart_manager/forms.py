from django import forms

class RequestForm(forms.Form):
    visualization_revision_id = forms.IntegerField(required=True)
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