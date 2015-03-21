
try:
    from functools import wraps
except ImportError:
    from django.utils.functional import wraps  # Python 2.4 fallback.

from django.http import Http404

from django.utils.decorators import available_attrs
from django.conf import settings
from junar.core.http import get_domain
from junar.api.exceptions import BigdataCrossNamespaceForbidden, ApplicationNotAdmin
from junar.core.models import Application

def public_access_forbidden(view_func):
    @wraps(view_func, assigned=available_attrs(view_func))
    def _wrapped_view(request, *args, **kwargs):

        domain = get_domain(request)
        if domain == settings.API_BASE_URI:
            return view_func(request, *args, **kwargs)
        raise Http404

    return _wrapped_view

def bigdata_cross_namespace_forbidden(view_func):
    @wraps(view_func, assigned=available_attrs(view_func))
    def _wrapped_view(request, *args, **kwargs):

        namespace = kwargs.get('namespace', None)
        domain = get_domain(request)
        if domain == settings.API_BASE_URI or namespace is None:
            return view_func(request, *args, **kwargs)

        raise BigdataCrossNamespaceForbidden

    return _wrapped_view


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
