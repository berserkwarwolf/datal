application:
  path: /home/vagrant/app
  statics_dir: /home/vagrant/static
  cdn: ''
  api_key: ''
  public_key: ''

  settings:
    # Base Django Settings
    secret_key: '1'
    root_urlconf: 'workspace.urls'

    pagination_results_per_page: 10

    domains:
      engine: 'http://workspace:8080'
      microsites: 'microsites:8080'
      workspace: 'workspace:8080'
      api: 'api:8080'
      

virtualenv:
  path: /home/vagrant/env
  requirements: /home/vagrant/app/requirements.txt

searchers:
  searchify:
    api_url: ''
    index: ''

email:
    host: ''
    port: ''
    user: ''
    password: ''
    tls: True

sentry_dns: ''

bigdata:
  port: ''
  endpoint: ''
  hosts:
    - { name: ''}

social:
  twitter_profile_url: ''
  facebook_profile_url: ''
  
mail_list:
  list_company: ''
  list_description: ''
  list_usubscribe: ''
  list_update_profile: ''
  welcome_template_es: ''
  welcome_template_en: ''
  mailchimp: 
    uri: 'https://us2.api.mailchimp.com/2.0/'
    api_key: ''
    lists: 
      workspace_users_list:
        es_id: ''
        en_id: ''
  mandrill:
    api_key: ''