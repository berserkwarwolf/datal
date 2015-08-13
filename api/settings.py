from core.settings import *
from core.emitters import CSVEmitter, TSVEmitter, ExcelEmitter, XMLEmitter

USE_I18N = False
USE_L10N = False
TEMPLATE_CONTEXT_PROCESSORS = ()
TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'api', 'templates'),
) + TEMPLATE_DIRS

MIDDLEWARE_CLASSES += (
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'api.middlewares.auth.AuthMiddleware',
    'api.middlewares.jsonp.JSONPMiddleware',
    'api.middlewares.response.ResponseStatusMiddleware',
    'api.middlewares.ioc.DependenciesInjector',
    'api.middlewares.exceptions.ExceptionMiddleware',
    # 'api.handleRequests.catch.ExceptionManager',
)

ROOT_URLCONF = 'api.urls'

INSTALLED_APPS += (
    'api',
)

# exclusion list of words not used at search
ENGLISH_EXCLUSION_LIST = ['abaft', 'aboard', 'about', 'above', 'absent', 'across', 'afore', 'after', 'against', 'along', 'alongside', 'amid', 'amidst', 'among', 'amongst', 'an', 'apropos', 'around', 'as', 'aside', 'astride', 'at', 'athwart', 'atop', 'barring', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'betwixt', 'beyond', 'but', 'by', 'circa', 'concerning', 'despite', 'down', 'during', 'except', 'excluding', 'failing', 'following', 'for', 'from', 'given', 'in', 'including', 'inside', 'into', 'like', 'mid', 'midst', 'minus', 'near', 'next', 'notwithstanding', 'of', 'off', 'on', 'onto', 'opposite', 'out', 'outside', 'over', 'pace', 'past', 'per', 'plus', 'pro', 'qua', 'regarding', 'round', 'sans', 'save', 'since', 'than', 'through', 'thru', 'throughout', 'thruout', 'the', 'till', 'times', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'vs', 'via', 'vice', 'with', 'within', 'without', 'worth', 'it', 'the', 'a', 'an']
SPANISH_EXCLUSION_LIST = ['a', 'con', 'contra', 'de', 'desde', 'durante', 'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'segun', 'sin', 'so', 'sobre', 'tras', 'via', 'excepto', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas']
SEARCH_TERMS_EXCLUSION_LIST = ENGLISH_EXCLUSION_LIST + SPANISH_EXCLUSION_LIST

DEFAULT_SEARCH_MAX_RESULTS = 100

BASE_URI = ''
API_BASE_URI = 'api'
ENVIRONMENT = 'sandbox' # ['prod', 'sandbox']

SEARCH_MAX_RESULTS = 100
PAGINATION_RESULTS_PER_PAGE = 50

REDIS_API_KEYS_DB = 2
MEMCACHED_ENGINE_END_POINT = ['127.0.0.1:11211']
MEMCACHED_API_END_POINT = ['127.0.0.1:11211']

API_TYPE = dict()
API_TYPE['00'] = {'max_calls_per_month': 1000,    'calls_per_day': 34,    'lapse_between_calls': 5}
API_TYPE['00'] = {'max_calls_per_month': 30000,   'calls_per_day': 1000,  'lapse_between_calls': 1}
API_TYPE['01'] = {'max_calls_per_month': 30000,   'calls_per_day': 1000,  'lapse_between_calls': 2}
API_TYPE['02'] = {'max_calls_per_month': 150000,  'calls_per_day': 5000,  'lapse_between_calls': 1}
API_TYPE['03'] = {'max_calls_per_month': 1000000, 'calls_per_day': 33333, 'lapse_between_calls': 1}
API_TYPE['04'] = {'max_calls_per_month': 1000000, 'calls_per_day': 33333, 'lapse_between_calls': 0}

EMITTERS = dict(
    csv=CSVEmitter,
    tsv=TSVEmitter,
    excel=ExcelEmitter,
    xml=XMLEmitter
)

try:
    from api.local_settings import *
except ImportError:
    pass
