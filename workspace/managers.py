import time
import types
from django.db import connection
from django.conf import settings
from core import helpers
from core import http as LocalHelper
from core.models import *
from core import managers
from core.choices import COLLECT_TYPE_CHOICES

class FinderManager(managers.FinderManager):

    def __init__(self):
        self.finder_class = SQLFinder
        self.failback_finder_class = SQLFinder
        managers.FinderManager.__init__(self)


class SQLFinder(managers.Finder):
    def __init__(self):
        managers.Finder.__init__(self)

    def search(self, *args, **kwargs):
        l_start_time = time.time()

        self.query = kwargs.get('query')
        self.language = kwargs.get('language')
        self.category_id = kwargs.get('category_id')

        slice = kwargs.get('slice', 5)
        page = kwargs.get('page', 1)
        max_results = kwargs.get('max_results', 100)
        self.slice = max_results < slice and max_results or slice
        self.start = (page - 1) * self.slice
        self.account_id = kwargs.get('account_id')

        if self.query:
            self.query = self.query.strip()
        else:
            self.query = '%'

        self.extract_terms_from_query()

        l_datastream_revision_id_column     = 0
        l_datastream_id_column              = 1
        l_datastream_title_column           = 2
        l_datastream_description_column     = 3
        l_datastream_language_column        = 4
        l_editor_nick_column                = 5
        l_category_name_column              = 6
        l_dataset_id_column                 = 7
        l_created_at_column                 = 8
        l_visualization_revision_id_column  = 9
        l_visualization_id_column           = 10
        l_visualization_details_column      = 11
        l_resource_type_column              = 12
        l_collect_type_column               = 13

        l_sql, l_args = self.makeQuery()

        l_resources_cursor  = connection.cursor()
        l_resources_cursor.execute(l_sql, l_args)

        l_resources_rows = l_resources_cursor.fetchall().__iter__()

        l_resources_row  = helpers.next(l_resources_rows, None)

        l_resources= []
        while l_resources_row != None and len(l_resources) < self.slice:

            l_datastream_revision_id    = l_resources_row[l_datastream_revision_id_column]
            l_datastream_id             = l_resources_row[l_datastream_id_column]
            l_datastream_title          = l_resources_row[l_datastream_title_column]
            l_editor_nick               = l_resources_row[l_editor_nick_column]
            l_category_name             = l_resources_row[l_category_name_column]
            l_dataset_id                = l_resources_row[l_dataset_id_column]
            l_created_at                = l_resources_row[l_created_at_column]
            l_resource_type             = l_resources_row[l_resource_type_column]
            l_visualization_revision_id = l_resources_row[l_visualization_revision_id_column]
            l_visualization_id          = l_resources_row[l_visualization_id_column]
            l_visualization_details     = l_resources_row[l_visualization_details_column]
            l_collect_type              = l_resources_row[l_collect_type_column]

            l_datastream_description= None
            l_default_description   = None
            l_otherwise_description = None

            while l_resources_row != None and l_datastream_revision_id == l_resources_row[l_datastream_revision_id_column] and l_datastream_description == None and len(l_resources) < self.slice:

                if l_resources_row[l_datastream_language_column] == self.language:
                    l_datastream_description = l_resources_row[l_datastream_description_column]
                elif l_resources_row[l_datastream_language_column] == settings.LANGUAGE_CODE[0:2]:
                    l_default_description = l_resources_row[l_datastream_description_column]
                elif l_resources_row[l_datastream_language_column] == settings.SECOND_LANGUAGE:
                    l_otherwise_description = l_resources_row[l_datastream_description_column]

                l_resources_row = helpers.next(l_resources_rows, None)


            if l_datastream_description == None:

                if l_otherwise_description == None:
                    l_otherwise_description = l_datastream_title

                if l_default_description == None:
                    l_default_description = l_otherwise_description

                l_datastream_description = l_default_description

            l_parameters                        = managers.DataStreamParameterManager().queryByDataStreamRevisionId(l_datastream_revision_id)
            l_end_point, l_is_self_publishing   = managers.DataSetManager().getEndPointById(l_dataset_id)
            l_sources                           = Source.objects.filter(datastream_revision = l_datastream_revision_id).values_list('name', 'url')

            if l_resource_type == settings.TYPE_DATASTREAM:
                # l_permalink = LocalHelper.build_permalink('manageDataviews.view', '&datastream_revision_id=' + str(l_datastream_revision_id))
                l_permalink = reverse('manageDataviews.view', urlconf='workspace.urls', kwargs={'revision_id': l_datastream_revision_id})
            else:
                l_permalink = LocalHelper.build_permalink('manageVisualization.view', '&visualization_revision_id=' + str(l_visualization_revision_id))

            l_datastream = dict(datastream_revision_id=l_datastream_revision_id
                                , datastream_title=l_datastream_title
                                , datastream_description=l_datastream_description
                                , datastream_parameters=l_parameters
                                , datastream_sources=l_sources
                                , datastream_created_at=l_created_at
                                , datastream_end_point=l_end_point
                                , datastream_id=l_datastream_id
                                , editor_nick=l_editor_nick
                                , category_name=l_category_name
                                , visualization_revision_id=l_visualization_revision_id
                                , visualization_id=l_visualization_id
                                , visualization_details=l_visualization_details
                                , permalink=l_permalink
                                , is_self_publishing=l_is_self_publishing
                                , type = l_resource_type
                                , collect_type = unicode(COLLECT_TYPE_CHOICES[int(l_collect_type)][1]))

            l_resources.append(l_datastream)

        l_search_time   = time.time() - l_start_time
        l_matches       = l_resources_cursor.rowcount
        l_has_next      = self.slice < l_matches

        return l_resources, l_matches, l_has_next, "%.3f" % l_search_time


    def makeQuery(self):

        l_args = []

        #################################
        # Select to retrieve datastreams
        ################################

        l_sql                   =  """(SELECT SQL_CALC_FOUND_ROWS dsr.id as datastream_revision_id
                                    , ds.id as datastream_id
                                    , din.title as datastream_title
                                    , din.description as datastream_description
                                    , din.language as datastream_language
                                    , u.nick as editor_nick
                                    , cin.name as category_name
                                    , dsr.dataset_id as dataset_id
                                    , dsr.created_at as created_at
                                    , null as visualization_revision_id
                                    , null as visualization_id
                                    , null as visualization_details"""

        l_sql = l_sql +            ", '" + settings.TYPE_DATASTREAM + "' as resource_type"
        l_sql = l_sql +            ", dset.type as collect_type"

        if self.terms:
            l_tag_distance_like_sql = self.buildLikeConditionsForTerms(['t1.name'], '=')
            l_regexp_coincidences   = self.buildSelectForTermsCoincidences(['din.title', 'din.description'])

            l_sql = l_sql +             """, (SELECT count(*)
                                              FROM ao_tags_datastream td1
                                              , ao_tags t1
                                              WHERE td1.datastreamrevision_id = dsr.id
                                              AND td1.tag_id = t1.id
                                              AND ( """ + l_tag_distance_like_sql['sql'] + """ )) +
                                        """ + l_regexp_coincidences['sql'] + " as coincidences"

            l_args.extend(l_tag_distance_like_sql['args'])
            l_args.extend(l_regexp_coincidences['args'])

        l_sql = l_sql +              """ FROM ao_datastream_revisions dsr
                                    , ao_datastream_i18n din
                                    , ao_users u
                                    , ao_datastreams ds
                                    , ao_categories_i18n cin
                                    , ao_datasets dset
                                    WHERE u.account_id = %s
                                    AND dsr.user_id = u.id
                                    AND din.datastream_revision_id = dsr.id
                                    AND ds.id = dsr.datastream_id
                                    AND dsr.status not in (2, 5)
                                    AND dsr.dataset_id = dset.id"""

        l_args.append(self.account_id)

        if self.terms:
            l_like_sql     = self.buildLikeConditionsForTerms(['din.title', 'din.description', 'u.nick', 'u.name'], 'like')
            l_tag_like_sql = self.buildLikeConditionsForTerms(['t2.name'], 'like')

            l_sql = l_sql + " AND ( " + l_like_sql['sql'] + """
                                        OR EXISTS(SELECT *
                                            FROM ao_tags_datastream td2
                                            , ao_tags t2
                                            WHERE td2.datastreamrevision_id = dsr.id
                                            AND td2.tag_id = t2.id
                                            AND """ + l_tag_like_sql['sql'] + " ))"

            l_args.extend(l_like_sql['args'])
            l_args.extend(l_tag_like_sql['args'])

        if self.category_id:
            l_sql = l_sql + " AND dsr.category_id = %s"
            l_args.append(self.category_id)

        l_sql = l_sql + " AND cin.category_id = dsr.category_id AND cin.language = %s"
        l_args.append(self.language)

        l_sql = l_sql + " AND dsr.id = (SELECT MAX(id) FROM ao_datastream_revisions dsr2 WHERE dsr2.datastream_id = ds.id))"

        ###################################
        # Union Select to retrieve Visualizations
        ###################################

        l_sql = l_sql +             """ UNION ALL
                                     (SELECT dsr.id as datastream_revision_id
                                    , ds.id as datastream_id
                                    , din.title as datastream_title
                                    , din.description as datastream_description
                                    , din.language as datastream_language
                                    , u.nick as editor_nick
                                    , cin.name as category_name
                                    , dsr.dataset_id as dataset_id
                                    , vsr.created_at as created_at
                                    , vsr.id as visualization_revision_id
                                    , vs.id as visualization_id
                                    , vsr.impl_details as visualization_details"""

        l_sql = l_sql +            ", '" + settings.TYPE_VISUALIZATION + "' as resource_type"
        l_sql = l_sql +            ", dset.type as collect_type"

        if self.terms:
            l_tag_distance_like_sql = self.buildLikeConditionsForTerms(['t3.name'], '=')
            l_regexp_coincidences   = self.buildSelectForTermsCoincidences(['din.title', 'din.description'])

            l_sql = l_sql +             """, (SELECT count(*)
                                              FROM ao_tags_datastream td3
                                              , ao_tags t3
                                              WHERE td3.datastreamrevision_id = dsr.id
                                              AND td3.tag_id = t3.id
                                              AND ( """ + l_tag_distance_like_sql['sql'] + """ )) +
                                        """ + l_regexp_coincidences['sql'] + " as coincidences"

            l_args.extend(l_tag_distance_like_sql['args'])
            l_args.extend(l_regexp_coincidences['args'])

        l_sql = l_sql +              """ FROM ao_visualizations_revisions vsr
                                    , ao_visualizations vs
                                    , ao_datastream_revisions dsr
                                    , ao_datastream_i18n din
                                    , ao_users u
                                    , ao_datastreams ds
                                    , ao_categories_i18n cin
                                    , ao_datasets dset
                                    WHERE u.account_id = %s
                                    AND vsr.user_id = u.id
                                    AND vsr.status not in (2, 5)
                                    AND vs.id = vsr.visualization_id
                                    AND vsr.id = (SELECT MAX(id) FROM ao_visualizations_revisions vsr3 WHERE vsr3.visualization_id = vs.id)
                                    AND ds.id = vs.datastream_id
                                    AND din.datastream_revision_id = dsr.id
                                    AND dsr.datastream_id = ds.id
                                    AND dsr.status not in (2, 5)
                                    AND dsr.dataset_id = dset.id"""

        l_args.append(self.account_id)

        if self.terms:
            l_like_sql     = self.buildLikeConditionsForTerms(['din.title', 'din.description', 'u.nick', 'u.name'], 'like')
            l_tag_like_sql = self.buildLikeConditionsForTerms(['t4.name'], 'like')

            l_sql = l_sql + " AND ( " + l_like_sql['sql'] + """
                                        OR EXISTS(SELECT *
                                            FROM ao_tags_datastream td4
                                            , ao_tags t4
                                            WHERE td4.datastreamrevision_id = dsr.id
                                            AND td4.tag_id = t4.id
                                            AND """ + l_tag_like_sql['sql'] + " ))"

            l_args.extend(l_like_sql['args'])
            l_args.extend(l_tag_like_sql['args'])

        if self.category_id:
            l_sql = l_sql + " AND dsr.category_id = %s"
            l_args.append(self.category_id)

        l_sql = l_sql + " AND cin.category_id = dsr.category_id AND cin.language = %s"
        l_args.append(self.language)

        l_sql = l_sql + " AND dsr.id = (SELECT MAX(id) FROM ao_datastream_revisions dsr3 WHERE dsr3.datastream_id = ds.id))"

        if self.query == '%':
            l_sql = l_sql + " ORDER BY created_at DESC, datastream_title, datastream_description, datastream_language LIMIT %s, %s"
        else:
            l_sql = l_sql + " ORDER BY coincidences DESC, created_at DESC, datastream_title, datastream_description, datastream_language  LIMIT %s, %s"

        l_args.append(self.start)
        l_args.append(self.slice + 1)

        return l_sql, l_args

    def buildLikeConditionsForTerms(self, p_fields, pComparationOperator):
        l_args      = []
        l_sql       = []
        l_field_sql = []
        for l_field in p_fields:
            l_field_sql = []
            for l_parsed_subquery in self.terms:
                l_terms = []
                for l_term in l_parsed_subquery:
                    if pComparationOperator == 'like':
                        l_args.append('%'+l_term+'%')
                    else:
                        l_args.append(l_term)
                    l_terms.append( l_field + " " + pComparationOperator + " %s")

                l_field_sql.append('('+' or '.join(l_terms)+')')

            l_sql.append('('+' and '.join(l_field_sql)+')')

        l_sql = ' or '.join(l_sql)

        return { 'sql': l_sql, 'args': l_args }

    def buildSelectForTermsCoincidences(self, p_fields):

        l_plain_terms_list = []
        for sublist in self.terms:
            if type(sublist) == types.ListType:
                l_plain_terms_list.extend(sublist)

        p_terms            = l_plain_terms_list
        l_plain_terms_list = []
        for term in p_terms:
            l_plain_terms_list.append('[[:<:]]' + self.escapeTermForMysqlRegexp(term)  + '[[:>:]]')

        l_fields = []
        for l_field in p_fields:
            l_fields.append("IFNULL(" + l_field + ", '')")
        l_regexp_sql = 'CASE WHEN CONCAT (' + ", ' ', ".join(l_fields) + ") REGEXP %s THEN 1 ELSE 0 END"

        l_final_list = []
        for term in l_plain_terms_list:
            l_final_list.append(l_regexp_sql)

        return {'sql': '(' + ' + '.join(l_final_list) + ')', 'args': l_plain_terms_list}

    def escapeTermForMysqlRegexp(self, p_term):
        l_escapable_chars = '^$.*+?|(){}[]-'
        l_response = p_term
        for char in l_escapable_chars:
            if char in p_term:
                l_response = l_response.replace(char, '\%s' % char)
        return l_response
