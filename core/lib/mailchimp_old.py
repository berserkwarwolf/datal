"""
Mailchimp, how to send an email (campaign) to one user

0. login to mailchimp

TEMPLATE.
1. templates > select my templates > pick one (edit button) to replicate and use as base
2. click on the "rename or replicate template" and enter a name for your template use (DEV, PROD) tags to know if this template is important, click on "replicate as..."
3. go to templates and click on edit at your new template
4. edit it!
5. if you want to use merge tags (vars with the username, a link, etc) add it as *|VARNAME|*
6. when you are done, click "save and exit"

LIST. (assuming that the list is already created)
7. pick your list and create an static segment, if there is not one already created. (EXTREMELY NECESSARY IF YOU DONT WANT TO SEND THE EMAIL TO THE ENTIRE LIST)
8. go to "List Tools" > "Static Segments" and create a new segment with, at least, one list subscriber email.
9. go to "Settings" > "List Fields and *|MERGE|* Tags", and create the merge tags that your used at the template.

CAMPAIGNS.
10. Create a regular campaigns, pick your list and your static segment. by selecting "Send to segment" and use the filter "Static segment", then click on "Use segment"
11. Name your campaign and fill the blanks.
12. Select "my templates", and then the template that you created before, save it and exit

HOW IT WORKS.
The "secret" to send this campaing to just one user, is the segment. With every new campaign, we remove all the segment users, and add it the user email that we want. By doing this, the only receiver will be our user.


CHECKLIST
list_id OK
segment_id OK
merge tags
notifications
campaign_id
linked with list and segment
"""

"""
# IDS.
# In order to put this in your code you need to figure out the campaigns, list and segments ids.

# CAMPAIGNS IDS
def print_campaigns(campaign_ids = ''):
    from xmlrpclib import ServerProxy
    uri = 'https://us2.api.mailchimp.com/1.3/'
    api_key= '684ee75f70059f339302ce439e391b5d-us2'
    sp = ServerProxy(uri)
    if campaign_ids:
        campaigns = sp.campaigns(api_key, {'campaign_id': campaign_ids})
    else:
        campaigns = sp.campaigns(api_key)
    for campaign in campaigns['data']:
        print '%s - %s' % (campaign['id'], campaign['title'])
        #print

# LIST IDS
def print_lists():
    from xmlrpclib import ServerProxy
    uri = 'https://us2.api.mailchimp.com/1.3/'
    api_key= '684ee75f70059f339302ce439e391b5d-us2'
    sp = ServerProxy(uri)
    lists = sp.lists(api_key)
    for mailchimp_list in lists['data']:
        print '%s - %s' % (mailchimp_list['id'], mailchimp_list['name'])
        print

# SEGMENT IDS
def print_segments(list_id):
    from xmlrpclib import ServerProxy
    uri = 'https://us2.api.mailchimp.com/1.3/'
    api_key= '684ee75f70059f339302ce439e391b5d-us2'
    sp = ServerProxy(uri)
    segments = sp.listStaticSegments( api_key, list_id )
    if segments:
        for segment in segments:
            print '%s - %s' % (segment['id'], segment['name'])
            print
    else:
        print 'No segment, please create one.'
"""


from xmlrpclib import ServerProxy
import logging

"""
7a8ef16a8c - Junar Post Launch User List [es] (PROD)
536d888887 - Workspace users list [es] (PROD)
14721002d9 - Workspace users list [en] (PROD)
e4abca441a - Junar Post Launch User List [en] (PROD)
082278f0f4 - Junar Registered users list
"""

workspace_user_activation_email = {'es': {'id': '315a7fe239'},
                                   'en': {'id': 'b2741038fd'},
                                   }

account_administrators_welcome_email = {'es': {'id': 'db88e5345c'},
                                        'en': {'id': '10880c41ce'},
                                   }

workspace_users_list = {'es': {'id': '536d888887', 'segment_id': 977},
                        'en': {'id': '14721002d9', 'segment_id': 953},
                    }

junar_post_launch_user_list = {'es': {'id': '7a8ef16a8c', 'segment_id': 985},
                               'en': {'id': 'e4abca441a', 'segment_id': 973},
                               }

MAILCHIMP = {
    'uri': 'https://us2.api.mailchimp.com/1.3/',
    'api_key': '684ee75f70059f339302ce439e391b5d-us2',
    'campaigns': { 'workspace_user_activation_email': workspace_user_activation_email,
                   'account_administrators_welcome_email': account_administrators_welcome_email,
    },
    'lists': { 'workspace_users_list': workspace_users_list,
             'junar_post_launch_user_list': junar_post_launch_user_list # accounts admins
    },
}

def campaign_send(list_id, campaign_id, email, mergetags = {}, segment_id = None):
    logger = logging.getLogger(__name__)
    api_key = MAILCHIMP['api_key']

    try:
        # Get the serverProxy
        server_proxy = _get_server_proxy()

        for k,v in mergetags.items():
            server_proxy.listMergeVarUpdate( api_key, list_id, k, { 'default_value': v } )

        # Remove all the mails of the segment
        remove_user_segment = server_proxy.listStaticSegmentReset( api_key, list_id, segment_id )
        logger.debug('remove_user_segment = %s' % remove_user_segment)

        # Add the list of emails to the segment
        add_member = server_proxy.listStaticSegmentMembersAdd( api_key, list_id, segment_id, [ email ] )
        logger.debug('add_member = %s' % add_member)

        # Replicate the campain
        id_replication = server_proxy.campaignReplicate( api_key, campaign_id )
        logger.debug('id_replication = %s' % id_replication)

        # Send the campain
        campaign_send = server_proxy.campaignSendNow( api_key, id_replication )
        logger.debug('campaign_send = %s' % campaign_send)

    except Exception, error:
        logger.error(error)
        return False

    return True

def list_subscribe(list_id, email, mergetags = {}):
    logger = logging.getLogger(__name__)
    api_key = MAILCHIMP['api_key']

    log_message = 'email to be subscribed = %s to list_id = %s' % (email, list_id)
    logger.info(log_message)

    try:
        server_proxy = _get_server_proxy()
        list_subscribe = server_proxy.listSubscribe(api_key, list_id, email, mergetags, 'html', False, False, False, False)
        logger.debug('user subscribed = ' + unicode(list_subscribe))
    except Exception, error:
        logger.error(error)
        return False

    return True

def _get_server_proxy():
    return ServerProxy(MAILCHIMP['uri'])

def workspace_users_list_subscribe(user, language):
    list_id = MAILCHIMP['lists']['workspace_users_list'][language]['id']
    email = user.email

    try:
        fname  = user.name.split(' ')[0]
        lname  = ' '.join(user.name.split(' ')[1:])
    except:
        fname  = user.name
        lname  = ''

    mergetags = {'FNAME': fname, 'LNAME': lname}

    list_subscribe(list_id, email, mergetags)


def account_administrators_list_subscribe(user, language):
    list_id = MAILCHIMP['lists']['junar_post_launch_user_list'][language]['id']
    email = user.email

    try:
        fname  = user.name.split(' ')[0]
        lname  = ' '.join(user.name.split(' ')[1:])
    except:
        fname  = user.name
        lname  = ''

    mergetags = {'FNAME': fname, 'LNAME': lname}

    list_subscribe(list_id, email, mergetags)

def workspace_user_activation_email_campaign_send(email, name, adminname, company, link, language):
    logger = logging.getLogger(__name__)
    list_id = MAILCHIMP['lists']['workspace_users_list'][language]['id']
    campaign_id = MAILCHIMP['campaigns']['workspace_user_activation_email'][language]['id']
    segment_id = MAILCHIMP['lists']['workspace_users_list'][language]['segment_id']

    log_message = 'campaign send: %s, %s, %s, %s, %s' % (email, name, adminname, company, link)
    logger.info(log_message)

    mergetags = {'FNAME': name,
                 'ADMINNAME': adminname,
                 'COMPANY': company,
                 'LINK': link
                }

    campaign_send(list_id, campaign_id, email, mergetags, segment_id)

def account_administrators_welcome_email_campaign_send(email, link, language):
    logger = logging.getLogger(__name__)
    list_id = MAILCHIMP['lists']['junar_post_launch_user_list'][language]['id']
    campaign_id = MAILCHIMP['campaigns']['account_administrators_welcome_email'][language]['id']
    segment_id = MAILCHIMP['lists']['junar_post_launch_user_list'][language]['segment_id']

    log_message = 'campaign send: %s, %s, %s' % (email, link, language)
    logger.info(log_message)

    mergetags = {'LINK': link}

    campaign_send(list_id, campaign_id, email, mergetags, segment_id)