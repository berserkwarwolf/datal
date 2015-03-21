import json

def request_context(request):
    obj = {}
    if hasattr(request, 'account'):
        account = request.account
        path = request.path
        obj = {'tracking_id': account.get_preference('account.ga.tracking')}
        ga_obj = account.get_preference('account.ga')
        if ga_obj == '':
            ga_obj = '{}'
        if path == '/':
            if 'dashboard_view' in json.loads(ga_obj):
                final = {}
                final['dashboard_view'] = json.loads(ga_obj)['dashboard_view']
                obj.update({'ga': json.dumps(final)})
        elif 'dashboards' in path and 'embed' not in path:
            if 'dashboard_view' in json.loads(ga_obj):
                final = {}
                final['dashboard_view'] = json.loads(ga_obj)['dashboard_view']
                obj.update({'ga': json.dumps(final)})
        elif 'visualizations' in path and 'embed' not in path:
            if 'dataview_view' in json.loads(ga_obj):
                final = {}
                final['dataview_view'] = json.loads(ga_obj)['dataview_view']
                obj.update({'ga': json.dumps(final)})
        elif 'datastreams' in path and 'embed' not in path:
            if 'dataview_view' in json.loads(ga_obj):
                final = {}
                final['dataview_view'] = json.loads(ga_obj)['dataview_view']
                obj.update({'ga': json.dumps(final)})
        elif 'search' in path:
            if 'search_view' in json.loads(ga_obj):
                final = {}
                final['search_view'] = json.loads(ga_obj)['search_view']
                obj.update({'ga': json.dumps(final)})
        else:
            obj = {}
    return obj