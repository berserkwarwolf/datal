local_hosts:
  host.present:
    - ip: 127.0.0.1
    - names:
      - workspace
      - microsites
      - microsite
      - datastore

system_tools:
  pkg.installed:
    - pkgs:
      - vim
      - unzip
      - python-software-properties
      - gettext
      - git