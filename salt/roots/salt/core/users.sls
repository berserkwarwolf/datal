# User and Group settings
junar_group:
  group.present:
    - name: {{ pillar['system']['group'] }}

junar_user:
  user.present:
    - name: {{ pillar['system']['user'] }}
    - fullname: {{ pillar['system']['user'] }}
    - shell: /bin/bash
    - groups:
      - {{ pillar['system']['group'] }}