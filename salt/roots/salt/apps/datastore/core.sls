{% set user = pillar['system']['user'] %}
{% set group = pillar['system']['group'] %}

# Create data store resources directory
datastore_resources_dir:
  file.directory:
    - name: {{ salt['user.info'](user).home }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}
    - user: {{ user }}
    - group: {{ group }}
    - mode: 755
    - makedirs: True

/{{ pillar['amazon']['S3']['bucket'] }}:
  file.symlink:
    - target: {{ salt['user.info'](user).home }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['bucket'] }}

/{{ pillar['amazon']['S3']['temporary_bucket'] }}:
  file.symlink:
    - target: {{ salt['user.info'](user).home }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['temporary_bucket'] }}

# For fixed uploaded file for theme
{{ salt['user.info'](user).home }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['cdn_bucket'] }}/1:
  file.directory:
    - user: {{ user }}
    - group: {{ group }}
    - mode: 755
    - makedirs: True

fixed_image:
  file.managed:
    - name: {{ salt['user.info'](user).home }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['cdn_bucket'] }}/1/datal-portada.jpg
    - source: salt://apps/datastore/datal-portada.jpg
    - user: {{ user }}
    - group: {{ group }}
