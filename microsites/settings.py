from core.settings import *

LOCALE_PATHS = (
    os.path.join(PROJECT_PATH, 'microsites', 'locale'),
) + LOCALE_PATHS


TEMPLATE_CONTEXT_PROCESSORS += (
    "microsites.context_processors.request_context",
)

MIDDLEWARE_CLASSES += (
    'microsites.middlewares.search.SearchManager',
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'microsites.middlewares.auth.AccessManager',
    'microsites.middlewares.ioc.DependencyInjector',
    'django.middleware.locale.LocaleMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'microsites.urls'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'microsites', 'templates'),
) + TEMPLATE_DIRS

SEARCH_MAX_RESULTS = 100
PAGINATION_RESULTS_PER_PAGE = 10
PAGINATION_COMMENTS_PER_PAGE  = 10
DEFAULT_MICROSITE_CHART_SIZES = {"embed":{"width":400, "height":115}, "normal":{"width":"90%", "height":620}}

INSTALLED_APPS += (
    'microsites',
    'django.contrib.sessions',
    'django.contrib.humanize',
)

BASE_URI = 'http://microsites'
BASE_URI = 'microsites'
MEDIA_URI = BASE_URI
WORKSPACE_URI = 'http://workspace'
WORKSPACE_URI = 'workspace'
MEMCACHED_ENGINE_END_POINT = ['127.0.0.1:11211']

FLEXMONSTER_LOCALES = ['ch', 'en', 'es', 'fr', 'pt', 'ua']
FLEXMONSTER_DEFAULT_LOCALE = 'en'

BOTS = ['Googlebot', 'AdsBot-Google'] #, 'Googlebot-Mobile', 'Googlebot-Image', 'Mediapartners-Google', 'Slurp', 'YahooSeeker/M1A1-R2D2', 'MSNBot', 'MSNBot-Media', 'MSNBot-NewsBlogs', 'MSNBot-Products', 'MSNBot-Academic', 'Teoma']

STATICFILES_DIRS += ( os.path.join(PROJECT_PATH,'microsites/media/'),)

REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = (
    'core.rest.auth.RestAuthentication',
)

REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = (
    'rest_framework.permissions.IsAuthenticated',
)

try:
    from microsites.local_settings import *
except ImportError:
    pass
