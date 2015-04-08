from django.core.urlresolvers import reverse
from django.db import connection
from django.http import HttpResponse, Http404
from django.utils.translation import ugettext
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from core.auth.decorators import login_required, privilege_required
from core.accounts.decorators import threshold
from core.choices import TicketChoices, EventChoices, EVENT_CHOICES, StatusChoices
from core.models import *
from core.shortcuts import render_to_response
from core.lib import mailchimp_lib
from core.lib.datastore import *
from core.lib.searchify import SearchifyIndex
from core.helpers import get_domain_with_protocol
from workspace.admin_manager import forms
from core.helpers import generate_ajax_form_errors

import random
import logging
import json
from uuid import uuid4
import urllib
import re

@login_required
@privilege_required('workspace.can_access_admin')
def action_info(request):
    account = request.auth_manager.get_account()
    preferences = account.get_preferences()
    keys = [
        'account.name', 
        'account.link',
        'account.contact.person.name',
        'account.contact.person.email',
        'account.contact.person.phone', 
        'account.contact.person.country',
        'account.contact.dataperson.email'
    ]

    form = forms.AccountInfoForm(initial=get_initial(account, keys))
    account_info = True
    return render_to_response('admin_manager/info.html', locals())

@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
@csrf_exempt
def action_info_update(request):

    form = forms.AccountInfoForm(request.POST)
    if form.is_valid():
        account = request.auth_manager.get_account()

        preferences = {}
        form_fields_keys = form.fields.keys()
        for field_key in form_fields_keys:
            key = field_key.replace('_', '.')
            value = form.cleaned_data[field_key]
            account.set_preference(key, value)

        return HttpResponse(json.dumps({'status': 'ok', 'messages': [ugettext('APP-SETTINGS-SAVE-OK-TEXT')]}), content_type='application/json')

    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)

@login_required
@privilege_required('workspace.can_access_admin')
def action_users(request):
    auth_manager = request.auth_manager
    preferences = auth_manager.get_account().get_preferences()
    roles = ['ao-publisher', 'ao-enhancer', 'ao-account-admin']
    form = forms.UserForm(roles)
    users = User.objects.values('id', 'name', 'nick', 'last_visit', 'email', 'roles__name', 'roles__code').filter(account = auth_manager.account_id, roles__code__in = roles).all()
    users = [ user for user in users if user['roles__code'] in roles ]
    return render_to_response('admin_manager/users.html', locals())

@login_required
@privilege_required('workspace.can_access_admin')
@threshold("workspace.create_user_limit")
@require_POST
def action_create_user(request):
    logger = logging.getLogger(__name__)
    roles = ['ao-publisher', 'ao-enhancer', 'ao-account-admin']
    form = forms.UserForm(roles, request.POST)
    if form.is_valid():
        auth_manager = request.auth_manager

        user = User.objects.create(account_id = auth_manager.account_id
                                   , name = form.cleaned_data['name']
                                   , nick = form.cleaned_data['username']
                                   , email = form.cleaned_data['email']
                                   , language = auth_manager.language)

        role_code = form.cleaned_data['role']
        role = Role.objects.get(code = role_code)
        user.roles.add(role)

        if role_code in ['ao-enhancer', 'ao-publisher']:
            if auth_manager.is_level('level_4'):
                role = Role.objects.get(code = role_code+'-plus')
                user.roles.add(role)

            if auth_manager.is_level('level_5'):
                role = Role.objects.get(code = role_code+'-premier')
                user.roles.add(role)

        # to activate the user
        user_pass_ticket = UserPassTickets.objects.create(uuid = unicode(uuid4())
                                       , user = user
                                       , type = TicketChoices.USER_ACTIVATION)

        account = auth_manager.get_account()
        preferences = account.get_preferences()

        adminname = auth_manager.nick
        company = preferences['account_name']
        if preferences['account_purpose'] != 'private':
            domain = get_domain_with_protocol('workspace')
        else:
            domain = 'http://' + preferences['account_domain']

        link = domain + reverse('accounts.activate') + '?' + urllib.urlencode({'ticket': user_pass_ticket.uuid})
        language = auth_manager.language

        logger.debug('[mailchimp_workspace_users_list_subscribe] %s', user)
        country = preferences['account.contact.person.country']
        extradata = {'country': country, 'company': company}
        suscription = mailchimp_lib.workspace_users_list_subscribe(user, language, extradata)

        # workspace_user_activation_email_campaign_send(user.email, user.name, adminname, company, link, language)
        mergetags = {'FNAME': user.name, 'ADMINNAME': adminname, 'COMPANY': company}
        mailchimp_lib.account_administrators_welcome_email_campaign_send(user, link, mergetags)

        response = {'status': 'ok', 'messages': [ugettext('APP-USER-CREATEDSUCCESSFULLY-TEXT')]}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)

@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
def action_edit_user(request):
    roles = ['ao-publisher', 'ao-enhancer', 'ao-account-admin']
    form = forms.UserForm(roles, request.POST)
    if form.is_valid():
        auth_manager = request.auth_manager
        user = User.objects.get(id = form.cleaned_data['id']
                                , account = auth_manager.account_id)

        user.name = form.cleaned_data['name']
        user.nick = form.cleaned_data['username']
        user.email = form.cleaned_data['email']
        user.save()

        user.roles.clear()
        role_code = form.cleaned_data['role']
        role = Role.objects.get(code = role_code)
        user.roles.add(role)

        if role_code in ['ao-enhancer', 'ao-publisher']:
            if auth_manager.is_level('level_4'):
                role = Role.objects.get(code = role_code+'-plus')
                user.roles.add(role)

            if auth_manager.is_level('level_5'):
                role = Role.objects.get(code = role_code+'-premier')
                user.roles.add(role)

        response = {'status': 'ok', 'messages': [ugettext('APP-USER-UPDATEDSUCCESSFULLY-TEXT')]}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)

@login_required
@privilege_required('workspace.can_access_admin')
def action_branding(request):
    account = request.auth_manager.get_account()
    preferences = account.get_preferences()
    keys = [
        'account.page.titles', 
        'account.header.uri', 
        'account.header.height', 
        'account.footer.uri', 
        'account.footer.height', 
        'account.favicon',
        'account.title.color', 
        'account.button.bg.color', 
        'account.button.border.color', 
        'account.button.font.color', 
        'account.mouseover.bg.color', 
        'account.mouseover.border.color', 
        'account.mouseover.title.color', 
        'account.mouseover.text.color', 
        'account.header.bg.color', 
        'account.header.border.color',
        'account.logo'
    ]

    form = forms.AccountBrandingForm(initial=get_initial(account, keys))
    updateCache = random.random()
    branding = True
    return render_to_response('admin_manager/branding.html', locals())

@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
@csrf_exempt
def action_branding_update(request):

    logger = logging.getLogger(__name__)

    form = forms.AccountBrandingForm(request.POST)

    if form.is_valid():

        urls = {}

        account = request.auth_manager.get_account()

        form_fields_keys = form.fields.keys()
        form_fields_keys.remove('account_favicon')
        form_fields_keys.remove('account_logo')

        for field_key in form_fields_keys:
            key     = field_key.replace('_', '.')
            value   = form.cleaned_data[field_key]
            account.set_preference(key, value)

        if request.FILES.has_key('account_favicon'):
            data = request.FILES['account_favicon']
            accountid = str(request.auth_manager.account_id)
            keyname = "%s/%s" %(accountid[::-1], 'favicon')
            active_datastore.save_to_s3(settings.AWS_CDN_BUCKET_NAME, keyname, data)
            value = get_domain_with_protocol('cdn') + '/' + keyname
            account.set_preference('account.favicon', value)
            urls['id_account_favicon'] = value

        if request.FILES.has_key('account_logo'):
            data = request.FILES['account_logo']
            accountid = str(request.auth_manager.account_id)
            keyname = "%s/%s" %(accountid[::-1], 'logo')
            active_datastore.save_to_s3(settings.AWS_CDN_BUCKET_NAME, keyname, data)
            value = get_domain_with_protocol('cdn') + '/' + keyname
            account.set_preference('account.logo', value)
            urls['id_account_logo'] = value

        is_ie = False
        if request.META.has_key('HTTP_USER_AGENT'):
            user_agent = request.META['HTTP_USER_AGENT']
            pattern = "msie [1-9]\."
            prog = re.compile(pattern, re.IGNORECASE)
            match = prog.search(user_agent)
            if match:
                is_ie = True

        if is_ie == True:
            return HttpResponse(json.dumps({'status': 'ok', 'messages': [ugettext('APP-SETTINGS-SAVE-OK-TEXT')], 'urls': urls}), content_type='text/plain')
        else:
            return HttpResponse(json.dumps({'status': 'ok', 'messages': [ugettext('APP-SETTINGS-SAVE-OK-TEXT')], 'urls': urls}), content_type='application/json')

    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)

@login_required
@privilege_required('workspace.can_access_admin')
def action_social(request):
    account = request.auth_manager.get_account()
    preferences = account.get_preferences()
    keys = ['account.comments', 'enable.embed.options', 'account.enable.sharing', 'account.enable.notes', 'account.dataset.download']
    form = forms.AccountSocialForm(initial=get_initial(account, keys))
    social = True
    return render_to_response('admin_manager/social.html', locals())

@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
def action_social_update(request):

    form = forms.AccountSocialForm(request.POST)
    if form.is_valid():
        account = request.auth_manager.get_account()

        for field_key in form.fields.keys():
            key = field_key.replace('_', '.')
            value = form.cleaned_data[field_key]
            value = value and value or ''
            account.set_preference(key, value)

        return HttpResponse(json.dumps({'status': 'ok', 'messages': [ugettext('APP-SETTINGS-SAVE-OK-TEXT')]}), content_type='application/json')
    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)

@login_required
@privilege_required('workspace.can_access_admin')
def action_domain(request):
    default_domain = '.' + settings.DOMAINS['microsites']
    account = request.auth_manager.get_account()
    preferences = account.get_preferences()
    keys = ['account.domain', 'account.api.domain', 'account.transparency.domain']

    initial=get_initial(account, keys)

    if initial['account_domain'].endswith(default_domain):
        initial['pick_a_domain'] = 'internal'
        initial['account_domain_internal'] = initial['account_domain'].replace(default_domain, '')
    else:
        initial['pick_a_domain'] = 'external'
        initial['account_domain_external'] = initial['account_domain']

    form = forms.AccountDomainForm(initial)
    return render_to_response('admin_manager/domain.html', locals())

@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
def action_domain_update(request):

    form = forms.AccountDomainForm(request.POST)
    if form.is_valid():
        account = request.auth_manager.get_account()

        for field_key in ['account_domain', 'account_api_domain', 'account_transparency_domain']:
            key = field_key.replace('_', '.')
            value = form.cleaned_data[field_key]
            account.set_preference(key, value)

        return HttpResponse(json.dumps({'status': 'ok', 'messages': [ugettext('APP-SETTINGS-SAVE-OK-TEXT')]}), content_type='application/json')
    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)


@login_required
@privilege_required('workspace.can_access_admin')
def action_categories(request):
    logger = logging.getLogger(__name__)
    auth_manager = request.auth_manager
    account = auth_manager.get_account()
    preferences = account.get_preferences()
    form = forms.CategoryEditForm()
    categories = Category.objects.values('id', 'categoryi18n__name', 'categoryi18n__description').filter(account = auth_manager.account_id, categoryi18n__language = auth_manager.language)

    # for block the "delete" button on transparency categories
    used_transparency_categories = preferences['account.transparency.categories'].split()

    try: default_category = int(preferences['account.default.category'])
    except: default_category = None
    return render_to_response('admin_manager/categories.html', locals())


@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
def action_create_category(request):
    form = forms.CategoryCreateForm(request.POST)
    if form.is_valid():
        auth_manager = request.auth_manager
        category_name = form.cleaned_data['name']
        category = Category.objects.create(account_id = auth_manager.account_id)
        categoryi18n = CategoryI18n.objects.create(category = category
                                                   , name = category_name
                                                   , description = form.cleaned_data['description']
                                                   , language = auth_manager.language)

        is_default = form.cleaned_data['is_default']
        account = auth_manager.get_account()
        if is_default:
            account.set_preference('account.default.category', category.id)

        response = {'status': 'ok', 'messages': [ugettext('APP-CATEGORY-CREATEDSUCCESSFULLY-TEXT')]}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)

@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
def action_edit_category(request):
    form = forms.CategoryEditForm(request.POST)
    if form.is_valid():
        auth_manager = request.auth_manager
        account = auth_manager.get_account()
        category_id = form.cleaned_data['id']

        # check if it's a transparency category
        used_transparency_categories = account.get_preference('account.transparency.categories').split()
        if category_id in used_transparency_categories:
            response = {'status': 'error', 'messages': [ugettext('APP-CATEGORY-TRANSPARENCY-CANT-BE-EDITED')]}
            return HttpResponse(json.dumps(response), content_type='application/json', status=400)

        categoryi18n = CategoryI18n.objects.get(category_id = category_id
                                                , category__account = auth_manager.account_id
                                                , language = auth_manager.language)
        categoryi18n.name = form.cleaned_data['name']
        categoryi18n.description = form.cleaned_data['description']
        categoryi18n.save()

        # reindexing
        reindex_category_resources(category_id, auth_manager.language)

        is_default = form.cleaned_data['is_default']

        try: default_category = int(account.get_preference('account.default.category'))
        except: default_category = None
        if is_default:
            account.set_preference('account.default.category', category_id)
        elif default_category == category_id:
            response = {'status': 'error', 'messages': [ugettext('APP-CATEGORY-UPDATED-DEFAULT-FAIL')]}
            return HttpResponse(json.dumps(response), content_type='application/json', status=400)

        response = {'status': 'ok', 'messages': [ugettext('APP-CATEGORY-UPDATEDSUCCESSFULLY-TEXT')]}
        response['id'] = categoryi18n.category_id
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)

@login_required
@privilege_required('workspace.can_access_admin')
@require_POST
def action_delete_category(request):
    form = forms.CategoryDeleteForm(request.POST)
    if form.is_valid():
        auth_manager = request.auth_manager
        category_id = form.cleaned_data.get('id')
        account = auth_manager.get_account()
        try:
            default_category_id = int(account.get_preference('account.default.category'))
        except:
            default_category_id = None

        if category_id != default_category_id:

            # check if it's a transparency category
            used_transparency_categories = account.get_preference('account.transparency.categories').split()
            if category_id in used_transparency_categories:
                response = {'status': 'error', 'messages': [ugettext('APP-CATEGORY-TRANSPARENCY-CANT-BE-DELETED')]}
                return HttpResponse(json.dumps(response), content_type='application/json', status=400)

            # moving the resources to the default category
            total = DataStreamRevision.objects.filter(category=category_id).update(category=default_category_id)
            total += DashboardRevision.objects.filter(category=category_id).update(category=default_category_id)
            total += DatasetRevision.objects.filter(category=category_id).update(category=default_category_id)

            # actually, deleting the category
            cat = Category.objects.get(pk=category_id)
            cat.delete()

            # reindexing
            reindex_category_resources(default_category_id, auth_manager.language)

        else:
            response = {'status': 'error', 'messages': [ugettext('APP-CATEGORY-DEFAULT-CANT-BE-DELETED')]}
            return HttpResponse(json.dumps(response), content_type='application/json', status=400)

        response = {'status': 'ok', 'messages': [ugettext('APP-CATEGORY-DELETEDSUCCESSFULLY-TEXT')], 'total': total, 'category_id':category_id}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        errors = generate_ajax_form_errors(form)
        response = {'status': 'error', 'messages': errors}
        return HttpResponse(json.dumps(response), content_type='application/json', status = 400)


@require_POST
def action_check_email(request):
    email = request.POST.get('email')
    user_id = request.POST.get('user_id')
    query = User.objects.filter(email=email)
    if user_id:
        query = query.exclude(id=user_id)
    return HttpResponse(str(not query.exists()).lower(), content_type='application/json')

@require_POST
def action_check_username(request):
    nick = request.POST.get('username')
    user_id = request.POST.get('user_id')
    query = User.objects.filter(nick=nick)
    if user_id:
        query = query.exclude(id=user_id)
    return HttpResponse(str(not query.exists()).lower(), content_type='application/json')

@require_POST
def action_check_domain(request):
    account_id = request.auth_manager.account_id
    domain = request.POST.get('domain')
    exists = Preference.objects.filter(key='account.domain', value=domain).exclude(account_id=account_id).exists()
    return HttpResponse(str(not exists).lower(), content_type='application/json')

def get_initial(account, keys):
    """ change dots for underscores in a set of given preferences """
    preferences = account.get_preferences()
    backup_keys = list(keys)
    preferences.load(keys)

    initial = {}
    for key in backup_keys:
        key = key.replace('.', '_')
        initial[key] = preferences[key]
    return initial

def set_preferences(account, preferences):
    for key, value in preferences.items():
        account.set_preference(key, value)

def reindex_category_resources(category_id, language):

    cursor = connection.cursor()
    # top published datastreams
    sql = """SELECT MAX(`ao_datastream_revisions`.`id`)
    FROM `ao_datastream_revisions`
    WHERE `ao_datastream_revisions`.`status` = %s AND `ao_datastream_revisions`.`category_id` = %s
    GROUP BY `ao_datastream_revisions`.`datastream_id`"""
    params = [StatusChoices.PUBLISHED, category_id]
    cursor.execute(sql, params)
    datastream_revision_ids = [ datastream_revision_id for datastream_revision_id, in cursor.fetchall() ]

    # top published dashboards
    sql = """SELECT MAX(`ao_dashboard_revisions`.`id`)
    FROM `ao_dashboard_revisions`
    WHERE `ao_dashboard_revisions`.`status` = %s AND `ao_dashboard_revisions`.`category_id` = %s
    GROUP BY `ao_dashboard_revisions`.`dashboard_id`"""
    params = [StatusChoices.PUBLISHED, category_id]
    cursor.execute(sql, params)
    dashboard_revision_ids = [ dashboard_revision_id for dashboard_revision_id, in cursor.fetchall() ]

    # top published visualizations
    if datastream_revision_ids:
        ss = ', '.join([ '%s' for i in range(len(datastream_revision_ids))])
        sql = """SELECT MAX(`ao_visualizations_revisions`.`id`)
        FROM `ao_visualizations_revisions`
        INNER JOIN `ao_visualizations` ON (`ao_visualizations_revisions`.`visualization_id` = `ao_visualizations`.`id`)
        INNER JOIN `ao_datastreams` ON (`ao_datastreams`.`id` = `ao_visualizations`.`datastream_id`)
        INNER JOIN `ao_datastream_revisions` ON (`ao_datastream_revisions`.`datastream_id` = `ao_datastreams`.`id`)
        WHERE `ao_visualizations_revisions`.`status` = %s AND `ao_datastream_revisions`.`id` IN (""" + ss + """)
        GROUP BY `ao_visualizations_revisions`.`visualization_id`"""
        params = [StatusChoices.PUBLISHED]
        params.extend(datastream_revision_ids)
        cursor.execute(sql, params)
        visualization_revision_ids = [ visualization_revision_id for visualization_revision_id, in cursor.fetchall() ]
    else:
        visualization_revision_ids = []

    # reindexing the top published revision
    datastreams = DataStreamRevision.objects.filter(id__in=datastream_revision_ids)
    dashboards = DashboardRevision.objects.filter(id__in=dashboard_revision_ids)
    visualizations = VisualizationRevision.objects.filter(id__in=visualization_revision_ids)
    docs = []
    resources = list(datastreams) + list(dashboards) + list(visualizations)
    for resource in resources:
        docs.append(resource.get_dict(language))

    SearchifyIndex().get().indexit(docs)

@login_required
@privilege_required('workspace.can_access_admin')
def get_resource_dict(request):
    """
    Change a param value a reindex resource on searchify
    """
    res_type=request.GET.get("type")
    res_id=request.GET.get("id")
    res_lang=request.GET.get("lang", "es")

    update_param=request.GET.get("param")
    update_value=request.GET.get("param_value")
    update_type=request.GET.get("param_type", "string")

    if res_type == "VZ":
        res = VisualizationRevision.objects.get(pk=res_id)
    elif res_type == "DASH":
        res = DashboardRevision.objects.get(pk=res_id)
    elif res_type == "DS":
        res = DataStreamRevision.objects.get(pk=res_id)

    resp = "<h2>DICT</h2>"
    orig = res.get_dict(res_lang)
    resp += "<h3>Origen</h3><hr>" + str(orig)

    dest = orig.copy()
    if update_type == "int": update_value = int(update_value)
    if update_type == "float": update_value = float(update_value)
    if update_type == "long": update_value = long(float(update_value))

    dest["fields"][update_param] = update_value
    resp += "<h3>Destino</h3><hr>" + str(dest)

    #re-index
    idx = SearchifyIndex().get().indexit(dest)
    resp += "<h3>ReIndexado:%s</h3><hr>" % str(idx)

    return HttpResponse(resp)

@login_required
@privilege_required('workspace.can_access_admin')
def create_test_datasets(request, quantity=10):
    from core.lifecycle.datasets import DatasetLifeCycleManager
    quantity = int(quantity)
    info = '<h2>Creating %d datasets</h2>' % quantity
    #define any existent category
    account_id = request.auth_manager.account_id
    category = Category.objects.filter(account_id = account_id).order_by('-id')[0]
    category_id = category.id
    
    logger = logging.getLogger(__name__)
    logger.error("Categoy %d" % category_id)
    
    for x in range(0, quantity):
        dt = DatasetLifeCycleManager(user=request.user.id)
        typec = choices.CollectTypeChoices.SELF_PUBLISH
        typefile = choices.SourceImplementationChoices.CSV
        newdataset = dt.create(title='Datset %d' % x, collect_type=typec, description="Descripcion del dataset %d" % x,
                               end_point="/home/junar/Downloads/file-%d.csv" % x, notes='',
                               file_name="resource-%d.csv" % x, category=category_id, impl_type=typefile)
        info += '<br />Created Dataset %d' % x
    return HttpResponse(info)