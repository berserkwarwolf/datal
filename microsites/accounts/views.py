from django.core.urlresolvers import reverse
from django.contrib import messages
from django.utils.translation import ugettext
from django.shortcuts import redirect, get_object_or_404
from core.auth.auth import AuthManager
from core.models import UserPassTickets
from core.choices import TicketChoices
from core.shortcuts import render_to_response
from microsites.accounts import forms

def signin(request):
    auth_manager = request.auth_manager
    if auth_manager.is_authenticated:
        return redirect(reverse('microsite.dashboards'))

    form = forms.SignInForm()
    account = request.account
    preferences = request.preferences
    return render_to_response('accounts/account_signin.html', locals())

def login(request):
    if request.method == 'POST':
        form = forms.SignInForm(request.POST)
        if form.is_valid():
            auth_manager = AuthManager(form.user)
            if auth_manager.has_privilege('privatesite.can_signin') and auth_manager.account_id == request.account.id:
                request.session['user_id'] = form.user.id
                request.session.set_expiry(0)
            return redirect(reverse('microsite.dashboards'))
        else:
            messages.add_message(request, messages.ERROR, ugettext('INVALID-USER-OR-PASS'))
            return redirect(reverse('accounts.signin'))

    elif request.method == 'GET':
        raise Exception("GET")
        return redirect('accounts.signin')

def signout(request):
    request.session.clear()
    return redirect('/')

def activate(request):
    if request.method == 'GET':
        form = forms.ActivateUserForm(request.GET)
        ticket = request.GET.get('ticket')
        user_pass_ticket = get_object_or_404(UserPassTickets, type = TicketChoices.USER_ACTIVATION, uuid=ticket)
        preferences = request.account.get_preferences()
        return render_to_response('accounts/activate.html', locals())

    elif request.method == 'POST':
        form = forms.ActivateUserForm(request.POST)
        if form.is_valid():
            ticket = form.cleaned_data.get('ticket')
            password = form.cleaned_data.get('password')
            user_pass_ticket = get_object_or_404(UserPassTickets, type = TicketChoices.USER_ACTIVATION, uuid=ticket)
            user = user_pass_ticket.user
            user.password = password
            user.save()
            user_pass_ticket.delete()

            request.session['user_id'] = user.id
            request.session.set_expiry(0)

            return redirect(reverse('microsite.dashboards'))

        else:
            preferences = request.account.get_preferences()
            return render_to_response('accounts/activate.html', locals())
