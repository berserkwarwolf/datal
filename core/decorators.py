from functools import wraps

from django.utils.decorators import ( available_attrs, decorator_from_middleware_with_args,)
from django.views.decorators.cache import cache_page
from core.exceptions import ApplicationNotAdmin
from core.models import Application

def public_keys_forbidden(view_func):
    """ 'application' means users by auth_key access """
    @wraps(view_func, assigned=available_attrs(view_func))
    def _wrapped_view(request, *args, **kwargs):
        try:
            auth_key = request.REQUEST.get('auth_key')
            app = Application.objects.get(auth_key = auth_key)
            request.app = app
            if app.type == "04":
                return view_func(request, *args, **kwargs)
            else:
                raise ApplicationNotAdmin("Invalid Authorization Key")
        except:
            raise ApplicationNotAdmin("Invalid Authorization Key")

    return _wrapped_view

def datal_make_key(key, key_prefix, version):
    """
        sobre escribe el metodo make_key del cache para generar la key, ignorando key
    """

    return ":".join([str(version), key_prefix])

def datal_cache_page(**kwargs):
    def _cache_page(viewfunc):
        @wraps(viewfunc, assigned=available_attrs(viewfunc))
        def _cache_page(request, *args, **kw):
            params=str(hash(frozenset(sorted(request.REQUEST.items()))))
            key_prefix=":".join([request.path,params])
            response = cache_page(60, cache='engine', key_prefix=key_prefix)(viewfunc)
            return response(request, *args, **kw)
        return _cache_page
    return _cache_page
