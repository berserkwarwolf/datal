from functools import wraps

from django.utils.decorators import ( available_attrs, decorator_from_middleware_with_args,)
from django.views.decorators.cache import cache_page

#from django.middleware.cache import CacheMiddleware
#from django.utils.cache import add_never_cache_headers, patch_cache_control
#
#
#def micache(*args, **kwargs):
#    print "cache vieja!!!"
#    if len(args) != 1 or callable(args[0]):
#        raise TypeError("cache_page has a single mandatory positional argument: timeout")
#    cache_timeout = args[0]
#    cache_alias = kwargs.pop('cache', None)
#    key_prefix = kwargs.pop('key_prefix', None)
#    if kwargs:
#        raise TypeError("cache_page has two optional keyword arguments: cache and key_prefix")
#    
#    return decorator_from_middleware_with_args(CacheMiddleware)(
#        cache_timeout=cache_timeout, cache_alias=cache_alias, key_prefix=key_prefix
#        )
#

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
