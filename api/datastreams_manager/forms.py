from django import forms
from django.conf import settings
from core.auth.auth import AuthManager
from django.core.validators import validate_comma_separated_integer_list as vil
# from django.utils.translation import ugettext_lazy
from core.choices import *

import json

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

OUTPUTS = (
    ('json', 'json')
    ,('prettyjson', 'prettyjson')
    ,('json_array', 'json_array')
    ,('csv', 'csv')
    ,('xls', 'xls')
    ,('html', 'html')
    ,('xml', 'xml')
    ,('', '')
)

class InvokeForm(forms.Form):
    invalid_choice_message = 'The output option is not valid, please use one of the following: %s.' % ', '.join([ tup[0] for tup in OUTPUTS if tup[0] ])
    output = forms.ChoiceField(required=False, choices=OUTPUTS, error_messages={'invalid_choice': invalid_choice_message})
    passticket = forms.CharField(required=False)
    page = forms.IntegerField(required=False)
    limit = forms.IntegerField(required=False)
    if_modified_since = forms.IntegerField(required=False)

    def clean_output(self):
        output = self.cleaned_data['output'].strip()
        if not output:
            return 'json'
        else:
            return output

    def get_error_description(self):
        error_description = ''
        for error in self.errors:
            error_description = error_description + "%s" % ("\n".join([ message for message in self.errors[error]]))
        return error_description

class PublishForm(forms.Form):
    title = forms.CharField(required=True, max_length=80)
    description = forms.CharField(required=False, max_length=140)
    guid = forms.CharField(required=False)
    tags = forms.CharField(required=False)
    notes = forms.CharField(required=False)
    source = forms.CharField(required=False)
    table_id = forms.CharField(required=True)
    category = forms.CharField(required=True)
    meta_data = forms.CharField(required=False)
    language = forms.CharField(required=False)
    file_data = forms.FileField(required=False)
    clone = forms.NullBooleanField(required=False)

    def clean_title(self):
        return self.cleaned_data['title'].strip()

    def clean_description(self):
        return self.cleaned_data['description'].strip()

    def clean_guid(self):
        return self.cleaned_data['guid'].strip()

    def clean_tags(self):
        return [ tag.strip() for tag in self.cleaned_data['tags'].split(',') if tag ]

    def clean_category(self):
        return self.cleaned_data['category'].strip()

    def clean_language(self):
        return self.cleaned_data['language'].strip()

    def clean_clone(self):
        return self.cleaned_data['clone']

    def clean_meta_data(self):
        meta_data = self.cleaned_data['meta_data'].strip()
        if not meta_data:
            return meta_data

        try:
            fields = json.loads(meta_data)
        except:
            return meta_data

        # dict to list of dicts
        field_values = [ {i: fields[i] } for i in fields ]

        return json.dumps( {"field_values": field_values} )

    def clean(self):
        cleaned_data = super(PublishForm, self).clean()
        source = cleaned_data.get("source")
        file_data = cleaned_data.get("file_data")

        if file_data == None and source == '':
            raise forms.ValidationError("source and file_data arguments must not be empty simultaneously.")

        # Always return the full collection of cleaned data.
        return cleaned_data

    def get_error_description(self):
        error_description = ''
        for error in self.errors:
            error_description = error_description + "%s: %s" % ( error, ("\n".join([ message for message in self.errors[error]])))
        return error_description


class TopForm(forms.Form):
    max_results = forms.IntegerField(required=False, max_value=100, min_value=1)

    def clean_max_results(self):
        return self.cleaned_data['max_results'] or 5

class LastForm(forms.Form):
    max_results = forms.IntegerField(required=False, max_value=100, min_value=1)

    def clean_max_results(self):
        return self.cleaned_data['max_results'] or 5

class DeleteDatasetForm(forms.Form):
    revision_id = forms.CharField(required=True, validators=[vil])


class CreateDatasetForm(forms.Form):
    title = forms.CharField(required=True, label=ugettext_lazy('APP-TITLE-TEXT'))
    category = forms.CharField(required=True, label=ugettext_lazy('APP-CATEGORY-TEXT'))
    description = forms.CharField(required=True, widget=forms.Textarea, label=ugettext_lazy('APP-DESCRIPTION-TEXT'))
    notes= forms.CharField(required=False, max_length=2048)
    dataset_type = forms.IntegerField(required=True) # choices=COLLECT_TYPE_CHOICES
    end_point = forms.CharField(required=False, max_length=2048) #url for file o web
    filename= forms.CharField(required=False, max_length=2048)
    impl_type = forms.ChoiceField(required=False, choices=SOURCE_IMPLEMENTATION_CHOICES, label=ugettext_lazy('MODEL_IMPLEMENTATION_TYPE_LABEL'))
    # now we automatically build impl_details
    #impl_details= forms.CharField(required=False)
    status= forms.ChoiceField(required=True)
    license_url= forms.CharField(required=False, max_length=2048)
    spatial= forms.CharField(required=False, max_length=2048)
    frequency= forms.CharField(required=False, max_length=2048)
    mbox= forms.CharField(required=False, max_length=90)

    def __init__(self, *args, **kwargs):
        if kwargs.get('status_options', False): # just for start form, not on finish
            status_options = kwargs.pop('status_options')
        else:
            status_options = STATUS_CHOICES
        super(CreateDatasetForm, self).__init__(*args, **kwargs)
        self.fields['status'] = forms.ChoiceField(required=True,choices=status_options)

    def get_error_description(self):
        error_description = ''
        c=1
        for error in self.errors:
            error_description = error_description + 'Error %d: %s -- %s' % (c, str(error), str(self.errors[error]))
            c=c+1
        return error_description

class CreateDatasetFileForm(CreateDatasetForm):

    title = forms.CharField(required=True, label=ugettext_lazy('APP-TITLE-TEXT'))
    category = forms.CharField(required=True, label=ugettext_lazy('APP-CATEGORY-TEXT'))
    description = forms.CharField(required=True, widget=forms.Textarea, label=ugettext_lazy('APP-DESCRIPTION-TEXT'))
    notes= forms.CharField(required=False, max_length=2048)
    dataset_type = forms.IntegerField(required=True) # choices=COLLECT_TYPE_CHOICES
    end_point = forms.CharField(required=False, max_length=2048) #url for file o web
    filename= forms.CharField(required=False, max_length=2048)
    impl_type = forms.ChoiceField(required=False, choices=SOURCE_IMPLEMENTATION_CHOICES, label=ugettext_lazy('MODEL_IMPLEMENTATION_TYPE_LABEL'))
    # now we automatically build impl_details
    #impl_details= forms.CharField(required=False)
    status= forms.CharField(required=True)
    license_url= forms.CharField(required=False, max_length=2048)
    spatial= forms.CharField(required=False, max_length=2048)
    frequency= forms.CharField(required=False, max_length=2048)
    mbox= forms.CharField(required=False, max_length=90)
    Filedata = forms.FileField(required=False, label=ugettext_lazy('APP-FILE-TEXT'))

    def get_error_description(self):
        error_description = str(self.fields)
        c=1
        for error in self.errors:
            error_description = error_description + 'Error %d: %s -- %s' % (c, str(error), str(self.errors[error]))
            c=c+1
        return error_description

class EditFileDataSetForm(CreateDatasetFileForm):
    revision_id = forms.IntegerField(required=True)
    status= forms.CharField(required=True)

class CreateDatasetURLForm(CreateDatasetForm):
    title = forms.CharField(required=True, label=ugettext_lazy('APP-TITLE-TEXT'))
    category = forms.CharField(required=True, label=ugettext_lazy('APP-CATEGORY-TEXT'))
    description = forms.CharField(required=True, widget=forms.Textarea, label=ugettext_lazy('APP-DESCRIPTION-TEXT'))
    notes= forms.CharField(required=False, max_length=2048)
    dataset_type = forms.IntegerField(required=True) # choices=COLLECT_TYPE_CHOICES
    end_point = forms.CharField(required=True, max_length=2048) #url for file o web
    filename= forms.CharField(required=False, max_length=2048)
    impl_type = forms.ChoiceField(required=False, choices=SOURCE_IMPLEMENTATION_CHOICES, label=ugettext_lazy('MODEL_IMPLEMENTATION_TYPE_LABEL'))
    # now we automatically build impl_details
    #impl_details= forms.CharField(required=False)
    status= forms.CharField(required=True)
    license_url= forms.CharField(required=False, max_length=2048)
    spatial= forms.CharField(required=False, max_length=2048)
    frequency= forms.CharField(required=False, max_length=2048)
    mbox= forms.CharField(required=False, max_length=90)
    pass

class EditURLDataSetForm(CreateDatasetURLForm):
    revision_id = forms.IntegerField(required=True)

class CreateDatasetWebserviceForm(CreateDatasetForm):
    path_to_headers = forms.CharField(required=False, label=ugettext_lazy('WORKSPACE-PATHTOHEADERS-TEXT'))
    path_to_data = forms.CharField(required=False, label=ugettext_lazy('WORKSPACE-PATHTODATA-TEXT'))
    method_name = forms.CharField(required=False, label=ugettext_lazy('WORKSPACE-METHODNAME-TEXT'))
    namespace = forms.CharField(required=False, label=ugettext_lazy('WORKSPACE-NAMESPACE-TEXT'))
    token = forms.CharField(required=False, label=ugettext_lazy('WORKSPACE-TOKEN-TEXT'))
    end_point = forms.CharField(required=True, max_length=2048) #url for file o web
    algorithm = forms.CharField(required=False, label=ugettext_lazy('WORKSPACE-ALGORITHM-TEXT'))
    signature = forms.CharField(required=False, label=ugettext_lazy('WORKSPACE-SIGNATURE-TEXT'))
    enable_use_cache = forms.BooleanField(label=ugettext_lazy('APP-CACHE-TEXT'), required=False)
    username = forms.CharField(required=False)
    password = forms.CharField(required=False)

    def get_error_description(self):
        error_description = ''
        c=1
        for error in self.errors:
            error_description = error_description + 'Error %d: %s -- %s' % (c, str(error), str(self.errors[error]))
            c=c+1
        return error_description