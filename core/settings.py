# coding=utf-8
import os
PROJECT_PATH, FILENAME = os.path.split(os.path.abspath(os.path.dirname(__file__)))

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Webmaster', 'webmaster@junar.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'datal',
        'USER': 'root',
        'PASSWORD': '123456',
        'HOST': 'localhost',
        'PORT': '3306',
        'SUPPORTS_TRANSACTIONS': True
    },
}

USE_DATASTORE = 's3' # uses s3 | sftp
USE_SEARCHINDEX = 'searchify'

TIME_ZONE = 'America/Santiago'

LANGUAGES = (
    ('en', 'English'),
    ('es', 'Spanish'),
    ('pt', 'Portuguese'),
)

USE_I18N = True
USE_L10N = True

SECRET_KEY = ''

INSTALLED_APPS = (
    'core',
    'raven.contrib.django'
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "core.context_processors.request_context",
    "django.contrib.messages.context_processors.messages",
    "django.core.context_processors.i18n"
)

MIDDLEWARE_CLASSES = ()

LOCALE_PATHS = (
    os.path.join(PROJECT_PATH, 'core', 'locale'),
)

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'core', 'templates'),
)

EMAIL_HOST = 'smtp.mail'
EMAIL_HOST_USER = 'define@mail.com'
EMAIL_HOST_PASSWORD = '111111'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

CACHE_DATABASES = {
    'dataviews': 0,
    'alerts': 1,
    'pipes': 1,
    'history': 1,
    'api_stats': 2,
    'resources_stats': 3,
    'sessions': 4,
    # 6 & 7 used by the engine
    # 10 used by Marco (backups)
    'activity_resources': 5,
}

REDIS_READER_HOST = 'localhost'
REDIS_WRITER_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB   = 0
REDIS_STATS_TTL = 1
MEMCACHED_ENGINE_END_POINT = ['127.0.0.1:11211']
MEMCACHED_DEFAULT_TTL = 60 # seconds
MEMCACHED_LONG_TTL = 86400 # one day


BIGDATA_HOSTS = ( "http://123.123.123.123", "http://123.123.123.124") # When need to use another server change suscriptor instead of changing here
BIGDATA_PORT = "8000"
BIGDATA_API_ENDPOINT = "/bigdataserver" # /namespace/NAMESPACE_NAME/sparql

VERSION_JS_CSS = 666

SESSION_COOKIE_NAME = 'localhostsessionid'
#SESSION_ENGINE = 'redis_sessions.session'
SESSION_REDIS_HOST = REDIS_WRITER_HOST
SESSION_REDIS_PORT = REDIS_PORT
SESSION_REDIS_DB = 4

AWS_ACCESS_KEY = 'your-aws-acc-key'
AWS_SECRET_KEY = 'your-aws-secret-key'
AWS_BUCKET_NAME = 'your-buecket-1'
AWS_CDN_BUCKET_NAME = 'your-public-bucket'
REQUESTS_QUEUE = 'test_requests_queue'

LOGIN_URL = '/signin'

END_POINT_SERVLET       = '/AgileOfficeServer/DataStreamRequesterServlet'
END_POINT_CHART_SERVLET = '/AgileOfficeServer/ChartInvokeServlet'
END_POINT_LOADER_SERVLET= '/AgileOfficeServer/DataSourceLoaderServlet'
END_POINT_PREVIEWER_SERVLET = '/AgileOfficeServer/DataStreamPreviewerServlet'


BASE_URI                = 'localhost'
MEDIA_URI               = BASE_URI
WORKSPACE_URI           = 'workspace'
API_URI                 = 'http://api'
WORKSPACE_URI           = 'http://workspace'
API_KEY                 = ''
PUBLIC_KEY              = '' # To be filled with Junar's PUBLIC KEY


OPENDATA_ACCOUNT        = 'opendata'
PRIVATE_ACCOUNT         = 'private'

ACCOUNT_DOMAIN_PREFERENCE_NAME = 'account.domain'

DOMAINS = { 'api': 'api',
            'microsites': 'microsite',
            'workspace': 'workspace',
            'engine': '',
            'website': 'website',
            'cdn': 'your-public-bucket.s3-website-us-east|west-1.amazonaws.com',
           }

CONTENT_TYPES = { 'json': 'application/json;charset=utf-8',
            'prettyjson': 'application/json;charset=utf-8',
            'json_array': 'application/json;charset=utf-8',
            'csv': 'text/csv;charset=utf-8',
            'html': 'text/html;charset=utf-8',
            'xml': 'text/xml;charset=utf-8',
            'xls': 'application/json;charset=utf-8',
            'kml': 'application/vnd.google-earth.kml+xml',
            'kmz': 'application/vnd.google-earth.kmz',
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'zip': 'application/zip',
            'tar': 'application/x-tar',
            'gz': 'application/x-gzip'
           }

IMPL_TYPES = {'4': 'xls',
              '5': 'pdf',
            '10': 'csv',
            '11': 'kml',
            '12': 'kmz',
            '18': 'jpg', #maybe we need a special value for each file type who has different mime type
            '19': 'zip'
           }

GRAVATAR = { 'url': 'https://www.gravatar.com/avatar/%s?s=%d&d=%s',
             'default_image': '/media_core/images/common/im_avatarNotDefined.gif',
             'sizes': { 'small': 22,
                      'medium': 44,
                      'large': 88,
                    }
            }

TYPE_DASHBOARD      = 'db'
TYPE_DATASET        = 'dt'
TYPE_DATASTREAM     = 'ds'
TYPE_VISUALIZATION  = 'vz'

# Term exclusion lists for searches and usernames
ENGLISH_EXCLUSION_LIST          = ['abaft', 'aboard', 'about', 'above', 'absent', 'across', 'afore', 'after', 'against', 'along', 'alongside', 'amid', 'amidst', 'among', 'amongst', 'an', 'apropos', 'around', 'as', 'aside', 'astride', 'at', 'athwart', 'atop', 'barring', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'betwixt', 'beyond', 'but', 'by', 'circa', 'concerning', 'despite', 'down', 'during', 'except', 'excluding', 'failing', 'following', 'for', 'from', 'given', 'in', 'including', 'inside', 'into', 'like', 'mid', 'midst', 'minus', 'near', 'next', 'notwithstanding', 'of', 'off', 'on', 'onto', 'opposite', 'out', 'outside', 'over', 'pace', 'past', 'per', 'plus', 'pro', 'qua', 'regarding', 'round', 'sans', 'save', 'since', 'than', 'through', 'thru', 'throughout', 'thruout', 'the', 'till', 'times', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'vs', 'via', 'vice', 'with', 'within', 'without', 'worth', 'it', 'the', 'a', 'an']
SPANISH_EXCLUSION_LIST          = ['a', 'con', 'contra', 'de', 'desde', 'durante', 'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'segun', 'sin', 'so', 'sobre', 'tras', 'via', 'excepto', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas']
SEARCH_TERMS_EXCLUSION_LIST     = ENGLISH_EXCLUSION_LIST + SPANISH_EXCLUSION_LIST
BLOCKED_USERNAMES               = ['accounts', 'account', 'blog', 'contact', 'css', 'faq', 'form', 'email', 'error', 'help', 'home', 'images', 'image', 'js', 'privacy', 'news', 'rss', 'search', 'services', 'service', 'support', 'video', 'junardata', 'junar_data', 'junar-data', 'junar.data', 'NN', 'anonymous', 'datastreams', 'datastream', 'data-streams', 'data-stream', 'data_streams', 'data_stream', 'data.streams', 'data.stream', 'dashboards', 'dashboard', 'data']

SEARCHIFY = {'api_url': 'http://:11111@11111.api.searchify.com', 'index': 'TEST'}

# Settings Keys
HOT_DATASTREAMS = 'HOT_DATASTREAMS'
HOT_DASHBOARDS  = 'HOT_DASHBOARDS'
HOT_VISUALIZATIONS = 'HOT_VISUALIZATIONS'
DOC_API_URL = 'http://wiki.junar.com/index.php/API'

# develop & staging sentry
SENTRY_DSN = 'http://sentrydsn@sentry.com/1'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '[%(levelname)s] %(asctime)s %(module)s %(message)s'
        },
        'simple': {
            'format': '[%(levelname)s] %(message)s'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'null': {
            'level':'DEBUG',
            'class':'django.utils.log.NullHandler',
        },
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file':{
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/tmp/datal.log',
        },
        'mail_admins': {
            'filters': ['require_debug_false'],
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        },
         'sentry': {
            'filters': ['require_debug_false'],
            'level': 'DEBUG',
            'class': 'raven.contrib.django.handlers.SentryHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers':['file'],
            'propagate': True,
            'level': 'INFO',
        },
        'django.request': {
            'handlers': ['file'],
            'propagate': False,
            'level': 'INFO',
        },
        'workspace': {'handlers': ['file'], 'level': 'INFO'},
        'api': {'handlers': ['file'], 'level': 'INFO'},
        'admin': {'handlers': ['file'], 'level': 'INFO'},
        'core': {'handlers': ['file'], 'level': 'INFO'},

        'sentry.errors': {
            'level': 'DEBUG',
            'handlers': ['file'],
            'propagate': False,
        },
    }
}

IS_WORKSPACE = False

try:
    from core.local_settings import *
except ImportError:
    pass
