# -*- coding: utf-8 -*-
class NoCacheMiddleware(object):

    def process_response(self, request, response):

        response['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate' 
        response['Expires'] = 'Fri, 01 Jan 2010 00:00:00 GMT'

        return response