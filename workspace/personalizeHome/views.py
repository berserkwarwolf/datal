import re
import json

from django.views.decorators.http import require_POST
from django.utils.translation import ugettext
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render_to_response, HttpResponse
from django.core.exceptions import ValidationError

from core.auth.decorators import login_required, privilege_required
from core.helpers import get_domain_with_protocol
from core.communitymanagers import *
from core.lib.datastore import *
from workspace.personalizeHome.managers import ThemeFinder


@login_required
@privilege_required('workspace.can_access_admin')
@csrf_exempt
def load(request):
    auth_manager = request.auth_manager
    preference = request.preferences
    stats = request.stats #TODO this must be loaded at context_procesor but it's not working 
    jsonContent = preference["account_home"]
    home_tab = True
    return render_to_response('personalizeHome/index.html/', locals())


@login_required
@privilege_required('workspace.can_access_admin')
@csrf_exempt
@require_POST
def save(request):
    if request.method == 'POST':
        account = request.auth_manager.get_account()
        jsonContent = request.POST['jsonString']
        jsonObj = json.loads(jsonContent)
        preferences = account.get_preferences()
        if (jsonObj['type'] == 'save'):
            if jsonObj['theme'] is None:
                account.set_preference('account.has.home', False)
            else:
                account.set_preference('account.has.home', True)
            account.set_preference('account.home', jsonContent)
            return HttpResponse(json.dumps({
                'status': 'ok',
                'messages': [ugettext('APP-PREFERENCES-SAVESUCCESSFULLY-TEXT')]}), content_type='application/json')
        else:
            previewHome = 'http://'+preferences['account_domain']+'/home?preview=true'
            account.set_preference('account.preview', jsonContent)
            return HttpResponse(json.dumps({'preview_home':previewHome}), content_type='application/json')


@login_required
@csrf_exempt
def suggest(request):
    account = request.user.account
    preferences = account.get_preferences()
    if preferences['account_home_filters'] == 'featured_accounts':
        featured_accounts = Account.objects.get_featured_accounts(account.id)
        account_id = [featured_account['id'] for featured_account in featured_accounts]
    else:
        account_id = account.id

    query = request.GET.get('term', '')
    if query:
        resources = request.GET.getlist('resources[]', 'all')
        fm = FinderManager(ThemeFinder)
        results, time, facets = fm.search(account_id=account_id, query=query, resource=resources)

        # optionally shows extra info
        # results.append({"extras": {"query": fm.get_finder().last_query, "time": time, "facets": facets}})

        data = json.dumps(results)
    else:
        data = ''
    #else:
    #    data = 'fail'

    return HttpResponse(data,  content_type='application/json')


@csrf_exempt
def upload(request):
    value = ''
    for filename, file in request.FILES.iteritems():
        valuelist = request.FILES.getlist(filename)
        for val in valuelist:
            data = val
            name = data.name

            accountid = str(request.auth_manager.account_id)
            keyname = "%s/%s" %(accountid[::-1], name)

            active_datastore.upload(settings.AWS_CDN_BUCKET_NAME, name, data, str(request.auth_manager.account_id))
            value = get_domain_with_protocol('cdn') + '/' + keyname

    if request.FILES is None:
        response_data = [{"error": 'Must have files attached!'}]
        return HttpResponse(json.dumps(response_data))
    if request.method == 'POST':
        is_ie = False
        if request.META.has_key('HTTP_USER_AGENT'):
            user_agent = request.META['HTTP_USER_AGENT']
            pattern = "msie [1-9]\."
            prog = re.compile(pattern, re.IGNORECASE)
            match = prog.search(user_agent)
            if match:
                is_ie = True
        if is_ie:
            return HttpResponse(json.dumps({"url": value}),  content_type='text/plain')
        else:
            return HttpResponse(json.dumps({"url": value}),  content_type='application/json')


@csrf_exempt
def deleteFiles( request ):
    if request.method == 'POST':
            try:
                accountid = str(request.auth_manager.account_id)
                jsonContent = request.POST['deleteFilenames']
                jsonObj = json.loads(jsonContent)

                bucket = active_datastore.get_bucket(settings.AWS_CDN_BUCKET_NAME)

                if type(jsonObj) is list:
                    for fileName in jsonObj:
                        keyname = "%s/%s" %(accountid[::-1], fileName)
                        bucket.delete_key(keyname)
                if type(jsonObj) is str:
                        keyname = "%s/%s" %(accountid[::-1], fileName)
                        bucket.delete_key(keyname)
                response = {'status': 'ok', 'messages': [ugettext('APP-PREFERENCES-SAVESUCCESSFULLY-TEXT')]}
            except ValidationError, err:
                response = {'status': 'error', 'messages': [ugettext('ADMIN-HOME-DELETE-MESSAGE')]}

            return HttpResponse(json.dumps(response), mimetype='application/json');
