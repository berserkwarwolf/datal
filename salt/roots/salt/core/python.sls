python:
  pkg.installed:
    - pkgs:
      - python2.7
      - python-dev
      - supervisor
      - python-mysqldb

python-pip:
  pkg.installed

tools:
  pip.installed:
    - require:
      - pkg: python-pip
    - names:
      - virtualenv
