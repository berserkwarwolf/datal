#remove_old_indextank:
#  file.directory:
#    - name: /usr/share/indextank-engine
#    - clean: True

git:
  pkg:
    - installed
python-git:
  pkg:
    - installed
python-dev:
  pkg:
    - installed

elasticsearch-ubuntu:
  pkgrepo.managed:
    - humanname: ElasticSearch PPA
    - name: deb http://packages.elastic.co/elasticsearch/1.6/debian stable main
    - dist: stable
    - file: /etc/apt/sources.list.d/elasticsearch.list
    - key_url: https://packages.elastic.co/GPG-KEY-elasticsearch
    - require_in:
      - pkg: elasticsearch

  pkg.latest:
    - name: elasticsearch
    - refresh: True

elasticsearch:
  pkg:
    - installed
  cmd.run:
    - cwd: /
    - name: update-rc.d elasticsearch defaults 95 10


