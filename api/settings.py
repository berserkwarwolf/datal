from core.settings import *

USE_I18N = False
USE_L10N = False

MIDDLEWARE_CLASSES += (
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
)

ROOT_URLCONF = 'api.urls'

INSTALLED_APPS += (
    'api',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages"
)

#SEARCH_MAX_RESULTS = 100
#PAGINATION_RESULTS_PER_PAGE = 50
#API_TYPE = dict()
#API_TYPE['00'] = {'max_calls_per_month': 1000,    'calls_per_day': 34,    'lapse_between_calls': 5}
#API_TYPE['00'] = {'max_calls_per_month': 30000,   'calls_per_day': 1000,  'lapse_between_calls': 1}
#API_TYPE['01'] = {'max_calls_per_month': 30000,   'calls_per_day': 1000,  'lapse_between_calls': 2}
#API_TYPE['02'] = {'max_calls_per_month': 150000,  'calls_per_day': 5000,  'lapse_between_calls': 1}
#API_TYPE['03'] = {'max_calls_per_month': 1000000, 'calls_per_day': 33333, 'lapse_between_calls': 1}
#API_TYPE['04'] = {'max_calls_per_month': 1000000, 'calls_per_day': 33333, 'lapse_between_calls': 0}


REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = (
    'rest_framework.authentication.SessionAuthentication',
    'api.rest.auth.DatalApiAuthentication',
)

REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = (
    'rest_framework.permissions.IsAuthenticated',
    'api.rest.permissions.ApiPermission',
    'api.rest.permissions.ApiPrivateForWritePermission',
    'api.rest.permissions.ApiIsUserForWritePermission',
)

REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = (
    'rest_framework.throttling.UserRateThrottle',
)

REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'user': '20/minute'
}

try:
    from api.local_settings import *
except ImportError:
    pass

