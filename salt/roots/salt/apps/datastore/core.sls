{% set user = pillar['system']['user'] %}
{% set group = pillar['system']['group'] %}

# Create data store resources directory
datastore_resources_dir:
  file.directory:
    - name: {{ pillar['system']['home'] }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}
    - user: {{ user }}
    - group: {{ group }}
    - mode: 755
    - makedirs: True
    - force: True

datastore_resources_temp_dir:
  file.directory:
    - name: {{ pillar['system']['home'] }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['temporary_bucket'] }}
    - user: {{ user }}
    - group: {{ group }}
    - mode: 755
    - makedirs: True
    - force: True

datastore_resources_base_dir:
  file.directory:
    - name: {{ pillar['system']['home'] }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['bucket'] }}
    - user: {{ user }}
    - group: {{ group }}
    - mode: 755
    - makedirs: True
    - force: True

root_datastore_bucket:
  file.symlink:
    - name: /{{ pillar['amazon']['S3']['bucket'] }}
    - target: {{ pillar['system']['home'] }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['bucket'] }}

root_tmp_datastore_bucket:
  file.symlink:
    - name: /{{ pillar['amazon']['S3']['temporary_bucket'] }}
    - target: {{ pillar['system']['home'] }}/{{ pillar['datastore']['sftp']['remote_base_folder'] }}/{{ pillar['amazon']['S3']['temporary_bucket'] }}
