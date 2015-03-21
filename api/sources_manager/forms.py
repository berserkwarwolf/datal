from django import forms

class AWSKeyForm(forms.Form):
    key = forms.CharField(required=True)