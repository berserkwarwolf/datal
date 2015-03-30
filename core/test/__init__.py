from BeautifulSoup import BeautifulSoup as Soup
from django.core.urlresolvers import reverse
from django.test import TestCase
from django.test.client import Client
from core.test.soupselect.soupselect import select
from core.models import *
import json
from django.conf import settings
from django.contrib.auth import login
from django.http import HttpRequest

class JunarTestCase(TestCase):

    """ Testing Base class for Junar Testing
        ### to get the html self.response.content
    """

    def setUp(self):
        pass

    def get(self, url, data={}, follow=False, **kwargs):
        self.response = self.client.get(url, data, follow, **kwargs)
        return self.response

    def post(self, url, data = {}, follow=False, **kwargs):
        self.response = self.client.post(url, data, follow=follow, **kwargs)
        return self.response

    def assertElement(self, selector, count = None, fragment = False):

        if fragment:
            # harcoded for now
            l_response = '<div>' + self.response.content + '</div>'
        else:
            l_response = self.response.content

        l_soup = Soup(l_response)
        l_contains = False
        l_selector = selector

        if ':contains' in selector:
            l_selector = selector.split(':contains')[0]
            l_contains = selector.split(':contains')[1][2:-2]

        l_elements = select(l_soup, l_selector)

        if not l_contains:
            if not count:
                assert l_elements, 'No matches for %s' % selector
            else:
                assert len(l_elements) == count, 'No matches for %s, %s times' % (selector, count)
        else:
            if not count:
                for l_element in l_elements:
                    if l_contains in l_element.text:
                        return True
                assert False, 'No matches for %s' % selector
            else:
                l_count = 0
                for l_element in l_elements:
                    if l_contains in l_element.text:
                        l_count = l_count + 1
                assert count == l_count, 'No matches for %s, %s times' % (selector, count)

    def assertNotElement(self, selector):
        try:
            self.assertElement(selector)
        except AssertionError:
            pass
        else:
            assert False, 'The selector %s matches results' % selector

    def assert404(self):
        pass

    def assertHeader(self, header, value):
        assert self.response[header] == value, 'Header assert failed, expected = %s, received = %s' % (value, self.response[header])

    def login(self, nick, password):
        
        return self.post('/login/', {'username': nick, 'password': password}, True)
    
    def logout(self):
        """
        l_url = reverse('UsersManager.actionLoggout')
        l_response = self.get(l_url, follow=True)
        self.assertRedirects(l_response, '/', status_code=302, target_status_code=200)
        """
        pass
        
    def login_as_user(self, user):
        """
        Login as specified user, does not depend on auth backend (hopefully)

        This is based on Client.login() with a small hack that does not
        require the call to authenticate()
        """
        if not 'django.contrib.sessions' in settings.INSTALLED_APPS:
            raise AssertionError("Unable to login without django.contrib.sessions in INSTALLED_APPS")
        user.backend = "%s.%s" % ("django.contrib.auth.backends",
                                  "ModelBackend")
                                  
        #from django.contrib.sessions import models as engine       
        from django.contrib.sessions.backends import db as engine
        # Create a fake request to store login details.
        request = HttpRequest()
        if hasattr(self, 'session'):
            request.session = self.session
        else:
            request.session = engine.SessionStore()
        login(request, user)

        # Set the cookie to represent the session.
        session_cookie = settings.SESSION_COOKIE_NAME
        self.cookies = {}
        self.cookies[session_cookie] = request.session.session_key
        cookie_data = {
            'max-age': None,
            'path': '/',
            'domain': settings.SESSION_COOKIE_DOMAIN,
            'secure': settings.SESSION_COOKIE_SECURE or None,
            'expires': None,
        }
        self.cookies[session_cookie] = cookie_data

        # Save the session values.
        request.session.save()
        
    def assert_is_json(self):
        try:
            json.loads(self.response.content)
        except:
            assert False, 'The response is not JSON'

    def get_json(self):
        return json.loads(self.response.content)

    def get_user(self):
        pass