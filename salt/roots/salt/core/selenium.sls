include:
  - core.nodejs

fontconfig:
  pkg.installed

selenium_install:
  pip.installed:
    - require:
      - pkg: python-pip
    - names:
      - selenium

# Usamos navegador headless para los tests
{% if salt['grains.get']('os') == 'Debian' %}
firefox_mint_repo:
  pkgrepo.managed:
    - humanname: Linux Mint repo
    - dist: debian
    - file: /etc/apt/sources.list.d/mint.list
    - name: "deb http://packages.linuxmint.com debian import"
    - keyserver: pgp.mit.edu
    - keyid:  3EE67F3D0FF405B2
{% endif %}

# Usamos navegador headless para los tests
testing_tools_install:
  pkg.installed:
    - names:
      - xvfb
      - firefox
