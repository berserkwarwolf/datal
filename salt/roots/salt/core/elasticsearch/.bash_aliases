# ejemplo:
#	es_search -d '{"django_id": 66891}'
#
alias es_search="curl -XGET 'localhost:9200/datal/'"
alias es_showall="curl -XGET 'localhost:9200/datal/_search?pretty'"
alias es_mapping="curl -XGET 'localhost:9200/datal/_mapping"
