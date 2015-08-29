from rest_framework.views import exception_handler

def datal_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:
        response.data['status'] = response.status_code
        response.data['description'] = response.data.pop('detail')
        response.data['error'] = str(exc.__class__.__name__)
        response.data['type'] = 'api-error'

    return response