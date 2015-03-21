from django import forms

class TopForm(forms.Form):
    max_results = forms.IntegerField(required=False, max_value=100, min_value=1)

    def clean_max_results(self):
        return self.cleaned_data['max_results'] or 5

class LastForm(forms.Form):
    max_results = forms.IntegerField(required=False, max_value=100, min_value=1)

    def clean_max_results(self):
        return self.cleaned_data['max_results'] or 5
