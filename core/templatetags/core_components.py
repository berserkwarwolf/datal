from django import template
from django.forms.formsets import formset_factory
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse

from core.auth import forms as auth_forms
from core.models import ObjectGrant

register = template.Library()


@register.filter(name="permalink")
def permalink(pk, obj_type):
    if obj_type == 'dataset':
        return reverse(
            'manageDatasets.action_view',
            'microsites.urls',
            kwargs={'dataset_id': pk, 'slug': '-'}
        )
    elif obj_type == 'datastream':
        return reverse(
            'manageDataviews.action_view',
            'microsites.urls',
            kwargs={'id': pk, 'slug': '-'}
        )
    elif obj_type == 'visualization':
        return reverse(
            'manageVisualizations.action_view',
            'workspace.urls',
            kwargs={'id': pk, 'slug': '-'}
        )
    else:
        return None


@register.filter(name="download")
def download(dataset_revision):
    """
    Devuelve la url de descarga del dataset
    :param dataset:
    :return:
    """
    return reverse('dataset_manager.action_download', 'microsites.urls',
                   kwargs={'dataset_id': str(dataset_revision['dataset_id']), 'slug': dataset_revision['slug']})


def datatable_search(table_prefix=''):
    return {'table_prefix': table_prefix}
register.inclusion_tag('datatable_manager/search_widget.html')(datatable_search)


def datatable_mass(auth_manager=None, table_prefix=''):
    return {'auth_manager': auth_manager, 'table_prefix': table_prefix}
register.inclusion_tag('datatable_manager/mass_widget.html')(datatable_mass)


def datatable_pagination(revisions=None, table_prefix=''):
    return {'revisions': revisions, 'table_prefix': table_prefix}
register.inclusion_tag('datatable_manager/pagination_widget.html')(datatable_pagination)


def datatable_filter(categories=None, table_prefix='', tab_prefix='', source_choices=None, choices=None,
                     auth_manager=None, **kwargs):
    filter_button_template = None
    filter_button_file = 'filter_button.html'
    extra_filters_template = None
    extra_filters_file = 'extra_filters.html'
    override_filters = False
    filter_template = None

    if kwargs.has_key('featured_accounts'):
        featured_accounts = kwargs['featured_accounts']

    if tab_prefix == 'collect' and table_prefix == 'dataset':
        base_route = 'dataset_manager/dataset/'
        filter_button_template = base_route + filter_button_file

    if tab_prefix == 'enhance' and table_prefix == 'datastream':
        base_route = 'resource_manager/datastream/'
        filter_button_template = base_route + filter_button_file

    if tab_prefix == 'enhance' and table_prefix == 'dashboard':
        base_route = 'resource_manager/dashboard/'
        filter_button_template = base_route + filter_button_file

    if tab_prefix == 'publish' and table_prefix == 'dataset':
        base_route = 'review_manager/dataset/'
        extra_filters_template = base_route + extra_filters_file

    if tab_prefix == 'publish' and table_prefix == 'datastream':
        base_route = 'review_manager/datastream/'
        extra_filters_template = base_route + extra_filters_file

    if tab_prefix == 'publish' and table_prefix == 'dashboard':
        base_route = 'review_manager/dashboard/'
        extra_filters_template = base_route + extra_filters_file

    if tab_prefix == 'publish' and table_prefix == 'visualization':
        base_route = 'review_manager/visualization/'
        extra_filters_template = base_route + extra_filters_file

    if tab_prefix == 'microsites' and table_prefix == 'home':
        base_route = 'home_manager/resources/'
        override_filters = True
        filter_template = base_route + 'filter.html'
        extra_filters_template = base_route + extra_filters_file

    return locals()
register.inclusion_tag('datatable_manager/filter_widget.html')(datatable_filter)


def datatable(revisions=None, categories=None, table_prefix='', tab_prefix='', auth_manager=None):

    header_template = None
    table_body_template = None
    row_button_template = None
    row_data_template = None

    header_file = 'datatable_header.html'
    table_body_file = 'table_body.html'
    row_button_file = 'row_buttons.html'
    row_data_file = 'row_data.html'

    if tab_prefix == 'collect':
        base_route = 'dataset_manager/' + table_prefix + '/'
        header_template = base_route + header_file
        row_button_template = base_route + row_button_file
        row_data_template = base_route + row_data_file
        table_body_template = base_route + table_body_file
    if tab_prefix == 'dataset_overlay':
        base_route = 'resource_manager/' + table_prefix + '/'
        header_template = base_route + header_file
        row_button_template = base_route + row_button_file
        row_data_template = base_route + row_data_file
        table_body_template = base_route + table_body_file
    elif tab_prefix == 'enhance':
        base_route = 'resource_manager/' + table_prefix  + '/'
        header_template = base_route + header_file
        table_body_template = base_route + table_body_file
        row_button_template = base_route + row_button_file
        row_data_template = base_route + row_data_file

    elif tab_prefix == 'publish':
        base_route = 'review_manager/' + table_prefix + '/'
        header_template = base_route + header_file
        table_body_template = base_route + table_body_file
        row_button_template = base_route + row_button_file
        row_data_template = base_route + row_data_file

    elif tab_prefix == 'reports':
        base_route = 'reports_manager/' + table_prefix + '/'
        header_template = base_route + header_file
        table_body_template = base_route + table_body_file
        row_data_template = base_route + row_data_file

    elif tab_prefix == 'home':
        base_route = 'home_manager/' + table_prefix + '/'
        header_template = base_route + header_file
        table_body_template = base_route + table_body_file
        row_data_template = base_route + row_data_file
    elif tab_prefix == 'activity_stream':
        base_route = 'viewLandingPage/' + table_prefix + '/'
        header_template = base_route + header_file
        table_body_template = base_route + table_body_file
        row_data_template = base_route + row_data_file

    return locals()
register.inclusion_tag('datatable_manager/datatable.html')(datatable)


def overlayDialog(parser, token):

    nodelist = parser.parse(('endoverlay',))
    parser.delete_first_token()

    try:
        l_tag_name, l_overlayId = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError("%r tag requires a single argument" % token.contents[0])

    return OverlayNode(nodelist, l_overlayId)


class OverlayNode(template.Node):
    def __init__(self, nodelist, pName):
        self.nodelist = nodelist
        self.name = pName

    def render(self, context):
        output = self.nodelist.render(context)
        return render_to_string('overlays/overlay.html', {'content': output, 'overlayId' : self.name})
register.tag('overlay', overlayDialog)


def privateDataStreamShareForm(datastream_id=None, auth_manager=None):

    private_share_form = auth_forms.PrivateDataStreamShareForm(prefix='private_share_form', initial={'id': datastream_id})
    collaborators = ObjectGrant.objects.get_collaborators(datastream_id, 'datastream')
    collaborator_formset = formset_factory(auth_forms.CollaboratorForm, extra=0)
    collaborator_forms = collaborator_formset(prefix='private_share_form_collaborators', initial=collaborators)
    available_users = ObjectGrant.objects.get_available_users(datastream_id, 'datastream', auth_manager.account_id)
    return locals()
register.inclusion_tag('auth/privateShareForm.html')(privateDataStreamShareForm)


def privateDashboardShareForm(dashboard_id=None, auth_manager=None):

    private_share_form = auth_forms.PrivateDashboardShareForm(prefix='private_share_form', initial={'id': dashboard_id})
    collaborators = ObjectGrant.objects.get_collaborators(dashboard_id, 'dashboard')
    collaborator_formset = formset_factory(auth_forms.CollaboratorForm, extra=0)
    collaborator_forms = collaborator_formset(prefix='private_share_form_collaborators', initial=collaborators)
    available_users = ObjectGrant.objects.get_available_users(dashboard_id, 'dashboard', auth_manager.account_id)
    return locals()
register.inclusion_tag('auth/privateShareForm.html')(privateDashboardShareForm)


def privateVisualizationShareForm(visualization_id=None, auth_manager=None):

    private_share_form = auth_forms.PrivateVisualizationShareForm(prefix='private_share_form', initial={'id': visualization_id})
    collaborators = ObjectGrant.objects.get_collaborators(visualization_id, 'visualization')
    collaborator_formset = formset_factory(auth_forms.CollaboratorForm, extra=0)
    collaborator_forms = collaborator_formset(prefix='private_share_form_collaborators', initial=collaborators)
    available_users = ObjectGrant.objects.get_available_users(visualization_id, 'visualization', auth_manager.account_id)
    return locals()
register.inclusion_tag('auth/privateShareForm.html')(privateVisualizationShareForm)
