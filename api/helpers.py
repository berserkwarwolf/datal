from core.models import Preference, User
from core.helpers import get_domain_with_protocol


def get_domain(account_id):
    """
    get the account.domain preference by account_id
    """
    try:
        account_domain = Preference.objects.values('value').get(key='account.domain', account = account_id)['value']
        account_domain = 'http://' + account_domain
    except Preference.DoesNotExist:
        account_domain = get_domain_with_protocol('microsites')
    return account_domain


def get_api_domain(account_id):
    """
    get the account.api.domain preference by account_id
    """
    try:
        account_domain = Preference.objects.values('value').get(key='account.api.domain', account = account_id)['value']
        account_domain = 'http://' + account_domain
    except Preference.DoesNotExist:
        account_domain = get_domain_with_protocol('api')
    return account_domain


def get_transparency_domain(account_id):
    """
    get the account.transparency.domain preference by account_id
    """
    try:
        account_domain = Preference.objects.values('value').get(
            key='account.transparency.domain',
            account=account_id
        )['value']
        account_domain = 'http://' + account_domain
    except Preference.DoesNotExist:
        account_domain = get_domain_with_protocol('microsites')
    return account_domain


def add_domain_to_datastream_link(datastream):
    account_domain = get_domain(datastream.account_id)
    datastream['link'] = account_domain + datastream['link']
