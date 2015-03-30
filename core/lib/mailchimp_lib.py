"""

Updated NGINX (old ubuntu 10)
source /usr/local/virtualenv/Junar/bin/activate
sudo pip install mailchimp
sudo pip install mandrill

Python library for send mailchimp campaigns
Mandrill is the 'transactional tool' (few and personalizated emails)

You'll need to install mailchimp package:
pip install mailchimp
And mandril for personalizated emails
pip install mandrill

At the end of this file you can see a sample usage
"""
import mailchimp
import mandrill
import logging

junar_post_launch_user_list = {'es': {'id': '98df6a782d'},'en': {'id': '98df6a782d'},}
workspace_users_list = {'es': {'id': '6730f1150e'},'en': {'id': '6730f1150e'},}

MAILCHIMP = {
    'uri': 'https://us2.api.mailchimp.com/2.0/',
    'api_key': '42ba33fc0105eae7a81cb1971a33b411-us2',
    'lists': { 'workspace_users_list': workspace_users_list},
}

MANDRILL = {'api_key': 'MS_LHCEsZOkKUPDj_Ik4NA'}

def get_mailchimp():
    """ get the mailchip object """
    try:
        m = mailchimp.Mailchimp(MAILCHIMP['api_key'])
    except Exception, e:
        logger = logging.getLogger(__name__)
        logger.error('MailChimp error (%s) (%s)' % ( str(e), repr(e) ) )
        m = None
    return m

def get_mandrill():
    """ get the mandrill object """
    return mandrill.Mandrill(MANDRILL['api_key'])

def list_subscribe(list_id, email, mergetags = {}):
    logger = logging.getLogger(__name__)

    m=get_mailchimp()
    if not m:
        return False
        
    try:
        
        m.lists.subscribe(list_id, {'email':email}, mergetags)
        return True
    except mailchimp.ListAlreadySubscribedError:
        return True
    except mailchimp.ListMergeFieldRequiredError, e:
        logger.error('You forget some mandatory fiedls: %s - %s - %s' % (str(e), repr(e), str(mergetags)))
        return False
    except mailchimp.Error, e:
        logger.error('An error occurred: %s - %s - %s' % (e.__class__, e, str(mergetags) ) )
        return False

    return True

def workspace_users_list_subscribe(user, language, extradata={}):
    """ add new workspace user to our list """
    list_id = MAILCHIMP['lists']['workspace_users_list'][language]['id']
    email = user.email

    try:
        fname  = user.name.split(' ')[0]
        lname  = ' '.join(user.name.split(' ')[1:])
    except:
        fname  = user.name
        lname  = ''

    user_type="Workspace"
    mergetags = {'FNAME': fname, 'LNAME': lname, 'MMERGE7': user_type, 'MMERGE6':extradata["country"], 'MMERGE3': extradata["company"]}

    # add to list
    return list_subscribe(list_id, email, mergetags)


def account_administrators_list_subscribe(user, language, extradata={}):
    """add user to administrator's mailchimp list"""
    list_id = MAILCHIMP['lists']['workspace_users_list'][language]['id']
    email = user.email

    user_type="Workspace Admin"
    mergetags = {'FNAME': user.nick, 'LNAME': extradata["company"], 'MMERGE7': user_type, 'MMERGE6':extradata["country"], 'MMERGE3': extradata["company"]}

    return list_subscribe(list_id, email, mergetags)

def account_administrators_welcome_email_campaign_send(user, link, mergetags):
    """ Notify new admin """
    ma = get_mandrill()

    avars = [{'name':'FNAME', 'content': mergetags["FNAME"]}
            , {'name': 'ADMINNAME', 'content': mergetags["ADMINNAME"]}
            , {'name': 'COMPANY', 'content': mergetags["COMPANY"]}
            , {'name': 'LINK', 'content': link}
            , {'name':'TWITTER:PROFILEURL', 'content':'https://twitter.com/junar'}
            , {'name':'FACEBOOK:PROFILEURL', 'content':'https://www.facebook.com/JunarData'}
            , {'name':'LIST:COMPANY', 'content':'Junar'}
            , {'name':'LIST:DESCRIPTION', 'content':'Junar.com'}
            , {'name':'UNSUB', 'content':'http://junar.com/unsubscribe'}
            , {'name':'UPDATE_PROFILE', 'content':'http://junar.com/unsubscribe'}]

    to = [{'email': user.email}]

    tmpl = 'workspace-account-activation-prod'
    sbj = 'New Junar account'
    if user.language == "es":
        tmpl = 'workspace-account-activation-dev-es-prod'
        sbj = 'Nueva cuenta en Junar'

    message = {'subject':sbj, 'to': to
            , 'from_name':'Junar'
            , 'from_email':'marketing@junar.com'
            , 'merge': True
            , 'merge_vars': [{'rcpt': user.email,'vars': avars }]}

    result = ma.messages.send_template(template_name=tmpl, template_content=[], message=message, async=False, ip_pool='Main Pool')
    if result[0]["reject_reason"] == None:
        return True
    else:
        logger = logging.getLogger(__name__)
        logger.error("Failed to send email (%s)" % result[0]["reject_reason"])
        return False

"""
Sample usage
import mailchimp
m = mailchimp.Mailchimp('42ba33fc0105eae7a81cb1971a33b411-us2')

# check if everything is ok
m.helper.ping()
{u'msg': u"Everything's Chimpy!"}

# check lists
lists = m.lists.list()
lists["total"]
7
for l in lists["data"]:
    lst = l["name"] + " ID:" + l["id"] + " WEB_ID: " + str(l["web_id"])
    print lst

UK_Yorkshire_2014_06
National Day of Civic Hacking Organizaers
Israel Only
TEST LIST ONLY
Junar Contacts
Website Leads
Government Contacts

add email to a list
#params list id (no web_id), email, fields (some can be mandatory)
m.lists.subscribe("6730f1150e", {'email':'andres@data99.com.ar'}, {'FNAME':'Andres', 'LNAME':'Vazquez'})

--------------

Mandrill, send template

import mandrill
m = mandrill..Mandrill('MS_LHCEsZOkKUPDj_Ik4NA')
vars = [{'name':'FNAME', 'content': 'Juan Perez'}
        , {'name': 'ADMINNAME', 'content': 'Juan Admin'}
        , {'name': 'COMPANY', 'content': 'Company name'}
        , {'name': 'LINK', 'content': 'junar.com/link'}
        , {'name':'TWITTER:PROFILEURL', 'content':'https://twitter.com/junar'}
        , {'name':'FACEBOOK:PROFILEURL', 'content':'https://www.facebook.com/JunarData'}
        , {'name':'LIST:COMPANY', 'content':'Junar'}
        , {'name':'LIST:DESCRIPTION', 'content':''}
        , {'name':'UNSUB', 'content':''}
        , {'name':'UPDATE_PROFILE', 'content':''}
        , {'name':'', 'content':''}]
credentials = {'smtp':'smtp.mandrillapp.com', 'port': '587', 'username':'andres.vazquez@junar.com', 'password':'MS_LHCEsZOkKUPDj_Ik4NA'}
to = [{'email':'andres@data99.com.ar', 'name':'Andres'}]
message = {'subject':'Hola Mandrill', 'to': to, 'merge': True, 'merge_vars': [{'rcpt': 'andres@data99.com.ar','vars': vars }]}
tmp_es = 'workspace-account-activation-dev-es-prod'
tmp_en = 'workspace-account-activation-prod'
result = m.messages.send_template(template_name=tmp_es, template_content=[], message=message, async=False, ip_pool='Main Pool')
"""