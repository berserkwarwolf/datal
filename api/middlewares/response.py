from core.cache import Cache

class ResponseStatusMiddleware(object):

    def process_response(self, request, response):
        status_code = str(response.status_code)[0] + '00'
        c = Cache()
        c.hincrby(request.cache_key, status_code)
        return response
