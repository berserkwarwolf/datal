nginx:
  ng:
    install_from_ppa: True
    ppa_version: 'stable'

    lookup:
      conf_file: /etc/nginx/nginx.conf
      vhost_available: /etc/nginx/sites-available
      vhost_enabled: /etc/nginx/sites-enabled
      vhost_use_symlink: True

    service:
      enable: True

    server:
      config:
        worker_processes: 4
        pid: /run/nginx.pid
        events:
          worker_connections: 768
        http:
          sendfile: 'on'
          include:
            - /etc/nginx/mime.types
            - /etc/nginx/conf.d/*.conf
            - /etc/nginx/sites-enabled/*

    vhosts:
      managed:
        admin:
          enabled: True
          config:
            - server:
              - server_name: admin
              - listen: 80
              - access_log: /var/log/nginx/admin-access.log
              - error_log: /var/log/nginx/admin-error.log
              - client_max_body_size: 30m
              - proxy_buffer_size: 128k
              - proxy_buffers: 4 256k
              - proxy_busy_buffers_size: 256k

              # TODO: Review
              #- location /lb:
              #  - alias:
              #    - /var/www/lb

              - location /media:
                - alias:
                  - {{ pillar['virtualenv']['path'] }}/lib/python2.7/site-packages/django/contrib/admin/static

              - location /:
                - uwsgi_pass: 127.0.0.1:3016
                - include: /etc/nginx/uwsgi_params

        api:
          enabled: True
          config:
            - server:
              - server_name: 'api'
              - access_log: /var/log/nginx/api-access.log
              - error_log: /var/log/nginx/api-error.log
              - client_max_body_size: 48m
              - proxy_buffer_size: 256k
              - proxy_buffers: 4 512k
              - proxy_busy_buffers_size: 512k
              - proxy_read_timeout: 180s
              - proxy_send_timeout: 180s

              # TODO: Review
              #- location /lb:
              #  - alias:
              #    - /var/www/lb

              - location /:
                - uwsgi_pass: 127.0.0.1:3018
                - uwsgi_read_timeout: 300
                - uwsgi_send_timeout: 300
                - include: /etc/nginx/uwsgi_params

              # TODO: Review
              #- location /robots.txt:
              #  - alias:
              #    - /var/www/microsite/robots.txt

        microsite:
          enabled: True
          config:
            - server:
              - server_name: 'microsites microsite'
              - access_log: /var/log/nginx/microsites-access.log
              - error_log /var/log/nginx/microsites-error.log
              - client_max_body_size: 48m
              - proxy_buffer_size: 256k
              - proxy_buffers: 4 512k
              - proxy_busy_buffers_size: 512k
              - proxy_read_timeout: 120s
              - proxy_send_timeout: 120s

              # TODO: Review
              #- location /robots.txt:
              #  - alias:
              #    - /var/www/microsite/robots.txt

              - location /js_core:
                - alias:
                  - {{ pillar['application']['path'] }}/core/js

              - location /media_core:
                - alias:
                  - {{ pillar['application']['path'] }}/core/media

              - location /js_microsites:
                - alias:
                  - {{ pillar['application']['path'] }}/microsites/js

              - location /media_microsites:
                - alias:
                  - {{ pillar['application']['path'] }}/microsites/media

              - location /js_workspace:
                - alias:
                  - {{ pillar['application']['path'] }}/workspace/js

              - location /media_workspace:
                - alias:
                  - {{ pillar['application']['path'] }}/workspace/media

              - location /AgileOfficeServer:
                - proxy_pass: http://127.0.0.1:8080/AgileOfficeServer
                - proxy_set_header Host: $host
                - proxy_set_header X-Real-IP: $remote_addr
                - proxy_set_header X-Forwarded-For: $proxy_add_x_forwarded_for

              - location /AgileOfficeScraperServices:
                - proxy_pass: http://127.0.0.1:8080/AgileOfficeScraperServices
                - proxy_next_upstream: timeout
                - proxy_set_header Host: $host
                - proxy_set_header X-Real-IP: $remote_addr

              - location /:
                - uwsgi_pass: 127.0.0.1:3017
                - uwsgi_read_timeout: 120
                - uwsgi_send_timeout: 120
                - include: /etc/nginx/uwsgi_params

        workspace:
          enabled: True
          config:
            - server:
              - server_name: 'workspace'
              - access_log: /var/log/nginx/workspace-access.log
              - error_log: /var/log/nginx/workspace-error.log
              - client_max_body_size: 48m
              - proxy_buffer_size:   128k
              - proxy_buffers: 4 256k
              - proxy_busy_buffers_size: 256k
              - proxy_read_timeout: 120s
              - proxy_send_timeout: 120s

              - location /js_core:
                - alias:
                  - {{ pillar['application']['path'] }}/core/js

              - location /media_core:
                - alias:
                  - {{ pillar['application']['path'] }}/core/media

              - location /AgileOfficeServer:
                - proxy_pass: 'http://127.0.0.1:8080/AgileOfficeServer'
                - proxy_set_header: Host $host
                - proxy_set_header: X-Real-IP $remote_addr
                - proxy_set_header: X-Forwarded-For $proxy_add_x_forwarded_for

              - location /:
                - uwsgi_pass: 127.0.0.1:3015
                - uwsgi_read_timeout: 120
                - uwsgi_send_timeout: 120
                - include: /etc/nginx/uwsgi_params
