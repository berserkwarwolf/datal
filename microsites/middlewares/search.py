# -*- coding: utf-8 -*-

from django.test.client import RequestFactory
from django.utils.html import escape as html_escape

import re

import logging

logger = logging.getLogger(__name__)

class SearchManager(object):
    """check the q"""

    def process_request(self, request):

        self.q = request.GET.get("q", None)
        path = request.path

        # cuando len(q) == 1 y es algun char especial,
        # django arroja un 404
        if self.q and path == "/search/":
            new_request = RequestFactory().get("%s?q=%s" % (path, self._escape()))
            request.GET = new_request.GET.copy()
            
        return None

    def _escape(self):

        # eliminamos los chars especiales
        # https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Escaping%20Special%20Characters
        map(self._replace, ("+","-","&&","||","!","(",")","{","}","[","]","^","\"","~","*","?",":","\\", "/"))
        
        return html_escape(self.q)

    def _replace(self, r):
        self.q=self.q.replace(r, "")
