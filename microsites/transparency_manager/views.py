from django.shortcuts import render_to_response
from core.models import *
from core.helpers import slugify
from django.http import Http404 # HttpResponse
from core.communitymanagers import *
from microsites.home_manager.managers import HomeFinder

def action_view(request):
    """ show transparency categories """

    if not hasattr(request, 'account'):
        raise Http404

    # auth_manager = request.auth_manager
    account = request.account


    categories_ids = account.get_preference('account.transparency.categories').split()
    #categories = ",".join(account.get_preference('account.transparency.categories').split())
    categories = Category.objects.get_for_transparency(account)

    categ_ids = []
    categ_names = []
    for category in categories:
        categ_ids.append(category["id"])
        categ_names.append(category["name"])

    results, search_time, facets = FinderManager(HomeFinder).search(max_results = 250
                                                        ,account_id = account.id
                                                        ,category_filters = {"id": categories_ids}
                                                        ,resource = ['ds', 'db', 'chart', 'dt'] # TODO "all" is default and just ds + db + chart, NOT dt (datasets)
                                                        # ,category_id = categ_ids
                                                        # ,category_name = categ_names
                                                        )
    for c in categories:
        c["sets"] = []
        c["total"] = 0

    for doc in results:
        """ sample data:
            {"category": "Salud"
            , "permalink": "/datastreams/79733/fiscalizaciones-ley-de-tabaco-region-de-coquimbo/"
            , "account_id": 2
            , "tipo": "dataview"
            , "title": u"Fiscalizaciones Ley de Tabaco Regi\xf3n de Coquimbo"
            , "titulo": u"Fiscalizaciones Ley de Tabaco Regi\xf3n de Coquimbo"
            , "created_at": datetime.datetime(2013, 11, 25, 11, 48, 31)
            , "type": "DS"
            , "id": "79733"},
        """

        # Our transparency.css styles uses this names
        # TODO: implement de DE as dataset when we save to searchify
        doc["tipo"] = {'DS': 'dataview','CHART': 'visualization','DB':'dashboard', 'DT': 'dataset'}.get(doc["type"], 'dataview')

        # buid download url for datasets
        if doc["type"] == "DT":
            doc["permalink"] = "/datasets/%s-%s.download" % (doc["id"], slugify(doc["title"]))

        doc["titulo"] = doc["title"]
        for c in categories:
            if c["name"] == doc["category"]:
                c["sets"].append(doc)
                c["total"] = c["total"] + 1

    # we need no more than four colums
    column_data = [[], [], [], []] # each column
    for counter, c in enumerate(categories):
        col_id = counter % 4
        column_data[col_id].append(c)

    preferences = account.get_preferences()
    keys = ['account.domain', 'account.page.titles', 'account.email', 'account.name', 'account.favicon', 'branding.header', 'branding.footer','enable.junar.footer', 'account.language', 'account.logo', 'account.header.uri', 'account.header.height', 'account.footer.uri', 'account.footer.height', 'account.enable.sharing']
    preferences.load(keys)

    return render_to_response('viewTransparency/index.html', locals())