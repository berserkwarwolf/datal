from django import forms

class BaseResourcesForm(forms.Form):
    cleanable_data = [('page', 1), ('limit', 10)]

    page  = forms.IntegerField(required = False)
    limit = forms.IntegerField(required = False)

    def cleaned_data_dict(self):
        d = dict()
        for i in self.cleanable_data:
            # there are tuples with default values
            if isinstance(i, tuple) and len(i) > 1:
                key = i[0]
                default = i[1]
            else:
                key = i
                default = None

            value = self.cleaned_data[key] or default
            d.update({key: value})
        return d

class SearchForm(BaseResourcesForm):
    cleanable_data = BaseResourcesForm.cleanable_data + [('meta', '{}'), 'q', 'resource']

    meta  = forms.CharField(required = False)
    q = forms.CharField(required = False)
    resource = forms.CharField(required = False)

class ExploreForm(BaseResourcesForm):
    cleanable_data = BaseResourcesForm.cleanable_data + [('meta', '{}'), 'q']
    meta  = forms.CharField(required = False)
    q = forms.CharField(required = False)