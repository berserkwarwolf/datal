# -*- coding: utf-8 -*-
from django import template
from datetime import datetime
#from core.helpers import format_number_ms
import re


register = template.Library()


@register.filter(name='datefy')
def datefy(value, arg="%Y-%m-%d"):
    dat = ""
    if type(value) == str:
        try:
            dat = datetime.strptime(value, arg).date()
        except ValueError: #it's not a date
            dat = ""
    elif type(value) == datetime:
        dat = value.strftime(arg)
    return dat


#@register.filter(name='monefy', arg="")
#def monefy(value, arg=''):
#    strformat="#,###.##"
#    strlocale="en_US"
#    currency="USD"
#    vals = arg.split("|")
#    count = 0
#    for val in vals:
#        if count == 0 and val != "":
#            strformat = val
#        if count == 1 and val != "":
#            strlocale = val
#        if count == 2 and val != "":
#            currency = val
#
#        count = count + 1
#
#    value = format_number_ms(value, strformat, strlocale, currency)
#    return value


#@register.filter(name='numberfy', arg="")
#def numberfy(value, arg=''):
#    """
#    it's the same on moneyfy but last paramater "currency" is empty
#    """
#    strformat="#,###.##"
#    strlocale="en_US"
#
#    vals = arg.split("|")
#    count = 0
#    for val in vals:
#        if count == 0 and val != "":
#            strformat = val
#        if count == 1 and val != "":
#            strlocale = val
#
#        count = count + 1
#    try:
#        value = format_number_ms(value, strformat, strlocale, "")
#    except ValueError:
#        value = 0
#    return value


@register.filter(name='isMoney')
def isMoney(value):
    # TODO try to detect better, maybe loading internal "data_source" database field
    return value.find("$") and unicode(value).isnumeric()


@register.filter(name='isNumber')
def isNumber(value):
    if not unicode(value).isnumeric():
        try:
            f = float(value)
        except ValueError:
            return False

    return True


@register.filter(name='extractUrl')
def extractUrl(value):
    return re.search("(?P<url>https?://[^\s]+)", value).group("url")


@register.filter(name='isDate')
def isDate(value):
    res = False
    if type(value) == datetime.date:
        res = True
    elif value != "":
        from dateutil.parser import *
        try:
            p = parse(value)
            res = True
        except:
            res = False
    return res


@register.filter(name='jreplace', arg="")
def jreplace(value, arg):
    vals = arg.split("|")
    return value.replace(vals[0], vals[1])

# ---------------------- GRAVES
# import re
import unicodedata


@register.filter(name='urify')
def urify(value):
    v = value.lower()
    rx = re.compile('([/\.;:,\s\(\)])')
    v = unicodedata.normalize('NFKD', v).encode('ascii', 'ignore')
    return rx.sub('_', v)


@register.filter(name='moneyfy')
def moneyfy(value):
    value = str(value)
    v = value.replace('$', '').strip().lower()
    rx = re.compile('([\.,])')
    return rx.sub('', v)


@register.filter(name='money')
def money(value):
    rx = re.compile('^\s*\$?\s*\d{1,3}([,]?\d{3}){0,}([.]\d+){1}$')
    v = value.strip()
    return rx.match(v)


@register.filter(name='dateify', arg="")
def dateify(value, format="%d/%m/%Y"):
    v = value.strip()
    return datetime.strptime(v, format)


@register.filter(name='date', arg="")
def date(value, format="%d/%m/%Y"):
    v = value.strip()
    try:
        datetime.strptime(v, format)
    except:
        return False
    return True


@register.filter(name='strip')
def strip(value):
    return value.strip()

