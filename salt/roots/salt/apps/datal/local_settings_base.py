SECRET_KEY = '{{ pillar["application"]["settings"]["secret_key"] }}'
ROOT_URLCONF = '{{ pillar["application"]["settings"]["root_urlconf"] }}'

PAGINATION_RESULTS_PER_PAGE = '{{ pillar["application"]["settings"]["pagination_results_per_page"] }}'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': '{{ pillar["database"]["name"] }}',
        'USER': '{{ pillar["database"]["user"] }}',
        'PASSWORD': '{{ pillar["database"]["password"] }}',
        'HOST': '{{ pillar["database"]["host"] }}',
        'PORT': '{{ pillar["database"]["port"] }}',
        'SUPPORTS_TRANSACTIONS': True
    },
}
