from django import forms

class RequestForm(forms.Form):
    visualization_revision_id = forms.IntegerField(required=True)
    limit = forms.IntegerField(required=False)
    page = forms.IntegerField(required=False)
    bounds = forms.CharField(required=False)
    zoom = forms.IntegerField(required=False)