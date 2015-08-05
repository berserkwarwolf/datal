from django import forms
from django.conf import settings

class SearchForm(forms.Form):
    q = forms.RegexField(label='Query', max_length=512, required=False, regex = r'[a-zA-Z0-9]+|%')
    page = forms.IntegerField(label='Page', required=False)
    tag = forms.RegexField(label='Tag', required=False, regex = r'[a-zA-Z0-9]+')
    order = forms.RegexField(label='Order', required=False, regex = r'[a-zA-Z0-9]+')

    def clean_page(self):
        # default page
        page = self.cleaned_data['page']
        if not page:
            return 1
        page = abs(page)
        if page > settings.SEARCH_MAX_RESULTS / settings.PAGINATION_RESULTS_PER_PAGE:
            raise forms.ValidationError("Max page number")
        return page

    def clean_q(self):
        return self.cleaned_data['q'].strip()

    def clean_tag(self):
        return self.cleaned_data['tag'].strip()

    def clean_order(self):
        return self.cleaned_data['order'].strip()

    def get_query(self):
        query = self.cleaned_data['q'].replace('#', '')
        query = query and query or self.cleaned_data['tag']

        # your code is now here
        if not query:
            query = u'%'

        return query
