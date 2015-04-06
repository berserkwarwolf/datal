# Set directory owner
directory_structure:
  file.directory:
    - name: {{ pillar['virtualenv']['path'] }}
    - user: {{ pillar['system']['user'] }}
    - follow_symlinks: False
    - recurse:
      - user

# Create virtual environment
create_env:
  virtualenv.managed:
    - name: {{ pillar['virtualenv']['path'] }}
    - system_site_packages: False
    - requirements: {{ pillar['virtualenv']['requirements'] }}
    - user: {{ pillar['system']['user'] }}

# Activate virtualenv on login
/home/{{ pillar['system']['user'] }}/.bashrc:
  file.append:
    - text:
      - "source {{ pillar['virtualenv']['path'] }}/bin/activate"
      - "cd {{ pillar['application']['path'] }}"
    - user: {{ pillar['system']['user'] }}

local_settings:
  file.managed:
    - name: {{ pillar['application']['path'] }}/core/local_settings.py
    - source: salt://apps/datal/local_settings_base.py
    - template: jinja
    - user: {{ pillar['system']['user'] }}

sync_db:
  cmd.run:
    - user: {{ pillar['system']['user'] }}
    - cwd: {{ pillar['application']['path'] }}
    - names:
      - PATH="{{ pillar['virtualenv']['path'] }}/bin/:$PATH"; python manage.py syncdb --noinput --settings=core.settings
      - PATH="{{ pillar['virtualenv']['path'] }}/bin/:$PATH"; python manage.py syncdb --noinput --settings=admin.settings
      # - PATH="{{ pillar['virtualenv']['path'] }}/bin/:$PATH"; python manage.py syncdb --noinput --settings=api.settings
      - PATH="{{ pillar['virtualenv']['path'] }}/bin/:$PATH"; python manage.py syncdb --noinput --settings=microsites.settings
      - PATH="{{ pillar['virtualenv']['path'] }}/bin/:$PATH"; python manage.py syncdb --noinput --settings=workspace.settings

fixtures:
  cmd.run:
    - user: {{ pillar['system']['user'] }}
    - cwd: {{ pillar['application']['path'] }}
    - names:
      - PATH="{{ pillar['virtualenv']['path'] }}/bin/:$PATH"; python manage.py loaddata  core/fixtures/* --settings=core.settings

language:
  cmd.run:
    - user: {{ pillar['system']['user'] }}
    - cwd: {{ pillar['application']['path'] }}
    - names:
      - PATH="{{ pillar['virtualenv']['path'] }}/bin/:$PATH"; python manage.py compilemessages --settings=workspace.settings

/tmp/datal.log:
  file.managed:
    - user: {{ pillar['system']['user'] }}
    - group: {{ pillar['system']['group'] }}
    - mode: 777

include:
  - apps.datal.uwsgi.init
  - apps.datal.supervisor.init

