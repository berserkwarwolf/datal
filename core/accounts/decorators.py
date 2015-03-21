from django.http import HttpResponse
from junar.core.models  import Dataset, Threshold, User
from django.utils.translation import ugettext
import json
from functools import wraps

def threshold(code):
    def decorator(func):
        def inner_decorator(request, *args, **kwargs):
            if code == 'workspace.create_dataset_limit':
                response = calculate_dataset_limit(request, code)
            
            if code == 'workspace.create_user_limit':
                response = calculate_user_limit(request, code)

            if response == '':
                return func(request, *args, **kwargs)
            else:
                return HttpResponse(json.dumps(response), mimetype='application/json', status=400)

        return wraps(func)(inner_decorator)

    return decorator

def calculate_dataset_limit(request, code):
    account_id = request.auth_manager.account_id
    datasets_count = Dataset.objects.filter(user__account__id=account_id).count()
    limit = Threshold.objects.get_limit_by_code_and_account_id(code, account_id)

    if datasets_count >= limit:
        response = {'status': 'error', 'messages': [ugettext('APP-EXCEDEDDATASET-LIMIT')]}
        return response
    else:
        return ''

def calculate_user_limit(request, code):
    account_id = request.auth_manager.account_id
    users_count = User.objects.filter(account=account_id).count()
    limit = Threshold.objects.get_limit_by_code_and_account_id(code, account_id)

    if users_count >= limit:
        response = {'status': 'error', 'messages': [ugettext('APP-EXCEDEDUSERS-LIMIT')]}
        return response
    else:
        return ''
