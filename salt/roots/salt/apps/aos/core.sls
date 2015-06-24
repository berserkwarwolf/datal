remove_wars:
  file.absent:
    - names:
      - /var/lib/tomcat7/webapps/microsites/
      - /var/lib/tomcat7/webapps/workspace/

extract_war:
  archive.extracted:
    - names:
      - /var/lib/tomcat7/webapps/microsites/AgileOfficeServer/
      - /var/lib/tomcat7/webapps/workspace/AgileOfficeServer/
    - source: salt://apps/aos/war/AgileOfficeServer.war
    - archive_format: zip
    - if_missing: /var/lib/tomcat7/webapps/microsites/AgileOfficeServer

extract_services_war:
  archive.extracted:
    - names:
      - /var/lib/tomcat7/webapps/workspace/AgileOfficeScraperServices/
    - source: salt://apps/aos/war/AgileOfficeScraperServices.war
    - archive_format: zip
    - if_missing: /var/lib/tomcat7/webapps/workspace/AgileOfficeScraperServices

microsites_config:
  file.managed:
    - name: /var/lib/tomcat7/webapps/microsites/AgileOfficeServer/WEB-INF/conf/config.properties
    - source: salt://apps/aos/microsites_config.properties
    - template: jinja

microsites_queries:
  file.managed:
    - name: /var/lib/tomcat7/webapps/microsites/AgileOfficeServer/WEB-INF/conf/queries.properties
    - source: salt://apps/aos/microsites_queries.properties
    - template: jinja

workspace_config:
  file.managed:
    - name: /var/lib/tomcat7/webapps/workspace/AgileOfficeServer/WEB-INF/conf/config.properties
    - source: salt://apps/aos/workspace_config.properties
    - template: jinja

workspace_queries:
  file.managed:
    - name: /var/lib/tomcat7/webapps/workspace/AgileOfficeServer/WEB-INF/conf/queries.properties
    - source: salt://apps/aos/workspace_queries.properties
    - template: jinja

workspace_commons_xml:
  file.managed:
    - name: /var/lib/tomcat7/webapps/workspace/AgileOfficeServer/WEB-INF/conf/commons.xml
    - source: salt://apps/aos/commons.xml

microsites_commons_xml:
  file.managed:
    - name: /var/lib/tomcat7/webapps/microsites/AgileOfficeServer/WEB-INF/conf/commons.xml
    - source: salt://apps/aos/commons.xml

tomcat_conf:
  file.managed:
    - name: /var/lib/tomcat7/conf/server.xml
    - source: salt://apps/aos/server.xml
    - template: jinja

tomcat-service:
  service.running:
    - name: tomcat7
    - enable: True
    - watch:
      - file: /var/lib/tomcat7/webapps/microsites/AgileOfficeServer/WEB-INF/conf/config.properties
      - file: /var/lib/tomcat7/webapps/microsites/AgileOfficeServer/WEB-INF/conf/queries.properties
      - file: /var/lib/tomcat7/webapps/workspace/AgileOfficeServer/WEB-INF/conf/config.properties
      - file: /var/lib/tomcat7/webapps/workspace/AgileOfficeServer/WEB-INF/conf/queries.properties
      - file: /var/lib/tomcat7/webapps/workspace/AgileOfficeServer/WEB-INF/conf/commons.xml
      - file: /var/lib/tomcat7/webapps/microsites/AgileOfficeServer/WEB-INF/conf/commons.xml
      - file: /var/lib/tomcat7/conf/server.xml

wait-for-tomcatmanager:
  tomcat.wait:
    - timeout: 300
    - require:
      - service: tomcat-service
