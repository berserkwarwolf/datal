uwsgi_install:
  pip.installed:
    - require:
      - pkg: python-pip
    - names:
      - uwsgi