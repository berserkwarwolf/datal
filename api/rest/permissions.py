from rest_framework import permissions

class ApiPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return ('account_id' in obj and 
                obj['account_id'] == request.auth['account'].id)

class ApiPrivateForWritePermission(permissions.BasePermission):
    if request.method not in permissions.SAFE_METHODS:
        return request.auth['application'].is_private_auth_key(
            request.auth['auth_key'])
    return True