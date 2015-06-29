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

#Instala elasticsearch, crea los init.d y lo mete en todos los rc
elasticsearch:
  pkg:
    - installed
  cmd.run:
    - cwd: /
    - name: update-rc.d elasticsearch defaults 95 10 ; update-rc.d elasticsearch enable

# no sé por qué no puede crear este directorio
# aunque... al reiniciar se pierde
/run/elasticsearch/:
  file.directory:
    - user: elasticsearch
    - group: elasticsearch
    - mode: 755
    - makedirs: True

#alias para facilitar el debug
elasticsearch_alias:
   file.managed:
     - source: salt://core/haystack/.bash_aliases
     - name: /home/vagrant/.bash_aliases 
     - mode: 644
     - user: vagrant
     - group: vagrant

