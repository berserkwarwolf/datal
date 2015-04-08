from core.models import *
viewer = Role.objects.get(code='ao-viewer')
privileges = Privilege.objects.filter(code__in=['privatesite.can_view_datastream', 'privatesite.can_view_visualization', 'privatesite.can_view_dashboard'])
for privilege in privileges:
    Grant.objects.create(role=viewer, privilege=privilege)

user = Role.objects.get(code='ao-user')
privileges = Privilege.objects.filter(code__in=['privatesite.can_export_datastream', 'privatesite.can_export_dashboard', 'privatesite.can_share_datastream', 'privatesite.can_share_visualization', 'privatesite.can_share_dashboard', 'privatesite.can_view_datastream', 'privatesite.can_view_visualization', 'privatesite.can_view_dashboard'])
for privilege in privileges:
    Grant.objects.create(role=user, privilege=privilege)

roles = Role.objects.filter(code__in = ['ao-account-admin', 'ao-editor', 'ao-publisher'])
privileges = Privilege.objects.filter(code__in=['workspace.can_share_datastream', 'workspace.can_share_visualization', 'workspace.can_share_dashboard', 'privatesite.can_view_datastreams', 'privatesite.can_view_visualizations', 'privatesite.can_view_dashboards', 'privatesite.can_export_datastreams', 'privatesite.can_export_dashboards', 'privatesite.can_share_datastreams', 'privatesite.can_share_visualizations', 'privatesite.can_share_dashboards'])
for role in roles:
    for privilege in privileges:
        Grant.objects.create(role=role, privilege=privilege)

roles = Role.objects.filter(code__in = ['ao-account-admin', 'ao-editor', 'ao-publisher', 'ao-free-user'])
privilege = Privilege.objects.get(code='workspace.can_signin')
for role in roles:
    Grant.objects.create(role=role, privilege=privilege)


roles = Role.objects.filter(code__in = ['ao-account-admin', 'ao-editor', 'ao-publisher', 'ao-member'])
privilege = Privilege.objects.get(code='privatesite.can_signin')
for role in roles:
    Grant.objects.create(role=role, privilege=privilege)