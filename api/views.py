from api.http import HttpResponseNotFound, HttpResponseServerError

def action404(p_request):
    return HttpResponseNotFound('{"error": 404, "message": "Not Found"}')

def action500(p_request):
    return HttpResponseServerError('{"error": 500, "message": "Internal Server Error"}')
