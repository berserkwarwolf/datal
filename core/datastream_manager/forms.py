from django import forms


class LegacyEmbedForm(forms.Form):
    dataservice_id = forms.IntegerField(required=True)
    end_point = forms.CharField(required=False)
    header_row = forms.IntegerField(required=False)
    fixed_column = forms.IntegerField(required=False)

class RequestForm(forms.Form):
    datastream_revision_id = forms.IntegerField(required=True)
    limit = forms.IntegerField(required=False)
