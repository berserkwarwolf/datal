# User and Group settings
datal_group:
  group.present:
    - name: {{ pillar['system']['group'] }}

datal_user:
  user.present:
    - name: {{ pillar['system']['user'] }}
    - fullname: {{ pillar['system']['user'] }}
    - shell: /bin/bash
    - password: {{ pillar['system']['user_password_hash'] }}
    - home: {{ pillar['system']['home'] }}
    - groups:
      - {{ pillar['system']['group'] }}
