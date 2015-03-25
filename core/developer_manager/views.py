# Create your views here
import random
import hashlib
from django.http import Http404
from django.shortcuts import render_to_response, HttpResponse
from core.models import Application, DataStream
from django.conf import settings

def action_query(request):
    DOC_API_URL = settings.DOC_API_URL
    if hasattr(request, 'account'):
        account = request.account
        preferences = account.get_preferences()
        keys = ['account.domain', 'account.page.titles', 'account.email', 'account.name',
                'account.favicon', 'branding.header', 'branding.footer','enable.junar.footer',
                'account.language', 'account.logo', 'account.header.uri', 'account.header.height',
                'account.footer.uri', 'account.footer.height', 'account.enable.sharing']
        preferences.load(keys)
        base_uri = 'http://' + preferences['account_domain']
        objs = DataStream.objects.filter(user__account_id=request.account.id, datastreamrevision__status=3)
        try:
            example_guid = objs[0].guid
        except:
            example_guid = 'GUID'
    auth_manager = request.auth_manager
        
    return render_to_response('developer_manager/query_list.html', locals())

def action_insert(request):

    try:
        account = request.account
    except AttributeError, e:
        account = None

    hash_lenght   = 40
    api_key = hashlib.sha224(str( random.random( ) ) ).hexdigest( )[0:hash_lenght]
    public_api_key = hashlib.sha224(str( random.random( ) ) ).hexdigest( )[0:hash_lenght]
    application = Application()
    application.auth_key = api_key
    application.public_auth_key = public_api_key
    application.valid = True
    application.expires_at = '2011-12-31 23:59:59'
    application.type = '00'
    application.account = account
    application.save()
    return HttpResponse( '{"pApiKey":"%s", "pPublicApiKey":"%s"}' % (api_key, public_api_key), content_type = 'application/json' )

