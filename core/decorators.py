
try:
    from functools import wraps
except ImportError:
    from django.utils.functional import wraps  # Python 2.4 fallback.

from django.utils.decorators import available_attrs
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