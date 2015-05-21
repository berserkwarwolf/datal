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
    bucket: ''
    temporary_bucket: ''
    cdn_bucket: ''
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
    public_base_url: 'http://datastore:8080/resources/'
