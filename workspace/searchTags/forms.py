from django import forms


class TagSearchForm(forms.Form):
    term = forms.CharField(required=True)
