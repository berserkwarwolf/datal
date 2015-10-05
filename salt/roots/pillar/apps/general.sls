database:
  user: datal
  name: ao_datal
  password: datal
  host: localhost
  port: 3306
  engine: mysql

redis:
  host: localhost
  port: 6379

amazon:
  S3:
    bucket: 'datal'
    temporary_bucket: 'datal_temp'
    cdn_bucket: 'datal_cdn'
    accesskey: ''
    secretkey: ''

queues:
  request_queue: ''

datastore:
  use: 'sftp'
  sftp:
    host: 'localhost'
    port: 22
    user: vagrant
    password: datal
    privateKey:
    passphrase:
    remote_base_folder: datastore/resources/
    local_tmp_folder: datastore/tmp/
    base_url: 'http://datastore.dev:8888/resources'

domains:
  microsites: 'microsites.dev'
  workspace: 'workspace.dev'
  api: 'api.dev'
  admin: 'admin.dev'
