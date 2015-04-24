from django import forms
from django.utils.translation import ugettext_lazy


class TagForm(forms.Form):

    # name
    name = forms.CharField(
        required=False,
        label=ugettext_lazy('APP-NAME-TEXT'),
        widget=forms.TextInput()
    )


class SourceForm(forms.Form):

    # name
    name = forms.CharField(
        required=False,
        label=ugettext_lazy('APP-NAME-TEXT'),
        widget=forms.TextInput()
    )

    # url
    url = forms.URLField(
        required=False,
        label=ugettext_lazy('APP-URL-TEXT'),
        widget=forms.URLInput()
    )