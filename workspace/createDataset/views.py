from django.conf import settings
from django.utils.translation import ugettext
from django.http import HttpResponse
from django.http import Http404
from core.models import CategoryI18n
from core.choices import *
from core.shortcuts import render_to_response
from core.auth.decorators import login_required
from workspace.manageDatasets.forms import CreateDatasetForm
from core.lifecycle.datasets import DatasetLifeCycleManager

@login_required
def index(request, type="index"):

    account_id = request.auth_manager.account_id
    credentials = request.auth_manager
    language = request.auth_manager.language
    categories = CategoryI18n.objects.filter(language=language, category__account=account_id).values('category__id', 'name')

    status_options=credentials.get_allowed_actions()
    #return HttpResponse("OPTIONS %s" % str(status_options))
    form = CreateDatasetForm(status_options=status_options)

    url = 'createDataset/{0}.html'.format(type)

    return render_to_response(url, locals())

def edit(request, revision_id):

    account_id = request.auth_manager.account_id
    credentials = request.auth_manager
    language = request.auth_manager.language
    categories = CategoryI18n.objects.filter(language=language, category__account=account_id).values('category__id', 'name')
    status_options=credentials.get_allowed_actions()

    dataset_life = DatasetLifeCycleManager(user_id=request.auth_manager.id, dataset_revision_id=revision_id)
    dataset_dict = dataset_life.dataset_revision.get_dict()
    dtype = {0: 'file', 1: 'url', 2: 'webservice'}[dataset_life.dataset.type]

    url = 'editDataset/{0}.html'.format(dtype) # url | webservice | file

    return render_to_response(url, locals())