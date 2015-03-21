# -*- coding: utf-8 -*-
from django.conf import settings
from junar.core.models import *
from junar.core.choices import StatusChoices
from django.utils.translation import ugettext_lazy

class AuthManager:
    def __init__(self, user = None, language = None):
        if user:
            self.id = user.id
            self.email = user.email
            self.name = user.name
            self.nick = user.nick
            self.is_authenticated = True
            self.roles = [ role.code for role in user.roles.all() ]
            self.privileges = [ privilege.code for role in user.roles.all() for privilege in role.grants.all() ]
            self.privileges.extend([ privilege.code for privilege in user.grants.all() if privilege.code not in self.privileges ])
            self.account_id = user.account_id
            self.account_level = user.account.level.code
            self.language = user.language
        else:
            self.id = None
            self.email = ''
            self.name = ''
            self.nick = ''
            self.is_authenticated = False
            self.roles = []
            self.privileges = []
            self.account_id = None
            self.account_level = None
            self.language = language

    def is_anonymous(self):
        return not self.is_authenticated

    def is_admin(self):
        return self.has_role('ao-account-admin')

    def is_enhancer(self):
        return self.has_role('ao-enhancer')

    def is_publisher(self):
        return self.has_role('ao-publisher')

    def has_privilege(self, p_privilege = ''):
        return p_privilege in self.privileges

    def has_privileges(self, p_privileges = []):
        return set(p_privileges).issubset(set(self.privileges))

    def has_role(self, role = ''):
        return role in self.roles

    def has_roles(self, roles = []):
        return set(roles).issubset(set(self.roles))

    def get_user(self):
        return User.objects.get(pk = self.id)

    def is_level(self, p_level):
        account_id = self.account_id
        if account_id:
            account = Account.objects.get(pk = account_id)
            return account.level.code == p_level
        return False

    def get_account(self):
        try:
            return Account.objects.get(pk = self.account_id)
        except Account.DoesNotExist:
            return None

    def has_privilege_on_object(self, object_id, object_type, privilege, is_workspace = True):
        """
            Privelege in view, share, export
            object_type in datastream, dashboard, visualization
        """
        if is_workspace:
            return self.has_privilege('workspace.can_'+privilege+'_'+object_type)
        else:
            # private site
            if self.has_privilege('privatesite.can_'+privilege+'_'+object_type+'s'):
                return True
            else:
                return ObjectGrant.objects.has_privilege_on_object(object_id, object_type, self.id, 'privatesite.can_'+privilege+'_'+object_type)

    def get_allowed_actions(self, current_status=None):
        actions = ()
        if current_status == None:
            if self.is_publisher() or self.is_admin():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')),
                    (StatusChoices.PENDING_REVIEW,  ugettext_lazy('MODEL_STATUS_PENDING_REVIEW')),
                    (StatusChoices.PUBLISHED,  ugettext_lazy('MODEL_STATUS_PUBLISHED')),
                    (StatusChoices.APPROVED,  ugettext_lazy('MODEL_STATUS_APPROVED')))
            elif self.is_enhancer():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')),
                    (StatusChoices.PENDING_REVIEW,  ugettext_lazy('MODEL_STATUS_PENDING_REVIEW')))
        elif current_status==ugettext_lazy('MODEL_STATUS_PENDING_REVIEW'):
            if self.is_publisher() or self.is_admin():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')),
                    (StatusChoices.PUBLISHED,  ugettext_lazy('MODEL_STATUS_PUBLISHED')),
                    (StatusChoices.ACCEPTED,  ugettext_lazy('MODEL_STATUS_APPROVED')))
                return actions
            if self.is_enhancer():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')))
                return actions
        elif current_status== ugettext_lazy('MODEL_STATUS_PUBLISHED'):
            if self.is_publisher() or self.is_admin():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')),
                    (StatusChoices.ACCEPTED,  ugettext_lazy('MODEL_STATUS_APPROVED')))
                return actions
            if self.is_enhancer():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')))
                return actions
        elif current_status==ugettext_lazy('MODEL_STATUS_DRAFT'):
            if self.is_enhancer():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')),
                    (StatusChoices.PENDING_REVIEW,  ugettext_lazy('MODEL_STATUS_PENDING_REVIEW')))
                return actions
            if self.is_publisher() or self.is_admin():
                actions= actions +((StatusChoices.DRAFT,  ugettext_lazy('MODEL_STATUS_DRAFT')),
                    (StatusChoices.PUBLISHED,  ugettext_lazy('MODEL_STATUS_PUBLISHED')),
                    (StatusChoices.ACCEPTED,  ugettext_lazy('MODEL_STATUS_APPROVED')))
                return actions

        return actions

