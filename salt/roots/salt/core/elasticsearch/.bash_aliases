# ejemplo:
#	es_search -d '{"django_id": 66891}'
#
alias es_search="curl -XGET 'localhost:9200/datal/'"
alias es_showall="curl -XGET 'localhost:9200/datal/_search?pretty'"
alias es_mapping="curl -XGET 'localhost:9200/datal/_mapping"

alias microsites="python manage.py runserver 0.0.0.0:3015 --settings=microsites.settings"
alias microsites-shell="python manage.py shell --settings=microsites.settings"

alias workspace="python manage.py runserver 0.0.0.0:3015 --settings=workspace.settings"
alias workspace-shell="python manage.py shell --settings=workspace.settings"

alias reindex="python manage.py index --settings=workspace.settings --re-index"
