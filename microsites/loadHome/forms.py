from django import forms
from django.core.validators import validate_comma_separated_integer_list as vil
from junar.core.helpers import validate_comma_separated_word_list as vwl

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
