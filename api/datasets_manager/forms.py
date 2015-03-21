from django import forms

class RefreshForm(forms.Form):
    dataset_id = forms.IntegerField(required=False)
    end_point = forms.CharField(required=False)

    def clean(self):
        cleaned_data = super(RefreshForm, self).clean()
        dataset_id = cleaned_data.get("dataset_id")
        end_point = cleaned_data.get("end_point")

        if not dataset_id and not end_point:
            raise forms.ValidationError("dataset_id or end_point must be sent")

        return cleaned_data
