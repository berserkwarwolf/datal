from rest_framework import permissions

class DatalApiPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return ('account_id' in obj and 
                obj['account_id'] == request.auth['account'].id)