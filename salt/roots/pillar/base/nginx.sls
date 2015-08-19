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
        admin.dev:
          enabled: True
          config:
            - server:
              - server_name: admin.dev
              - listen: 80
              - access_log: /var/log/nginx/admin-access.log
              - error_log: /var/log/nginx/admin-error.log
              - client_max_body_size: 30m
              - proxy_buffer_size: 128k
              - proxy_buffers: 4 256k
              - proxy_busy_buffers_size: 256k

              - location /media:
                - alias:
                  - /home/vagrant/env/lib/python2.7/site-packages/django/contrib/admin/static

              - location /:
                - uwsgi_pass: 127.0.0.1:3016
                - include: /etc/nginx/uwsgi_params

        api.dev:
          enabled: True
          config:
            - server:
              - server_name: 'api.dev'
              - access_log: /var/log/nginx/api-access.log
              - error_log: /var/log/nginx/api-error.log
              - client_max_body_size: 48m
              - proxy_buffer_size: 256k
              - proxy_buffers: 4 512k
              - proxy_busy_buffers_size: 512k
              - proxy_read_timeout: 180s
              - proxy_send_timeout: 180s

              - location /:
                - uwsgi_pass: 127.0.0.1:3018
                - uwsgi_read_timeout: 300
                - uwsgi_send_timeout: 300
                - include: /etc/nginx/uwsgi_params

        datastore.dev:
          enabled: True
          config:
            - server:
              - server_name: 'datastore.dev'
              - access_log: /var/log/nginx/datastore-access.log
              - error_log: /var/log/nginx/datastore-error.log
              - root: /home/vagrant/datastore/

        microsite.dev:
          enabled: True
          config:
            - server:
              - server_name: 'microsites.dev microsite.dev'
              - access_log: /var/log/nginx/microsites-access.log
              - error_log /var/log/nginx/microsites-error.log
              - client_max_body_size: 48m
              - proxy_buffer_size: 256k
              - proxy_buffers: 4 512k
              - proxy_busy_buffers_size: 512k
              - proxy_read_timeout: 120s
              - proxy_send_timeout: 120s

              - location /js_core:
                - alias:
                  - /home/vagrant/app/core/js

              - location /js_microsites:
                - alias:
                  - /home/vagrant/app/microsites/js

              - location /js_workspace:
                - alias:
                  - /home/vagrant/app/workspace/js

              - location /static:
                - alias:
                  - /home/vagrant/static

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

        workspace.dev:
          enabled: True
          config:
            - server:
              - server_name: 'workspace.dev'
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
                  - /home/vagrant/app/core/js

              - location /js_workspace:
                - alias:
                  - /home/vagrant/app/workspace/js

              - location /static:
                - alias:
                  - /home/vagrant/static

              - location /AgileOfficeServer:
                - proxy_pass: 'http://127.0.0.1:8080/AgileOfficeServer'
                - proxy_set_header: Host $host
                - proxy_set_header: X-Real-IP $remote_addr
                - proxy_set_header: X-Forwarded-For $proxy_add_x_forwarded_for

              - location /AgileOfficeScraperServices:
                - proxy_pass: 'http://127.0.0.1:8080/AgileOfficeScraperServices'
                - proxy_set_header: Host $host
                - proxy_set_header: X-Real-IP $remote_addr
                - proxy_set_header: X-Forwarded-For $proxy_add_x_forwarded_for

              - location /:
                - uwsgi_pass: 127.0.0.1:3015
                - uwsgi_read_timeout: 120
                - uwsgi_send_timeout: 120
                - include: /etc/nginx/uwsgi_params
