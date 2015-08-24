import memcache

from django.conf import settings
from django.utils.datastructures import SortedDict

from api.exceptions import Http400, Http401
from api.helpers import add_domain_to_datastream_link
from core.models import *
from core.docs import DS, DB, VZ
from core.daos.datastreams import DataStreamDBDAO
from core import engine


def datastream_as_dict(self, user_id=None, language='en'):

    try:
        datastreamrevision_id =  self.datastreamrevision_set.latest().id #DataStreamRevision.objects.get_last_published_id(self.id)
        dao = DataStreamDBDAO().get(language, datastream_revision_id=datastreamrevision_id, published=True)
    except Exception:
        raise

    sorted_dict = SortedDict([
        ('id', dao['guid']),
        ('title', dao['title']),
        ('description', dao['description']),
        ('user', dao['author']),
        ('tags', doc.get_tags()),
        ('created_at', str(dao['created_at'])),
        ('source', doc.filename),
        ('link', doc.permalink())
    ])

    if doc.parameters:
        parameters = []
        for param in doc.parameters:
            parameters.append({"name": param.name,
                               "position": param.position,
                               "description": param.description,
            })
        sorted_dict.insert(9, 'parameters', parameters)

    return sorted_dict

DataStream.as_dict = datastream_as_dict


def datastream_is_user_allowed(self, user_id):
    if user_id and self.user_id == user_id:
        return True

    # are you a user with use?
    qset = ObjectGrant.objects.values('id')
    qset = qset.filter(datastream = self.id, grant__privilege__code='private_datastream.can_use', grant__user = user_id)
    return qset.exists()

DataStream.is_user_allowed = datastream_is_user_allowed


def get_query(self, datastreamrevision_id, request, output = None, page = None, limit = None, if_modified_since = None, is_turtle = None, offset = None):

    query = {}
    datastream_parameters = DataStreamParameter.objects.filter(datastream_revision_id = datastreamrevision_id)
    for datastream_parameter in datastream_parameters:
        key = 'pArgument%d' % datastream_parameter.position
        value = request.REQUEST.get(key, '')
        if not value:
            error_description = u', '.join([ datastream_parameter.name for datastream_parameter in datastream_parameters])
            raise Http400(u'This data stream requires a parameter, please add a value for %s' % error_description)
        query[key] = value

    query['pId'] = datastreamrevision_id

    if if_modified_since:
        query['pIfModified'] = if_modified_since

    if output:
        query['pOutput'] = output.upper()

    if page:
        query['pPage'] = page

    if offset:
        query['pOffset'] = offset

    if limit:
        query['pLimit'] = limit

    if is_turtle == 0:
        query['pIsTurtle'] = is_turtle

    index = 0
    key = 'filter%d' % index
    value = request.REQUEST.get(key, None)
    while value:
        query['pFilter%d' % index] = value
        index = index + 1
        key = 'filter%d' % index
        value = request.REQUEST.get(key, None)

    if index > 0:
        where = request.REQUEST.get("where", None)
        if where:
            query['pWhereExpr'] = where

        table_format = request.REQUEST.get("format", None)
        if table_format:
            query['pTableFormat'] = table_format

    return query

DataStream.get_query = get_query


def invoke(self, request, output, user_id = None, page = None, limit = None, if_modified_since = None, offset = None):

    datastreamrevision_id = DataStreamRevision.objects.get_last_published_id(self.id)
    query = self.get_query(datastreamrevision_id, request, output, page, limit, if_modified_since, offset)
    api_cache = settings.DEBUG == False and memcache.Client(settings.MEMCACHED_API_END_POINT, debug=0)
    if api_cache:
        key = str(hash(frozenset(sorted(query.items()))))

        value = api_cache.get(key)
        if value:
            response = value
            mimetype = settings.CONTENT_TYPES.get(output)
            return response, mimetype

    #  go ahead and call engine
    contents, mimetype = engine.invoke(query, output)

    if "json" in settings.CONTENT_TYPES.get(output, "application/json"):
        response = self.result_as_json(contents, user_id)
    else:
        response = contents

    if api_cache:
        api_cache.set(key, response, settings.MEMCACHED_DEFAULT_TTL)

    return response, mimetype

DataStream.invoke = invoke


def result_as_json(self, response, user_id):
    """ Returns the information  as a dictionary """

    """
    sorted_dict = self.as_dict(user_id)

        # @XXX this is a funky hack used to keep the order in the JSON
        # response from engine, if there is a way to translate JSON strings
        # into SortedDict, delete this hack
    sorted_dict.insert(4, 'result', "{{json_result_response_to_replace}}")
    add_domain_to_datastream_link(sorted_dict)
    json_response = json.dumps(sorted_dict)
    json_response = json_response.replace('"{{json_result_response_to_replace}}"', response)
    """

    from api.v2.templates import DefaultApiResponse
    data = self.as_dict(user_id)
    add_domain_to_datastream_link(data)
    data['result'] = "json_result_response_to_replace"
    json_response = DefaultApiResponse().render(data)
    json_response = json_response.replace('json_result_response_to_replace', response.decode('utf-8'))

    return json_response

DataStream.result_as_json = result_as_json

def dashboard_as_dict(self, user_id = None):

    dashboardrevision_id = DashboardRevision.objects.get_last_published_id(self.id)
    doc = DB(dashboardrevision_id, 'en')

    datastreams = []
    for widget in doc.get_widgets():
        data = widget.get()
        datastream = SortedDict([
                   ('id', data.guid)
                 , ('title', data.title)
                 , ('link', data.permalink())
        ])
        datastreams.append(datastream)

    sorted_dict = SortedDict([
               ('id'          , doc.guid)
             , ('title'       , doc.title)
             , ('description' , doc.description)
             , ('user'        , doc.created_by_nick)
             , ('tags'        , doc.get_tags())
             , ('datastreams' , datastreams)
             , ('created_at'  , str(doc.created_at))
             , ('link'        , doc.permalink())
    ])

    return sorted_dict

Dashboard.as_dict = dashboard_as_dict

def dashboard_is_user_allowed(self, user_id):
    if user_id and self.user_id == user_id:
        return True

    # are you a user with use?
    qset = ObjectGrant.objects.values('id')
    qset = qset.filter(dashboard = self.id, grant__privilege__code='private_dashboard.can_use', grant__user = user_id)
    return qset.exists()

Dashboard.is_user_allowed = dashboard_is_user_allowed



def generate_hash(string, length = 40, use_random = True):
    import hashlib
    if use_random:
        import random
        string = string + str(random.random())

    return hashlib.sha224(string).hexdigest()[:length]

def get_auth_key(self):
    string = str(self.id) + self.guid
    return generate_hash(string, use_random = False)

Dashboard.get_auth_key = get_auth_key
DataStream.get_auth_key = get_auth_key



def user_as_dict(self):
    l_sorted_dict = SortedDict([
               ('nick' , self.nick)
             , ('name' , self.name)
             , ('email', self.email)
    ])
    return l_sorted_dict

User.as_dict = user_as_dict



def visualization_as_dict(self, user_id = None):

    visualizationrevision_id = VisualizationRevision.objects.get_last_published_id(self.id)
    doc = VZ(visualizationrevision_id, 'en')

    sorted_dict = SortedDict([
               ('id'          , doc.guid)
             , ('title'       , doc.title)
             , ('description' , doc.description)
             , ('user'        , doc.created_by_nick)
             , ('tags'        , doc.get_tags())
             , ('created_at'  , str(doc.created_at))
             , ('source'      , doc.end_point)
             , ('link'        , doc.permalink())
    ])

    if doc.parameters:
        parameters = []
        for param in doc.parameters:
            parameters.append({
                               "name": param.name,
                               "position": param.position,
                               "description": param.description,
                              })
        sorted_dict.insert(9, 'parameters', parameters)
    return sorted_dict

Visualization.as_dict = visualization_as_dict
