from django.conf import settings

def request_context(request):
    d = {'auth_manager': request.auth_manager}
    d['is_private_site'] = False

    my_settings = {'BASE_URI' : settings.BASE_URI,
                  'API_URI' : settings.API_URI,
                  'API_KEY' : settings.API_KEY,
                  'VERSION_JS_CSS': settings.VERSION_JS_CSS,
                  'WORKSPACE_URI': settings.WORKSPACE_URI,
                  'DOMAINS': settings.DOMAINS}
    d['settings'] = my_settings
    d['preference'] = request.preferences
    return d