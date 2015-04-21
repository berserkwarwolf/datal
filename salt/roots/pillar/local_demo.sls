amazon:
  S3:
    bucket: ''
    temporary_bucket: ''
    cdn_bucket: ''
    accesskey: ''
    secretkey: ''

searchers:
  searchify:
    api_url: ''
    index: ''

application:
  cdn: ''
  api_key: ''
  public_key: ''

email:
    host: ''
    port: ''
    user: ''
    password: ''
    tls: True

bigdata:
  port: ''
  endpoint: ''
  hosts:
    - { name: ''}

queues:
  request_queue: ''

social:
  twitter_profile_url: ''
  facebook_profile_url: ''

mail_list:
  list_company: ''
  list_description: ''
  list_unsubscribe: ''
  list_update_profile: ''
  welcome_template_es: ''
  welcome_template_en: ''
  mailchimp:
    uri: ''
    api_key: ''
    lists:
      workspace_users_list:
        es_id: ''
        en_id: ''
  mandrill:
    api_key: ''