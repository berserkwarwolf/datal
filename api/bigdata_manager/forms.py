from django import forms


class MintForm(forms.Form):
    end_point = forms.URLField(required=False) #we always need but if it's empty we use the database template

    def get_error_description(self):
        error_description = ''
        for error in self.errors:
            error_description = error_description + "%s" % ("\n".join([ message for message in self.errors[error]]))
        return error_description