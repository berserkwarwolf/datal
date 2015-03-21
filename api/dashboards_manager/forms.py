from django import forms
from django.conf import settings

class SearchForm(forms.Form):
    query       = forms.CharField(required=True)
    max_results = forms.IntegerField(required=False, max_value=100, min_value=1)

    def clean_max_results(self):
        l_default_max_results = settings.DEFAULT_SEARCH_MAX_RESULTS
        try:
            max_results = int(self.cleaned_data['max_results'])
            return max_results <= l_default_max_results and max_results or l_default_max_results
        except:
            return l_default_max_results

class LastForm(forms.Form):
    max_results = forms.IntegerField(required=False, max_value=100, min_value=1)

    def clean_max_results(self):
        return self.cleaned_data['max_results'] or 5