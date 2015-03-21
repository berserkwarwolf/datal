"""
import os
import sys

path = '/'.join(os.path.dirname(__file__).split('/')[:-2])

if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'junar.microsites.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
"""
import os
import sys
import site

# Add the site-packages of the chosen virtualenv to work with
site.addsitedir(os.getenv('DATAL_SITEDIR', '/home/junar/junar/junar2014/local/lib/python2.7/site-packages'))

# Add the app's directory to the PYTHONPATH
sys.path.append(os.getenv('DATAL_VIRTUALENV', '/home/junar/junar/junar2014/'))

os.environ['DJANGO_SETTINGS_MODULE'] = 'junar.microsites.settings'

# Activate your virtual env
activate_env=os.path.expanduser(os.getenv('DATAL_ACTIVATE_ENV', "/home/junar/junar/junar2014/bin/activate_this.py"))
execfile(activate_env, dict(__file__=activate_env))

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()