base:
  '*':
    - base.system
    - base.nginx
    - apps.general
    - apps.aos
    - apps.datal
    {% if salt['file.file_exists']('/srv/salt/pillar/local.sls') %}
    - local
    {% endif %}