from django import forms

class LinkedinForm(forms.Form):
    url = forms.CharField(label='Url', required=True)
    data_counter = forms.CharField(label='data-counter', required=False)

    def clean_data_counter(self):
        if not self.cleaned_data['data_counter']:
            return 'right'
        else:
            return self.cleaned_data['data_counter']