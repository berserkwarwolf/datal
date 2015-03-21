from junar.core.settings import *

LOCALE_PATHS = (
    os.path.join(PROJECT_PATH, 'microsites', 'locale'),
) + LOCALE_PATHS


TEMPLATE_CONTEXT_PROCESSORS += (
    "junar.microsites.context_processors.request_context",
)

MIDDLEWARE_CLASSES += (
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    #TODO CHECK WHERE IS NOW! 'junar.core.auth.middleware.AuthMiddleware',
    'junar.microsites.middlewares.auth.AccessManager',
    'junar.microsites.middlewares.ioc.DependencyInjector',
    'django.middleware.locale.LocaleMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'junar.microsites.urls'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'microsites', 'templates'),
) + TEMPLATE_DIRS

SEARCH_MAX_RESULTS = 100
PAGINATION_RESULTS_PER_PAGE = 10
PAGINATION_COMMENTS_PER_PAGE  = 10
DEFAULT_MICROSITE_CHART_SIZES = {"embed":{"width":400, "height":115}, "normal":{"width":"90%", "height":620}}

INSTALLED_APPS += (
    'junar.microsites',
    'django.contrib.sessions',
    'django.contrib.humanize',
)

DOMAINS['engine'] = 'microsites'

BASE_URI = 'http://microsites'
MEDIA_URI = BASE_URI
WORKSPACE_URI = 'http://workspace'
MEMCACHED_ENGINE_END_POINT = ['127.0.0.1:11211']

DOMAINS['engine'] = 'microsite'

FLEXMONSTER_LOCALES = ['ch', 'en', 'es', 'fr', 'pt', 'ua']
FLEXMONSTER_DEFAULT_LOCALE = 'en'

BOTS = ['Googlebot', 'AdsBot-Google'] #, 'Googlebot-Mobile', 'Googlebot-Image', 'Mediapartners-Google', 'Slurp', 'YahooSeeker/M1A1-R2D2', 'MSNBot', 'MSNBot-Media', 'MSNBot-NewsBlogs', 'MSNBot-Products', 'MSNBot-Academic', 'Teoma']

try:
    from junar.microsites.local_settings import *
except ImportError:
    pass
