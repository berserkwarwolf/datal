from django.db.models import Q
from core import helpers as CoreHelper
from core.models import Preference
from core.choices import SourceImplementationChoices, SOURCE_IMPLEMENTATION_CHOICES

def add_domains_to_permalinks(resources):

    accounts_ids = [ item['account_id'] for item in resources ]
    accounts_ids = CoreHelper.uniquify(accounts_ids)
    accounts_domains = Preference.objects.values_list('account_id', 'value', 'key').filter(Q(key='account.domain') | Q(key='account.name'), account__in = accounts_ids)

    r = {}
    for account_id, value, key in accounts_domains:
        if r.has_key(account_id):
            r[account_id][key] = value
        else:
            r[account_id] = {key: value}

    for resource in resources:
        account_id = resource['account_id']
        if r.has_key(account_id):
            account_domain = r[account_id]['account.domain']
            resource['permalink'] = 'http://' + account_domain + resource['permalink']
            resource['account_name'] = r[account_id]['account.name']


def set_dataset_impl_type_nice(item):
    impl_type_nice = unicode(SOURCE_IMPLEMENTATION_CHOICES[int(item)][1])
    return impl_type_nice