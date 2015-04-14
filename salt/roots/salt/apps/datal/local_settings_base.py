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

SEARCHIFY = {
    'api_url': '{{  pillar["searchers"]["searchify"]["api_url"] }}',
    'index': '{{  pillar["searchers"]["searchify"]["index"] }}'
}

DOMAINS = {'api': 'api',
           'community': 'community',
           'microsites': 'microsites:8080',
           'workspace': 'workspace',
           'website': 'website',
           'engine': '{{  pillar["application"]["settings"]["domains"]["engine"] }}',
           'cdn': '{{  pillar["application"]["cdn"] }}',
}

EMAIL_HOST = '{{  pillar["email"]["host"] }}'
EMAIL_HOST_USER = '{{  pillar["email"]["user"] }}'
EMAIL_HOST_PASSWORD = '{{  pillar["email"]["password"] }}'
EMAIL_PORT = '{{ pillar["email"]["port"] }}'
EMAIL_USE_TLS = {{ pillar["email"]["tls"] }}

BIGDATA_HOSTS = (
    {% for host in pillar["bigdata"]["hosts"] %}
    "{{ host.name }}",
    {% endfor %}
)
BIGDATA_PORT = '{{ pillar["bigdata"]["port"] }}'
BIGDATA_API_ENDPOINT = '{{ pillar["bigdata"]["endpoint"] }}'

AWS_ACCESS_KEY = '{{ pillar["amazon"]["S3"]["accesskey"] }}'
AWS_SECRET_KEY = '{{ pillar["amazon"]["S3"]["secretkey"] }}'
AWS_BUCKET_NAME = '{{ pillar["amazon"]["S3"]["bucket"] }}'
AWS_CDN_BUCKET_NAME = '{{ pillar["amazon"]["S3"]["cdn_bucket"] }}'

REQUESTS_QUEUE = '{{ pillar["queues"]["request_queue"] }}'

API_KEY = '{{ pillar["application"]["api_key"] }}'
PUBLIC_KEY = '{{ pillar["application"]["public_key"] }}'

SENTRY_DSN = '{{ pillar["sentry_dns"] }}'

STATIC_ROOT= "{{ pillar['application']['statics_dir'] }}"
