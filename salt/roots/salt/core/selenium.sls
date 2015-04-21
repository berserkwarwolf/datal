# Saltstate file for phantomjs binary
{% set package = 'phantomjs-1.9.8-linux-x86_64' %}
{% set download = 'phantomjs-1.9.8-linux-x86_64.tar.bz2' %}
{% set installdir = '/usr/local/share' %}

include:
  - core.nodejs

fontconfig:
  pkg.installed

download-phantomjs:
  cmd.run:
    - cwd: {{ installdir }}
    - name: wget https://bitbucket.org/ariya/phantomjs/downloads/{{ download }}
    - unless: test -e {{ installdir }}/{{ download }}

# Extract it
extract-phantomjs:
  cmd.wait:
    - cwd: {{ installdir }}
    - name: tar -xvf {{ download }}
   # - onlyif: test -e {{ installdir }}/{{ download }}
    - watch:
      - cmd: download-phantomjs

# Create symlink
phantomjs:
   file.symlink:
     - target: {{ installdir }}/{{ package }}/bin/phantomjs
     - name: /usr/local/bin/phantomjs
     - unless: test -e /usr/local/bin/phantomjs
     - watch:
       - cmd: extract-phantomjs

selenium_install:
  pip.installed:
    - require:
      - pkg: python-pip
    - names:
      - selenium
