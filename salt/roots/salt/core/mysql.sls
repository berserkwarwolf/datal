mysql:
  pkg.installed:
    - refresh: True
    - pkgs:
      - mysql-server-5.5
      - libmysqlclient-dev
      - python-mysqldb

{{ pillar['database']['user'] }}:
  mysql_user.present:
    - host: localhost
    - password: {{ pillar['database']['password'] }}

{{ pillar['database']['name'] }}:
  mysql_database.present

db_perms:
  mysql_grants.present:
    - grant: all privileges
    - database: {{ pillar['database']['name'] }}.*
    - user: {{ pillar['database']['user'] }}
