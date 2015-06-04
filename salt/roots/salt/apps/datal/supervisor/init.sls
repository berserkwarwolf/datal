supervisor_conf:
  file.managed:
    - name: /etc/supervisor/supervisord.conf
    - source: salt://apps/datal/supervisor/supervisord.conf
    - template: jinja

uwsgi_conf:
  file.managed:
    - name: /etc/supervisor/conf.d/uwsgi.conf
    - source: salt://apps/datal/supervisor/uwsgi.conf
    - template: jinja

supervisor:
  pkg:
    - installed
  service.running:
    - require:
      - pkg: supervisor
    - watch:
      - file: /etc/supervisor/supervisord.conf
      - file: /etc/supervisor/conf.d/uwsgi.conf
      - file: /etc/uwsgi/admin.ini
      - file: /etc/uwsgi/api.ini
      - file: /etc/uwsgi/microsite.ini
      - file: /etc/uwsgi/workspace.ini
      - file: /tmp/datal.log

