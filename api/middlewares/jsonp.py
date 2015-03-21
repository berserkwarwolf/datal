class JSONPMiddleware(object):
    """
    It wraps a response if the request has a callback argument
    """
    def process_response(self, request, response):
        try:
            l_callback = request.REQUEST['callback']
            response.content = '%s(%s)' % (l_callback, response.content.decode('utf-8'))
        except:
            pass
        return response
