from django import forms
from django.core.validators import validate_comma_separated_integer_list as vil
from junar.core.helpers import validate_comma_separated_word_list as vwl
import json

class HomeForm(forms.Form):
    resources = forms.CharField(required=True)
    categories_names = forms.CharField(required=True)

    def clean_resources(self):
        try:
            return json.loads(self.cleaned_data.get('resources'))
        except ValueError:
            raise forms.ValidationError("The field must be JSON")

    def clean_categories_names(self):
        try: 
            return json.loads(self.cleaned_data.get('categories_names'))
        except ValueError:
            raise forms.ValidationError("The field must be JSON")

class QueryDatasetForm(forms.Form):
    all = forms.BooleanField(required=False)
    mine = forms.BooleanField(required=False)
    type = forms.CharField(required=False, validators=[vwl])
    entity_filters = forms.CharField(required=False)
    type_filters = forms.CharField(required=False)
    category_filters = forms.CharField(required=False)
    source_choice_filters = forms.CharField(required=False, validators=[vil])
    page = forms.IntegerField(required=False)
    items_per_page = forms.IntegerField(required=False)
    order = forms.CharField(required=False)
    order_type = forms.CharField(required=False)
    search = forms.CharField(required=False)
