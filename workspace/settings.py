# -*- coding: utf-8 -*-
from junar.core.settings import *

IS_WORKSPACE = True

LOCALE_PATHS = (
    os.path.join(PROJECT_PATH, 'workspace', 'locale'),
) + LOCALE_PATHS

MIDDLEWARE_CLASSES += (
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'junar.workspace.middlewares.nocache.NoCacheMiddleware',
    'junar.workspace.middlewares.auth.AccessManager',
    'junar.workspace.middlewares.ioc.DependenciesInjector',
    'junar.workspace.middlewares.catch.ExceptionManager',
)

DOMAINS['engine'] = 'workspace'

ROOT_URLCONF = 'junar.workspace.urls'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'workspace', 'templates'),
) + TEMPLATE_DIRS

SEARCH_MAX_RESULTS = 40
PAGINATION_RESULTS_PER_PAGE = 10

SECOND_LANGUAGE = 'es'

INSTALLED_APPS += (
    'junar.workspace',
    'django.contrib.sessions',
)

BASE_URI = 'workspace'
MEDIA_URI = BASE_URI

DEFAULT_CATEGORIES = {
  'en': [u'Education', u'Entertainment', u'World', u'Business', u'Economy', u'Technology', u'Culture', u'Health', u'Sports', u'Weather', u'Earth', u'Science'],
  'es': [u'Educación', u'Entretenimiento', u'Mundo', u'Negocios', u'Economía', u'Tecnología', u'Cultura', u'Salud', u'Deportes', u'Clima', u'Planeta', u'Ciencia'],
}

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

try:
    from junar.workspace.local_settings import *
except ImportError:
    pass
