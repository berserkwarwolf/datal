# -*- coding: utf-8 -*-
from django import forms
from django.core.urlresolvers import reverse
from django.core.validators import validate_comma_separated_integer_list as vil
from django.forms.formsets import formset_factory
from django.forms.util import ErrorDict

from core.choices import *
from workspace.common.forms import TagForm, SourceForm


class DeleteDataviewForm(forms.Form):
    revision_id = forms.CharField(required=True, validators=[vil])
    #TODO DOESN'T WORK. Always return 'false' and delete resources!
    #is_test = forms.BooleanField(required=False, initial='True')


class CreateDataStreamForm(forms.Form):
    dataset_revision_id = forms.IntegerField(label=ugettext_lazy( 'APP-DATASETREVISION-TEXT' ), required=True, widget = forms.HiddenInput)
    category = forms.IntegerField(label=ugettext_lazy( 'APP-CATEGORY-TEXT' ), required=True)
    data_source = forms.CharField(label=ugettext_lazy( 'APP-DATASOURCE-TEXT' ), required=True)
    select_statement = forms.CharField(label=ugettext_lazy( 'APP-SELECTSTATEMENT-TEXT' ), required=True)
    rdf_template = forms.CharField(label=ugettext_lazy( 'APP-RDFTEMPLATE-TEXT' ), required=False)
    status = forms.IntegerField(label=ugettext_lazy('APP-STATUS-TEXT'), required=False)
    title = forms.CharField(label=ugettext_lazy( 'APP-TITLE-TEXT' ), required=True)
    description = forms.CharField(label=ugettext_lazy( 'APP-DESCRIPTION-TEXT' ), required=True)
    meta_text = forms.CharField(label=ugettext_lazy( 'APP-METATEXT-TEXT' ), required=False)
    notes = forms.CharField(label=ugettext_lazy( 'APP-NOTES-TEXT' ), required=False)

    def __init__(self, data=None, *args, **kwargs):

        super(CreateDataStreamForm, self).__init__(data, *args)
        TagFormSet = formset_factory(TagForm)
        SourceFormSet = formset_factory(SourceForm)

        if not data:
            self.tag_formset = TagFormSet(prefix='tags')
            self.source_formset = SourceFormSet(prefix='sources')
        else:
            self.tag_formset = TagFormSet(data, prefix='tags')
            self.source_formset = SourceFormSet(data, prefix='sources')

    def is_valid(self):
        is_valid = super(CreateDataStreamForm, self).is_valid()
        is_valid = is_valid and self.tag_formset.is_valid()
        is_valid = is_valid and self.source_formset.is_valid()

        # Django does not allow to change form.errors, so we use form._errors
        if not is_valid:
            if self.tag_formset._errors or self.source_formset._errors:
                self._errors = dict(self._errors)

                for error in self.tag_formset._errors:
                    self._errors.update(dict(error))

                for error in self.source_formset._errors:
                    self._errors.update(dict(error))
                self._errors = ErrorDict(self._errors)
        else:
            self.cleaned_data['tags'] = [form.cleaned_data for form in self.tag_formset]
            self.cleaned_data['sources'] = [form.cleaned_data for form in self.source_formset]

        return is_valid


class EditDataStreamForm(forms.Form):
    datastream_revision_id = forms.IntegerField(required=True, widget = forms.HiddenInput)
    category = forms.IntegerField(label=ugettext_lazy( 'APP-CATEGORY-TEXT' ), required=False)
    data_source = forms.CharField(label=ugettext_lazy( 'APP-DATASOURCE-TEXT' ), required=False)
    select_statement = forms.CharField(label=ugettext_lazy( 'APP-SELECTSTATEMENT-TEXT' ), required=False)
    rdf_template = forms.CharField(label=ugettext_lazy( 'APP-RDFTEMPLATE-TEXT' ), required=False)
    status = forms.CharField(required=True)
    title = forms.CharField(label=ugettext_lazy( 'APP-TITLE-TEXT' ), required=False)
    description = forms.CharField(label=ugettext_lazy( 'APP-DESCRIPTION-TEXT' ), required=False)
    notes = forms.CharField(label=ugettext_lazy( 'APP-NOTES-TEXT' ), required=False)
    meta_text = forms.CharField(label=ugettext_lazy( 'APP-METATEXT-TEXT' ), required=False)
    is_test = forms.BooleanField(required=False) # evalueate impact or just doit?

    def __init__(self, data=None, *args, **kwargs):

        super(EditDataStreamForm, self).__init__(data, *args)
        TagFormSet = formset_factory(TagForm)
        SourceFormSet = formset_factory(SourceForm)

        if not data:
            self.tag_formset = TagFormSet(prefix='tags')
            self.source_formset = SourceFormSet(prefix='sources')
        else:
            self.tag_formset = TagFormSet(data, prefix='tags')
            self.source_formset = SourceFormSet(data, prefix='sources')

    def is_valid(self):
        is_valid = super(EditDataStreamForm, self).is_valid()
        is_valid = is_valid and self.tag_formset.is_valid()
        is_valid = is_valid and self.source_formset.is_valid()

        # Django does not allow to change form.errors, so we use form._errors
        if not is_valid:
            if self.tag_formset._errors or self.source_formset._errors:
                self._errors = dict(self._errors)

                for error in self.tag_formset._errors:
                    self._errors.update(dict(error))

                for error in self.source_formset._errors:
                    self._errors.update(dict(error))
                self._errors = ErrorDict(self._errors)
        else:
            self.cleaned_data['tags'] = [form.cleaned_data for form in self.tag_formset]
            self.cleaned_data['sources'] = [form.cleaned_data for form in self.source_formset]

        return is_valid


class ViewDataStreamForm(forms.Form):
    datastream_revision_id = forms.IntegerField(label=ugettext_lazy( 'APP-DATASTREAMREVISION-TEXT' ), required=True)


class UpdateDataStreamNoteForm(forms.Form):
    datastream_revision_id = forms.IntegerField(label=ugettext_lazy( 'APP-DATASTREAMREVISION-TEXT' ), required=True, widget = forms.HiddenInput)
    notes = forms.CharField(label=ugettext_lazy( 'APP-NOTES-TEXT' ), required=False, widget=forms.Textarea(attrs={'id':'id_notes', 'class': 'required', 'style' : 'width:620px;'}))

    def action(self):
        return reverse('datastream_manager.update_note')


class InitalizeCollectForm(forms.Form):
    dataset_revision_id = forms.IntegerField(label=ugettext_lazy('APP-DATASETREVISION-TEXT'), required=True)


class PreviewForm(forms.Form):
    end_point = forms.CharField(required=False)
    impl_type = forms.CharField(required=False)
    impl_details = forms.CharField(required=False)
    datasource = forms.CharField(required=False)
    select_statement = forms.CharField(required=False)
    rdf_template = forms.CharField(required=False)
    bucket_name = forms.CharField(required=False)
    limit = forms.IntegerField(required=False)
