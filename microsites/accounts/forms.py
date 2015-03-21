from django import forms
from django.core.urlresolvers import reverse
from junar.core.models import User
import hashlib

class SignInForm(forms.Form):
    username       = forms.CharField(required=True)
    password       = forms.CharField(required=True, widget=forms.PasswordInput(render_value=False))
    next           = forms.CharField(required=False, widget=forms.HiddenInput())

    def action(self):
        return reverse('accounts.login')

    def clean_password(self):
        return hashlib.md5(self.cleaned_data.get('password')).hexdigest()


    def clean(self):
        cleaned_data = super(SignInForm, self).clean()
        username = cleaned_data.get("username")
        password = cleaned_data.get("password")
        try:
            self.user = User.objects.get(nick = username)
        except User.DoesNotExist:
            raise forms.ValidationError("User does not exist")
        if self.user.password != password:
            raise forms.ValidationError("Invalid data")

        return cleaned_data

class ActivateUserForm(forms.Form):
    ticket         = forms.CharField(required=True, widget=forms.HiddenInput())
    password       = forms.CharField(required=True, widget=forms.PasswordInput(render_value=False))
    password_again = forms.CharField(required=True, widget=forms.PasswordInput(render_value=False))

    def clean_password(self):
        return hashlib.md5(self.cleaned_data.get('password')).hexdigest()

    def clean_password_again(self):
        return hashlib.md5(self.cleaned_data.get('password_again')).hexdigest()

    def clean(self):
        cleaned_data = super(ActivateUserForm, self).clean()

        password = cleaned_data.get("password")
        password_again = cleaned_data.get("password_again")
        if password != password_again:
            raise forms.ValidationError(ugettext_lazy('APP-PASSWORD-MUST-MATCH'))

        return cleaned_data

    def action(self):
        return reverse('accounts.activate')
