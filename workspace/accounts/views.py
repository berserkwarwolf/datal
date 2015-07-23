import hashlib
import string
import datetime

from django.core.mail import send_mail
from django.db.models import Q
from django.http import Http404, HttpResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.utils.translation import ugettext
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.core.urlresolvers import reverse

from uuid import uuid4
from random import choice

from core.helpers import get_domain_with_protocol
from core.auth.auth import AuthManager
from core.auth.decorators import login_required
from core.choices import TicketChoices
from core.models import *
from core.shortcuts import render_to_response
from core.lib.mail import mail
from workspace.accounts import forms


def signup(request):
    form = forms.SignUpForm(initial={'language': request.auth_manager.language})
    return render_to_response('accounts/signUp.html', locals())


def create(request):
    form = forms.SignUpForm(request.POST)
    if form.is_valid():

        account = Account()
        account.name = form.cleaned_data.get('account_name')
        account_level = AccountLevel.objects.get_by_code('level_5')
        account.level = account_level

        month = datetime.timedelta(days=30)
        account.expires_at = datetime.date.today() + month
        account.save()

        language = form.cleaned_data.get('language')

        default_category = dict(
            en='Default Category',
            es='Categoria por defecto'
        )

        category_name = default_category[language]
        category_description = ''
        category = Category.objects.create(account = account)
        CategoryI18n.objects.create(
            language=language,
            category=category,
            name=category_name,
            slug=slugify(category_name),
            description=category_description
        )

        initial_preferences = [
            ('account.url', form.cleaned_data.get('admin_url')),
            ('account.name', account.name),
            ('account.language', language),
            ('enable.junar.footer', 'on'),
            ('account.page.titles', account.name),
            ('account.default.category', category.id)
        ]

        for ip in initial_preferences:
            preference = Preference()
            preference.account = account
            preference.key = ip[0]
            preference.value = ip[1]
            preference.save()

        user = User()
        user.nick = form.cleaned_data.get('username')
        user.email = form.cleaned_data.get('email')
        user.password = form.cleaned_data.get('password')
        user.account = account
        user.language = language
        user.save()

        admin_role = Role.objects.get(code='ao-account-admin')
        user.roles.add(admin_role)

        # login the user
        request.session['user_id'] = user.id

        if mail.mail_service:
            company = account.name
            country = 'Unknown'
            extradata = {'country': country, 'company': company}
            mail.mail_service.list_subscribe(user, extradata)

        # redirect to landing
        return redirect('/')
    else:
        return redirect('accounts.signup')


def signin(request, admin_url=''):
    auth_manager = request.auth_manager
    if not auth_manager.is_anonymous():
        return HttpResponseRedirect(reverse('accounts.landing'))

    form = forms.SignInForm(request.GET, initial={'admin_url': admin_url})
    if admin_url:
        try:
            account_id = Preference.objects.get_account_id_by_known_key_and_value('account.url', admin_url)
            account = Account.objects.get(pk=account_id)
            preferences = account.get_preferences()
        except (Preference.DoesNotExist, Account.DoesNotExist):
            raise Http404
        return render_to_response('accounts/signIn.html', locals())
    else:
        return render_to_response('accounts/signIn.html', locals())


def login(request):
    if request.method == 'POST':
        form = forms.SignInForm(request.POST)
        if form.is_valid():

            auth_manager = AuthManager(form.user)
            if not auth_manager.has_privilege('workspace.can_signin'):
                messages.add_message(request, messages.ERROR, ugettext('INVALID-USER-OR-PASS'))
                return redirect('accounts.signin')

            request.session['user_id'] = form.user.id
            request.session['django_language'] = form.user.language
            if not form.cleaned_data['remember_me']:
                request.session.set_expiry(0)

            if form.cleaned_data.get('next'):
                next = form.cleaned_data.get('next')
                return redirect(next)
            return redirect('accounts.landing')
        else:
            admin_url = request.POST.get('admin_url')
            messages.add_message(request, messages.ERROR, ugettext('INVALID-USER-OR-PASS'))
            if admin_url:
                return redirect('accounts.account_signin', admin_url = admin_url)
            else:
                return redirect('accounts.signin')
    elif request.method == 'GET':
        admin_url = request.GET.get('admin_url')
        if admin_url:
            return redirect('accounts.account_signin', admin_url=admin_url)
        else:
            return redirect('accounts.signin')


def signout(request):
    request.session.clear()
    return redirect('/')


def activate(request):
    if request.method == 'GET':
        form = forms.ActivateUserForm(request.GET)
        ticket = request.GET.get('ticket')
        user_pass_ticket = get_object_or_404(UserPassTickets, type=TicketChoices.USER_ACTIVATION, uuid=ticket)
        return render_to_response('accounts/activate.html', locals())

    elif request.method == 'POST':
        form = forms.ActivateUserForm(request.POST)
        if form.is_valid():
            ticket = form.cleaned_data.get('ticket')
            password = form.cleaned_data.get('password')
            user_pass_ticket = get_object_or_404(UserPassTickets, type=TicketChoices.USER_ACTIVATION, uuid=ticket)
            user = user_pass_ticket.user
            user.password = password
            user.save()
            user_pass_ticket.delete()

            request.session['user_id'] = user.id
            request.session.set_expiry(0)

            return redirect('accounts.landing')

        else:
            return render_to_response('accounts/activate.html', locals())


@require_POST
def action_check_admin_url(request):
    admin_url = request.POST.get('admin_url')
    exists = Preference.objects.filter(key='account.url', value=admin_url).exists()
    return HttpResponse(str(not exists).lower(), content_type='application/json')


@login_required
def my_account(request):
    user = User.objects.get(pk=request.auth_manager.id)
    if request.method == 'GET':
        form = forms.MyAccountForm(instance = user)
        return render_to_response('accounts/my_account.html', locals())

    elif request.method == 'POST':
        form = forms.MyAccountForm(request.POST, instance=user)
        if form.is_valid():
            user = form.save()
            new_password = form.cleaned_data.get('new_password')
            if new_password:
                user.password = new_password
                user.save()

            messages.add_message(request, messages.INFO, ugettext('ACCOUNT-SAVE-SUCCESS'))
            return render_to_response('accounts/my_account.html', locals())

        else:
            return render_to_response('accounts/my_account.html', locals())


def GeneratePassword(length=8, chars=string.letters + string.digits):
    return ''.join([choice(chars) for i in range(length)])


def forgot_password(request):
    if request.method == 'GET':
        return render_to_response('accounts/forgotPassword.html', locals())

    if request.method == 'POST':
        ok = False

        try:
            user_identification = request.REQUEST['identification']
        except:
            raise Http404

        try:
            user = User.objects.get(
                Q(nick=user_identification) |
                Q(email=user_identification)
            )
        except:
            user = ''

        if user:
            uuid = uuid4()
            pass_ticket = UserPassTickets.objects.create(uuid=uuid, user_id=user.id, type='PASS')

            url = get_domain_with_protocol('workspace') + "/recovery?id=" + str(uuid)
            email_text = "Hello,\n You recently requested to reset your password. Please click the following link to start the password reset process:\n"
            email_text += ""+url + "\n"
            email_text += "If you did not request a password change, you may ignore this message and your password will remain unchanged. \n\n"
            email_text += "---------\n\n"
            email_text += "DATAL.com - The open data platform\n"
            email_text += ""
            email_text += ""

            send_mail('Your new DATAL password awaits!', email_text, 'noreply@junar.com', [user.email], fail_silently=False)

            message = ugettext('FORGOT-ACTIVATION-EMAIL')
            ok = True
        else:
            message = ugettext('FORGOT-USER-NOFOUND')

        return HttpResponse('{"p_message":"' + message + '", "ok" :"' + str(ok) + '" }', content_type='application/json')


def recovery(request):

    try:
        l_uuid = request.REQUEST['id']
    except:
        raise Http404

    try:
        l_passTicket = UserPassTickets.objects.get(uuid=l_uuid, type='PASS')
    except:
        l_passTicket  = ''

    if l_passTicket != '' :
        l_newPass = GeneratePassword()

        l_user  = User.objects.get(pk=l_passTicket.user_id)
        l_user.password = hashlib.md5(l_newPass).hexdigest()
        l_user.save()

        l_emailBody = "Hello,\n Your new password has been reset for you \n\n"
        l_emailBody += "UserName : "+ l_user.nick +"\n"
        l_emailBody += "New Password : "+ l_newPass +"\n"
        l_emailBody += "\n"
        l_emailBody += "---------\n\n"
        l_emailBody += "DATAL.com - The open data platform\n"
        l_emailBody += ""
        l_emailBody += ""

        send_mail('Your new DATAL password awaits!', l_emailBody, 'noreply@junar.com', [l_user.email], fail_silently=False)
        if not request.auth_manager.is_anonymous():
            request.session.clear()
    else:
        raise Http404

    return render_to_response('accounts/recovery.html', locals())
