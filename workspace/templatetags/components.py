from django import template
from junar.core.models import *
from junar.core.docs import DB, DS
from django.conf import settings
from junar.core.choices import *
from junar.core.forms import MetaForm
from junar.workspace.manageDataviews.forms import CreateDataStreamForm

register = template.Library()

def createDashboard(userId, dashboardId, auth_manager, meta_data = None):
    is_update       = False
    user_id         = None
    dashboard       = None
    dashboard_form  = None
    dashboard_id    = None
    meta_form       = ""

    user_id         = userId
    dashboard_id    = dashboardId

    if dashboard_id:
        is_update = True
        dashboard_revision = DB(dashboard_id, auth_manager.language)
        categories = CategoryI18n.objects.filter(language=auth_manager.language, category__account=auth_manager.account_id).values('category__id', 'name')

        dashboard_form = UpdateDashboardForm(initial={'dashboard_revision_id' : dashboard_id
                                                      ,'title' : dashboard_revision.title
                                                      , 'description' : dashboard_revision.description
                                                      , 'category' : dashboard_revision.category_id
                                                      , 'is_private' : False}, prefix='dashboard')

        if meta_data:
            meta_form = MetaForm(metadata=meta_data)
            if dashboard_revision.metadata != "":
                meta_form.set_values(dashboard_revision.metadata)

    else:
        dashboard_form = CreateDashboardForm(prefix='dashboard')
        categories = CategoryI18n.objects.filter(language=auth_manager.language, category__account=auth_manager.account_id).values('category__id', 'name')

        if auth_manager.is_level('level_5'):
            meta_data = Account.objects.get(pk = auth_manager.account_id).meta_data

        if meta_data:
            meta_form = MetaForm(metadata=meta_data)

    return { 'dashboard_form' : dashboard_form
            , 'auth_manager': auth_manager
            , 'meta_fields' : meta_form
            , 'categories' : categories
            , 'is_update' : is_update }

register.inclusion_tag('dashboard_manager/createDashboard.html')(createDashboard)

def dataStreamForm(is_update_selection, datastream_revision_id, dataset_revision_id, auth_manager, preferences = None, meta_data = None):
    is_update = False
    meta_form = ""
    account_id = None
    categories = None
    datastream_form = None
    datastream_tags = None
    datastream_sources = None
    datastream_revision = None

    if datastream_revision_id:
        is_update = True
        categories = CategoryI18n.objects.filter(language=auth_manager.language, category__account=auth_manager.account_id).values('category__id', 'name')
        datastream_revision = DS(datastream_revision_id, auth_manager.language)


        if preferences:
            account_id = preferences['account_id']
            account = Account.objects.get(pk = account_id)
            if account.level.code != 'level_5':
                account_id = None

        if meta_data:
            meta_form = MetaForm(metadata=meta_data)
            meta_form.set_values(datastream_revision.metadata)

        if datastream_revision:
            if is_update_selection:
                dataset_revision = DatasetRevision.objects.filter(dataset__id= datastream_revision.dataset_id)[0]
                datastream_form = UpdateDataStreamSelectionForm(initial={'dataset_revision_id' : dataset_revision.id
                                                                        ,'datastream_revision_id' : datastream_revision.datastreamrevision_id
                                                                        ,'title' : datastream_revision.title
                                                                        , 'description' : datastream_revision.description
                                                                        , 'category' : datastream_revision.category_id
                                                                        , 'is_private' : False}, prefix='datastream')
            else:
                datastream_form = UpdateDataStreamForm(initial={'datastream_revision_id' : datastream_revision.datastreamrevision_id
                                                                ,'title' : datastream_revision.title
                                                                , 'description' : datastream_revision.description
                                                                , 'category' : datastream_revision.category_id
                                                                , 'is_private' : False}, prefix='datastream')

    if dataset_revision_id:
        if auth_manager.is_level('level_5'):
            meta_data = Account.objects.get(pk = auth_manager.account_id).meta_data
            if meta_data:
                meta_form = MetaForm(metadata=meta_data)

        dataset_revision = DatasetRevision.objects.get(pk= dataset_revision_id)
        end_point = dataset_revision.end_point
        type = dataset_revision.dataset.type
        impl_type = dataset_revision.impl_type

        datastream_form = CreateDataStreamForm(initial={'dataset_revision_id' : dataset_revision_id}, prefix='datastream')
        categories = CategoryI18n.objects.filter(language=auth_manager.language, category__account=auth_manager.account_id).values('category__id', 'name')

        datastream_tags = []
        datastream_sources = []

        choices = STATUS_CHOICES

    return { 'datastream_revision' : datastream_revision
            , 'datastream_form': datastream_form
            , 'datastream_tags': datastream_tags
            , 'datastream_sources': datastream_sources
            , 'auth_manager': auth_manager
            , 'meta_form' : meta_form
            , 'categories' : categories
            , 'is_update' : is_update
            , 'is_update_selection' : is_update_selection
            , 'choices': choices}

register.inclusion_tag('view_manager/dataStreamForm.html')(dataStreamForm)


def get_activity_type(activity):

    from junar.core.choices import ActionStreams
    activity_name=""
    if int(activity) == (ActionStreams.CREATE):
        activity_name = ugettext_lazy('LANDINGPAGE-ACTIVITY-HASCREATED')
    elif int(activity) == int(ActionStreams.DELETE):
        activity_name = ugettext_lazy('LANDINGPAGE-ACTIVITY-HASDELETED')
    elif int(activity) == int(ActionStreams.PUBLISH):
        activity_name = ugettext_lazy('LANDINGPAGE-ACTIVITY-HASPUBLISHED')
    elif int(activity) == int(ActionStreams.UNPUBLISH):
        activity_name = ugettext_lazy('LANDINGPAGE-ACTIVITY-HASUNPUBLISHED')

    return activity_name

register.assignment_tag(get_activity_type)