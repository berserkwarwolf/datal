import re
import types
from django.db import models, connection
from django.conf import settings
from django.core.paginator import InvalidPage
from django.core.urlresolvers import reverse
from junar.core.helpers import slugify
from junar.core import helpers, choices

class ResourcesManager(models.Manager):
    def count(self):
        return SearchifyIndex().get().count()

class ThresholdManager(models.Manager):

    def get_limit_by_code_and_user_id(self, code, user_id):
        try:
            return super(ThresholdManager, self).values('limit').get( account_level__account__user__id = user_id, name = code)['limit']
        except self.model.DoesNotExist:
            # we dont have a relationship between every common user an a level 1 account, that would be stupid
            # so instead, we only check for level 1 threshold
            try:
                return super(ThresholdManager, self).values('limit').get( account_level__code = 'level_1', name = code)['limit']
            except self.model.DoesNotExist:
                return 0

    def get_limit_by_code_and_account_id(self, code, account_id):

        try:
            return super(ThresholdManager, self).values('limit').get( account = account_id, name = code)['limit']
        except self.model.DoesNotExist:
            return super(ThresholdManager, self).values('limit').get( account_level__account = account_id, name = code)['limit']


class AccountLevelManager(models.Manager):
    def get_by_code(self, code):
        return super(AccountLevelManager, self).get(code = code)

#class SimplePaginator:
#
#    def __init__(self, matches = 0, page = 1, per_page = settings.PAGINATION_RESULTS_PER_PAGE, max_results = settings.SEARCH_MAX_RESULTS):
#
#        import math
#        self.per_page = per_page
#        self.matches = matches > max_results and max_results or matches
#        self.num_pages = int(math.ceil( self.matches/float(self.per_page)))
#
#        if page < 0 or (page > 2 and page > self.num_pages):
#            raise InvalidPage
#        else:
#            self.page = page
#
#        self.has_previous = self.page > 1
#        self.has_next = self.page < self.num_pages
#        self.previous_page_number = self.page > 1 and self.page - 1 or 1
#        self.next_page_number = self.page < self.num_pages and self.page + 1 or self.num_pages
#        self.page_range = range(1, self.num_pages + 1)

class AccountManager(models.Manager):
    def get_by_domain(self, domain):
        if domain.find("portal.dev.junar.com") > -1:
            dom = domain.split(".")
            from junar.core.models import Account
            return Account.objects.get(pk=int(dom[0]))
            # return super(AccountManager, self).get(account__id = dom[0])
        else:
            return super(AccountManager, self).get(preference__key = 'account.domain', preference__value = domain)

    def get_featured_dashboards(self, dashboard_ids, language, account_id, not_in = False):

        if not dashboard_ids and not not_in:
            return []

        sql = """SELECT `ao_dashboard_revisions`.`dashboard_id`
                        , `ao_dashboard_i18n`.`title`
                 FROM `ao_dashboard_revisions`
                 INNER JOIN `ao_dashboard_i18n` ON (`ao_dashboard_revisions`.`id` = `ao_dashboard_i18n`.`dashboard_revision_id`)
                 INNER JOIN `ao_dashboards` ON (`ao_dashboard_revisions`.`dashboard_id` = `ao_dashboards`.`id`)
                 INNER JOIN `ao_users` ON (`ao_dashboards`.`user_id` = `ao_users`.`id`)
                 WHERE `ao_dashboard_revisions`.`id` IN (
                    SELECT MAX(`ao_dashboard_revisions`.`id`)
                    FROM `ao_dashboard_revisions`
                    WHERE `ao_dashboard_revisions`.`status` = %s
                    GROUP BY `ao_dashboard_revisions`.`dashboard_id`
                    )
                 AND `ao_dashboard_i18n`.`language` = %s
                 AND `ao_users`.`account_id` = %s"""

        params = [choices.StatusChoices.PUBLISHED, language, account_id]
        ss = ', '.join(['%s' for i in dashboard_ids])

        if not_in and dashboard_ids:
            sql += ' AND `ao_dashboards`.`id` NOT IN ('+ ss +')'
            params.extend(dashboard_ids)
        elif dashboard_ids:
            sql += ' AND `ao_dashboards`.`id` IN ('+ ss +')'
            params.extend(dashboard_ids)

        cursor = connection.cursor()
        cursor.execute(sql, params)

        featured_dashboards = []
        for dashboard_id, dashboard_title in cursor.fetchall():
            featured_dashboards.append({'id': dashboard_id, 'title': dashboard_title})

        if dashboard_ids and not not_in:
            order = dashboard_ids
            for featured_dashboard in featured_dashboards:
                id = featured_dashboard['id']
                index = order.index(str(id))
                order[index] = featured_dashboard
            return [ featured_dashboard for featured_dashboard in order if isinstance(featured_dashboard, dict)]

        return featured_dashboards

    def get_featured_accounts(self, account_id):

        sql = """SELECT `ao_accounts`.`id`, `ao_account_preferences`.`value`
                 FROM `ao_accounts`
                 INNER JOIN `ao_account_preferences` ON (`ao_accounts`.`id` = `ao_account_preferences`.`account_id`)
                 WHERE (`ao_accounts`.`parent_id` = %s AND `ao_account_preferences`.`key` = 'account.name')"""
        params = [account_id]

        cursor = connection.cursor()
        cursor.execute(sql, params)

        featured_accounts = []
        for account_id, account_name in cursor.fetchall():
            featured_accounts.append({'id': account_id, 'name': account_name})

        return featured_accounts

class PreferenceManager(models.Manager):

    def get_value_by_account_id_and_key(self, account_id, key):
        return super(PreferenceManager, self).values('value').get( account = account_id, key = key )['value']

    def get_value_by_known_key_and_value(self, known_key, known_value, key):
        account_id = self.get_account_id_by_known_key_and_value(known_key, known_value)
        return self.get_value_by_account_id_and_key(account_id, key)

    def get_account_id_by_known_key_and_value(self, known_key, known_value):
        return super(PreferenceManager, self).values('account_id').get(value = known_value, key = known_key)['account_id']

class DataStreamManager(models.Manager):
    def get_top(self, account_id, limit = 5):
        """ Return the Top DSs Ids. """

        sql = """   SELECT `ao_datastreams`.`id`
                       , COUNT(`ao_datastreams`.`id`) AS `total`
                    FROM `ao_users`
                    INNER JOIN `ao_datastreams` ON (`ao_datastreams`.`user_id` = `ao_users`.`id`)
                    INNER JOIN `ao_datastream_hits` ON (`ao_datastreams`.`id` = `ao_datastream_hits`.`datastream_id`)
                    WHERE account_id = %s
                    GROUP BY `ao_datastreams`.`id`
                    ORDER BY `total` DESC
                    LIMIT %s"""
        params = [account_id, limit]

        cursor = connection.cursor()
        cursor.execute(sql, params)

        top_datastreams = []
        for datastream_id, total in cursor.fetchall():
            top_datastreams.append(datastream_id)

        return top_datastreams


    def get_last(self, account_id, limit = 5):
        """ Return the last DSs Ids. """

        sql = """   SELECT  MAX(`ao_datastream_revisions`.`id`) AS `datastream_revision_id`,
                        `ao_datastream_revisions`.`datastream_id`
                    FROM `ao_datastream_revisions`
                    INNER JOIN `ao_datastreams` ON (`ao_datastreams`.`id` = `ao_datastream_revisions`.`datastream_id`)
                    INNER JOIN `ao_users` ON (`ao_users`.`id` = `ao_datastreams`.`user_id`)
                    WHERE `ao_datastream_revisions`.`status` = %s AND `ao_users`.`account_id` = %s
                    GROUP BY `ao_datastream_revisions`.`datastream_id`
                    ORDER BY `ao_datastream_revisions`.`created_at` DESC
                    LIMIT %s"""

        params = [choices.StatusChoices.PUBLISHED, account_id, limit]

        cursor = connection.cursor()
        cursor.execute(sql, params)

        last_datastreams = []
        for datastream_revision_id, datastream_id in cursor.fetchall():
            last_datastreams.append(datastream_id)

        return last_datastreams

class DashboardManager(models.Manager):
    def get_last(self, account_id, limit = 5):
        """ Return the last DBs Ids. """

        sql = """   SELECT  MAX(`ao_dashboard_revisions`.`id`) AS `dashboard_revision_id`,
                        `ao_dashboard_revisions`.`dashboard_id`
                    FROM `ao_dashboard_revisions`
                    INNER JOIN `ao_dashboards` ON (`ao_dashboards`.`id` = `ao_dashboard_revisions`.`dashboard_id`)
                    INNER JOIN `ao_users` ON (`ao_users`.`id` = `ao_dashboards`.`user_id`)
                    WHERE `ao_dashboard_revisions`.`status` = %s AND `ao_users`.`account_id` = %s
                    GROUP BY `ao_dashboard_revisions`.`dashboard_id`
                    ORDER BY `ao_dashboard_revisions`.`created_at` DESC
                    LIMIT %s"""

        params = [choices.StatusChoices.PUBLISHED, account_id, limit]

        cursor = connection.cursor()
        cursor.execute(sql, params)

        last_dashboards = []
        for dashboard_revision_id, dashboard_id in cursor.fetchall():
            last_dashboards.append(dashboard_id)

        return last_dashboards

class CategoryManager(models.Manager):
    def get_for_home(self, language, account_ids = None, limit = None):
        cursor = connection.cursor()

        sql = """SELECT `ao_categories`.`id`,
                 `ao_categories_i18n`.`name`
          FROM `ao_categories_i18n`
          , `ao_categories` """

        sql += """ WHERE language = %s"""
        sql += """ AND `ao_categories_i18n`.`category_id` = `ao_categories`.`id`"""

        accounts_filter = account_ids
        if type(account_ids) != types.ListType:
            accounts_filter = [account_ids]

        sql += """ AND ("""
        op = """"""
        for account_id in accounts_filter:
            sql += op + """ `ao_categories`.`account_id` = %s"""
            op = """ OR """

        sql += """)"""

        sql += """ GROUP BY name
          ORDER BY name ASC"""

        if limit:
            sql += """ LIMIT %s""" % limit

        params = [language]

        for account_id in accounts_filter:
            params.append(account_id)

        cursor.execute(sql, params)
        row = cursor.fetchone()

        categories = []
        while row:
            categories += [{'id': row[0], 'name': row[1]}]
            row = cursor.fetchone()

        return categories

    def get_for_transparency(self, account):
        """ get categories for transparency microsite on selected account """
        categs = account.get_preference('account.transparency.categories').split()
        from junar.core.models import Category
        categories_id = Category.objects.values("id", "categoryi18n__id", "categoryi18n__name").filter(id__in = categs)

        categories = []
        for category in categories_id:
            categories +=  [{ 'id': category["id"], 'name': category["categoryi18n__name"]}]

        return categories



class UserPassTicketsManager(models.Manager):
    pass

class VisualizationManager(models.Manager):
    def get_top(self, account_id, limit = 5):

        sql = """   SELECT `ao_visualizations`.`id`
                           , COUNT(`ao_visualizations`.`id`) AS `total`
                    FROM `ao_users`
                    INNER JOIN `ao_visualizations` ON (`ao_visualizations`.`user_id` = `ao_users`.`id`)
                    INNER JOIN `ao_visualization_hits` ON (`ao_visualizations`.`id` = `ao_visualization_hits`.`visualization_id`)
                    WHERE account_id = %s
                    GROUP BY `ao_visualizations`.`id`
                    ORDER BY `total` DESC
                    LIMIT %s"""
        params = [account_id, limit]

        cursor = connection.cursor()
        cursor.execute(sql, params)

        top_visualizations = []
        for visualization_id, total in cursor.fetchall():
            top_visualizations.append(visualization_id)

        return top_visualizations


    def get_last(self, account_id, limit = 5):
        """ Return the last VZs Ids. """

        sql = """   SELECT  MAX(`ao_visualizations_revisions`.`id`) AS `visualization_revision_id`,
                        `ao_visualizations_revisions`.`visualization_id`
                    FROM `ao_visualizations_revisions`
                    INNER JOIN `ao_visualizations` ON (`ao_visualizations`.`id` = `ao_visualizations_revisions`.`visualization_id`)
                    INNER JOIN `ao_users` ON (`ao_users`.`id` = `ao_visualizations`.`user_id`)
                    WHERE `ao_visualizations_revisions`.`status` = %s AND `ao_users`.`account_id` = %s
                    GROUP BY `ao_visualizations_revisions`.`visualization_id`
                    ORDER BY `ao_visualizations_revisions`.`created_at` DESC
                    LIMIT %s"""

        params = [choices.StatusChoices.PUBLISHED, account_id, limit]

        cursor = connection.cursor()
        cursor.execute(sql, params)

        last_visualizations = []
        for visualization_revision_id, visualization_id in cursor.fetchall():
            last_visualizations.append(visualization_id)

        return last_visualizations

class DataStreamParameterManager(models.Manager):

    def queryByDataStreamRevisionId(self, p_revision_id, p_language=settings.LANGUAGE_CODE[0:2]):
        parameter_id            = 0
        parameter_position     = 1
        parameter_name         = 2
        parameter_description  = 3

        l_parameter_cursor  = connection.cursor()

        l_parameter_cursor.execute("""
                                    SELECT id
                                    , coalesce(position, 0)
                                    , name
                                    , description
                                    FROM ao_datastream_parameters
                                    WHERE datastream_revision_id = %s
                                    ORDER BY position
                                    """, [p_revision_id])


        l_parameters_rows    = l_parameter_cursor.fetchall().__iter__()
        l_parameter_row      = helpers.next(l_parameters_rows, None)

        l_parameters = []
        while l_parameter_row != None:

            l_parameter_id                      = l_parameter_row[parameter_id]
            l_parameter_name                    = l_parameter_row[parameter_name]
            l_parameter_description             = l_parameter_row[parameter_description]

            l_parameter = dict(parameter_id=l_parameter_id
                                , parameter_name=l_parameter_name
                                , parameter_description=l_parameter_description
                                , parameter_value=None)

            l_parameters.append(l_parameter)
            l_parameter_row = helpers.next(l_parameters_rows, None)

        return l_parameters

class DataSetManager(models.Manager):

    def getEndPointById(self, p_id):
        dataset_revision_id   = 0
        dataset_end_point     = 1

        l_dataset_cursor  = connection.cursor()

        l_dataset_cursor.execute("""SELECT id
                                    , end_point
                                    FROM ao_dataset_revisions
                                    WHERE dataset_id = %s
                                    ORDER BY id DESC
                                    """, [p_id])


        l_datasets_rows    = l_dataset_cursor.fetchall().__iter__()
        l_dataset_row      = helpers.next(l_datasets_rows, None)

        l_dataset_revision_id = l_dataset_row[dataset_revision_id]
        l_dataset_end_point   = l_dataset_row[dataset_end_point]

        return l_dataset_end_point, l_dataset_end_point.startswith('file://')

class DatasetRevisionManager(models.Manager):

    def get_last_published_id(self, dataset_id):
        return super(DatasetRevisionManager, self).filter(dataset_id = dataset_id, status = choices.StatusChoices.PUBLISHED).aggregate(models.Max('id'))['id__max']

    def get_last_published(self, resource_id):
        revision_id = self.get_last_published_id(resource_id)
        return super(DatasetRevisionManager, self).get(pk=revision_id)

    def get_last_revision_id(self, dataset_id):
        return super(DatasetRevisionManager, self).filter(dataset_id = dataset_id).aggregate(models.Max('id'))['id__max']

    def get_last_revision(self, resource_id):
        revision_id = self.get_last_revision_id(resource_id)
        return super(DatasetRevisionManager, self).get(pk=revision_id)
        
class FinderManager:

    def __init__(self):
        self.finder = None

    def get_finder(self):
        if not self.finder:
            self.finder = self.finder_class()
        return self.finder

    def get_failback_finder(self):
        self.finder = self.failback_finder_class()
        return self.finder

    def search(self, *args, **kwargs):

        try:
            return self.get_finder().search(*args, **kwargs)
        except InvalidPage:
            raise
        except Exception, e:
            return self.get_failback_finder().search(*args, **kwargs)

class Finder:
    def __init__(self):
        pass

    def extract_terms_from_query(self):
        l_subqueries = re.split('\+', self.query.strip())
        l_query_terms = []

        for l_subquery in l_subqueries:
            if l_subquery:
                l_terms = re.split('"(.*?)"|', l_subquery.strip())
                l_subquery_terms = []
                for l_term in l_terms:
                    try:
                        l_clean_term = l_term.strip()
                        if l_clean_term:
                            l_subquery_terms.append(l_clean_term)
                    except:
                        pass
                l_query_terms.append(l_subquery_terms)

        # cleaning the blocked terms, unless this terms are the only terms
        l_term_count = 0
        l_terms_filtered = []
        for l_query in l_query_terms:
            l_subquery_terms = []
            for l_term in l_query:
                if l_term not in settings.SEARCH_TERMS_EXCLUSION_LIST:
                    l_subquery_terms.append(l_term)
                    l_term_count = l_term_count + 1
            l_terms_filtered.append(l_subquery_terms)

        if l_term_count:
            self.terms = l_terms_filtered
        else:
            self.terms = l_query_terms

        self.terms = [ subquery for subquery in self.terms if subquery ]

class DashboardRevisionManager(models.Manager):

    def get_last_published_id(self, dashboard_id):
        return super(DashboardRevisionManager, self).filter(dashboard_id = dashboard_id, status = choices.StatusChoices.PUBLISHED).aggregate(models.Max('id'))['id__max']

    def get_last_published(self, resource_id):
        revision_id = self.get_last_published_id(resource_id)
        return super(DashboardRevisionManager, self).get(pk=revision_id)

    def get_last_revision_id(self, resource_id):
        return super(DashboardRevisionManager, self).filter(dashboard_id = resource_id).aggregate(models.Max('id'))['id__max']

    def get_last_revision(self, resource_id):
        revision_id = self.get_last_revision_id(resource_id)
        return super(DashboardRevisionManager, self).get(pk=revision_id)

class DataStreamRevisionManager(models.Manager):
    def get_guids_with_cache(self):
        sql = """SELECT
              aodr.datastream_rev_id,
              adr.dataset_rev_id,
              aod.guid
            FROM
              ao_datastreams aod
            INNER JOIN (
            SELECT
              datastream_id, dataset_id, MAX(id) AS datastream_rev_id, status
            FROM
              ao_datastream_revisions
            WHERE
              status = %s GROUP BY datastream_id, status)
            AS aodr ON aod.id = aodr.datastream_id
            INNER JOIN (
            SELECT
              dataset_id, MAX(id) AS dataset_rev_id, status
            FROM
              ao_dataset_revisions
            WHERE
              status = %s AND
              impl_details LIKE '%%useCache="true"%%'
            GROUP BY
              dataset_id, status)
            AS adr ON aodr.dataset_id = adr.dataset_id"""

        params = [choices.StatusChoices.PUBLISHED, choices.StatusChoices.PUBLISHED]
        cursor = connection.cursor()
        cursor.execute(sql, params)

        last_guids = []
        for guid in cursor.fetchall():
            last_guids.append(guid)

        return last_guids

    def get_last_published_id(self, datastream_id):
        return super(DataStreamRevisionManager, self).filter(datastream_id = datastream_id, status = choices.StatusChoices.PUBLISHED).aggregate(models.Max('id'))['id__max']

    def get_last_published_by_guid(self, guid):
        return super(DataStreamRevisionManager, self).filter(datastream__guid = guid, status = choices.StatusChoices.PUBLISHED).aggregate(models.Max('id'))['id__max']

    def get_last_published(self, resource_id):
        revision_id = self.get_last_published_id(resource_id)
        return super(DataStreamRevisionManager, self).get(pk=revision_id)

    def get_last_revision_id(self, resource_id):
        return super(DataStreamRevisionManager, self).filter(datastream_id = resource_id).aggregate(models.Max('id'))['id__max']

    def get_last_revision(self, resource_id):
        revision_id = self.get_last_revision_id(resource_id)
        return super(DataStreamRevisionManager, self).get(pk=revision_id)

class VisualizationRevisionManager(models.Manager):

    def get_last_published_id(self, visualization_id):
        return super(VisualizationRevisionManager, self).filter(visualization_id = visualization_id, status = choices.StatusChoices.PUBLISHED).aggregate(models.Max('id'))['id__max']

    def get_last_published_by_guid(self, guid):
        return super(VisualizationRevisionManager, self).filter(visualization__guid = guid, status = choices.StatusChoices.PUBLISHED).aggregate(models.Max('id'))['id__max']

    def get_last_published(self, resource_id):
        revision_id = self.get_last_published_id(resource_id)
        return super(VisualizationRevisionManager, self).get(pk=revision_id)

    def get_last_revision_id(self, resource_id):
        return super(VisualizationRevisionManager, self).filter(visualization_id = resource_id).aggregate(models.Max('id'))['id__max']

    def get_last_revision(self, resource_id):
        revision_id = self.get_last_revision_id(resource_id)
        return super(VisualizationRevisionManager, self).get(pk=revision_id)

class IndexTankFinder(Finder):

    order_by = {}

    def __init__(self):
        from indextank.client import ApiClient
        self.api_client = ApiClient(settings.SEARCHIFY['api_url'])
        self.index = self.api_client.get_index(settings.SEARCHIFY['index'])
        Finder.__init__(self)

    def search(self, *args, **kwargs):

        self.query      = kwargs.get('query', '')
        self.account_id = kwargs.get('account_id')
        self.resource   = kwargs.get('resource', 'all')
        self.is_private = 0
        page            = kwargs.get('page', 0)
        max_results     = kwargs.get('max_results', settings.SEARCH_MAX_RESULTS)
        slice           = kwargs.get('slice', settings.PAGINATION_RESULTS_PER_PAGE)

        if page == 0:
            start   = 0
            end     = max_results
        else:
            end     = max_results < slice and max_results or slice
            start   = (page - 1) * end

        self.meta_data = kwargs.get('meta_data', {})

        self.extract_terms_from_query()

        query = self.make_query()
        self.last_query = query # for test queries
        ### CATEGORY FILTERS
        category_filters = kwargs.get('category_filters', None)
        if category_filters is None:
            category_filters = {}
            self._get_category_filters(category_filters, 'id', kwargs.get('category_id'))
            self._get_category_filters(category_filters, 'name', kwargs.get('category_name'))

        scoring = kwargs.get('scoring', 1)
        
        #TODO define a search function in the right place
        results = self.index.search(query
                                    , start=start
                                    , length=end
                                    , snippet_fields=['title','text']
                                    , fetch_fields="*"
                                    """
                                    , fetch_fields=['datastream_id'
                                                    , 'title'
                                                    , 'category_name'
                                                    , 'owner_nick'
                                                    , 'tags'
                                                    , 'dataset_id'
                                                    , 'end_point'
                                                    , 'type'
                                                    , 'text'
                                                    , 'description'
                                                    , 'dashboard_id'
                                                    , 'datastreamrevision_id'
                                                    , 'parameters'
                                                    , 'visualization_id'
                                                    , 'timestamp'
                                                    , 'account_id']
                                    """
                                    , category_filters = category_filters
                                    , scoring_function = scoring
                                    )

        search_time     = results['search_time']
        facets          = results['facets']
        facets[u'id']   = None
        docs            = results['results']

        order = kwargs.get('order', None)
        if order:
            docs = sorted(docs, key=lambda x: x[self.order_by.get(order)], reverse=(kwargs.get('order_type', 'descending') == 'descending'))

        results = []
        # for check the real results ==> results.append(docs)

        for doc in docs:
            try:
                doc['category_name'] = doc.get("category_name","UNCATEGORIZED")
                to_add = self.get_dictionary(doc)
                results.append(to_add)
                # TODO, I can't find the problem
                """
                if doc['category_name'] == "":
                    logger.error("Can't find category on index -- %s" % str(doc))
                else:
                    logger.error("OK find category on index -- %s" % str(doc))
                """
            except Exception, e:
                logger.error('Search IndexTank [ERROR(%s--%s)] with doc = %s [TRACE:%s]' % (doc['type'], doc['title'], unicode(doc), repr(e)))

        return results, search_time, facets

    def _get_category_filters(self, category_filters, filter_key, filter_value):
        if filter_value:
            if type(filter_value) == types.ListType:
                category_filters[filter_key] = filter_value
            else:
                category_filters[filter_key] = [filter_value]

    def make_query(self):

        l_subqueries = []
        if self.query:

            for l_term_set in self.terms:
                l_sub_query = ''
                l_terms_or = ' OR '.join(l_term_set)
                l_terms_and = ' AND '.join(l_term_set)
                l_terms_and = '(' + l_terms_and + ')^10'
                l_sub_query = ' OR '.join([l_terms_or, l_terms_and])
                l_subqueries.append(l_sub_query)

        if len(l_subqueries) > 1:
            l_subqueries = [ '(' + l_subquery + ')' for l_subquery in l_subqueries ]

        l_indextank_query = ' AND '.join(l_subqueries)

        metadata_query = ''
        for i in self.meta_data:
            metadata_query = ' AND '.join(['%s:%s' % (i, self.meta_data[i])])

        if l_indextank_query and metadata_query:
            l_indextank_query = ' AND '.join([l_indextank_query, metadata_query])
        elif metadata_query:
            l_indextank_query = metadata_query

        # user search is here to prevent ORs ANDs bugs we put ()
        if l_indextank_query:
            l_indextank_query = '(' + l_indextank_query + ')'

        # privates
        subquery = self._get_query({'is_private': self.is_private})
        l_indextank_query = self._add_query(l_indextank_query, subquery)

        # accounts!
        if self.account_id:
            # for one account_id
            if type(self.account_id) in (types.LongType, types.IntType):
                subquery = self._get_query({'account_id': self.account_id})
                l_indextank_query = self._add_query(l_indextank_query, subquery)
            else:
                # for more than one account
                account_list = []
                for accountid in self.account_id:
                    account_list.append(self._get_query({'account_id': accountid}))
                subquery = '(' + ' OR '.join(account_list) + ')'
                l_indextank_query = self._add_query(l_indextank_query, subquery)

        # resource
        # all        -> 'AND (type:ds OR type:db OR type:chart)'
        # ds         -> 'AND type:ds'
        # [ds,chart] -> 'AND (type:ds OR type:chart)'

        # curating resource types
        if self.resource == 'all':
            self.resource = ['ds', 'db', 'chart']
            # if 'account.catalog.enabled' preference is enable the show datasets
            if self.account_id:
                # for resource definition
                from junar.core.models import Preference
                preference, created = Preference.objects.get_or_create(account_id=self.account_id, key='account.catalog.enabled')
                if created:
                    preference.value = "False"
                    preference.save()
                else:
                    if preference.value == "True":
                        self.resource = ['ds', 'db', 'chart', 'dt']


#        elif self.resource in resource_types:
#            self.resource = [self.resource]

        resource_type_query = ''
        for res in self.resource:
            subquery = self._get_query({'type': res})
            resource_type_query = self._add_query(resource_type_query, subquery, 'OR')

        if len(self.resource) > 1:
            l_indextank_query = self._add_query(l_indextank_query, '('+resource_type_query+')')
        else:
            l_indextank_query = self._add_query(l_indextank_query, resource_type_query)

        return l_indextank_query

    def get_dictionary(self, doc):
        if doc['type'] == 'ds':
            return self.get_datastream_dictionary(doc)
        elif doc['type'] == 'db':
            return self.get_dashboard_dictionary(doc)
        elif doc['type'] == 'chart':
            return self.get_visualization_dictionary(doc)
        elif doc['type'] == 'dt':
            return self.get_dataset_dictionary(doc)

    def get_datastream_dictionary(self, p_doc):

        l_parameters = []
        if p_doc['parameters']:
            import json
            l_parameters = json.loads(p_doc['parameters'])

        id = p_doc['datastream_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('datastream_manager.action_view', kwargs={'id': id, 'slug': slug})

        l_datastream = dict (dataservice_id=id
                                , title=title
                                , description=p_doc['description']
                                , parameters=l_parameters
                                , tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ]
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return l_datastream

    def get_dataset_dictionary(self, p_doc):

        l_parameters = []
        if p_doc['parameters']:
            import json
            l_parameters = json.loads(p_doc['parameters'])

        dataset_id = p_doc['dataset_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('manageDatasets.action_view', urlconf = 'junar.microsites.urls', kwargs={'id': dataset_id, 'slug': slug})
        
        l_dataset = dict (dataset_id=dataset_id
                                , title=title
                                , description=p_doc['description']
                                , parameters=l_parameters
                                , tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ]
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return l_dataset

    def get_visualization_dictionary(self, p_doc):

        try:
            if p_doc['parameters']:
                import json
                l_parameters = json.loads(p_doc['parameters'])
        except:
            l_parameters = []

        id = p_doc['visualization_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('chart_manager.action_view', kwargs={'id': id, 'slug': slug})

        visualization = dict(visualization_id=id
                                , title=title
                                , description=p_doc['description']
                                , parameters=l_parameters
                                , tags=[ l_tag.strip() for l_tag in p_doc['tags'].split(',') ]
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return visualization

    def get_dashboard_dictionary(self, p_doc):

        id = p_doc['dashboard_id']
        title = p_doc['title']
        slug = slugify(title)
        permalink = reverse('dashboard_manager.action_view', kwargs={'id': id, 'slug': slug})

        dashboard_dict = dict (dashboard_id=id
                                , title=title
                                , description=p_doc['description']
                                , tags=[ tag.strip() for tag in p_doc['tags'].split(',') ]
                                , user_nick=p_doc['owner_nick']
                                , permalink=permalink
                                , type = p_doc['type']
                                )
        return dashboard_dict

    def _get_query(self, values, boolean_operator = 'AND'):
        self._validate_boolean_operator(boolean_operator)

        query = []
        for pair in values.iteritems():
            query.append('%s:%s' % pair)
        boolean_operator_query = ' %s ' % boolean_operator
        return boolean_operator_query.join(query)

    def _add_query(self, query, subquery, boolean_operator = 'AND'):
        self._validate_boolean_operator(boolean_operator)

        if query:
            return ' '.join([query, boolean_operator, subquery])
        else:
            return subquery

    def _validate_boolean_operator(self, boolean_operator):
        boolean_operators = ['AND', '+', 'OR', 'NOT', '-']
        if boolean_operator not in boolean_operators:
            raise Exception('Boolean operator used, does not exists')

class MessageManager(models.Manager):
    pass

class ObjectGrantManager(models.Manager):

    def get_collaborators(self, object_id, object_type):

        sql = """SELECT `ao_users`.`nick`,
                        `ao_users`.`email`,
                        `ao_user_roles`.`code`
                 FROM `ao_user_object_grants`
                 INNER JOIN `ao_user_grants` ON (`ao_user_object_grants`.`grant_id` = `ao_user_grants`.`id`)
                 INNER JOIN `ao_users` ON (`ao_user_grants`.`user_id` = `ao_users`.`id`)
                 INNER JOIN `ao_user_roles` ON (`ao_user_grants`.`role_id` = `ao_user_roles`.`id`)
                 WHERE `ao_user_object_grants`.`type` = %s AND `ao_user_object_grants`.`"""+object_type+"""_id` = %s
                 ORDER BY `ao_user_object_grants`.`created_at` DESC"""

        params = [object_type, object_id]
        cursor = connection.cursor()
        cursor.execute(sql, params)

        collaborators = []
        for nick, email, role_code in cursor.fetchall():
            collaborators.append({'email': email, 'role': role_code, 'nick': nick})
        return collaborators

    def get_available_users(self, object_id, object_type, account_id):

        sql = """SELECT `ao_users`.`id`,
                        `ao_users`.`nick`,
                        `ao_users`.`email`
                 FROM `ao_users`
                 INNER JOIN `ao_user_role_roles` ON (`ao_users`.`id` = `ao_user_role_roles`.`user_id`)
                 INNER JOIN `ao_user_roles` ON (`ao_user_role_roles`.`role_id` = `ao_user_roles`.`id`)
                 WHERE `ao_users`.`account_id` = %s AND `ao_user_roles`.`code` IN ('ao-member')
                 AND `ao_users`.`id` NOT IN (
                    SELECT `ao_user_grants`.`user_id`
                    FROM `ao_user_grants`
                    INNER JOIN `ao_user_object_grants` ON (`ao_user_object_grants`.`grant_id` = `ao_user_grants`.`id`)
                    WHERE `ao_user_object_grants`.`type` = %s AND `ao_user_object_grants`.`"""+object_type+"""_id` = %s
                )"""

        params = [account_id, object_type, object_id]
        cursor = connection.cursor()
        cursor.execute(sql, params)

        available_users = []
        for user_id, nick, email in cursor.fetchall():
            available_users.append({'user_id': user_id, 'email': email, 'nick': nick})

        return available_users

    def has_privilege_on_object(self, object_id, object_type, user_id, privilege_code):

        sql = """SELECT 1
                 FROM `ao_user_object_grants`
                 INNER JOIN `ao_user_grants` ug0 ON (`ao_user_object_grants`.`grant_id` = ug0.`id`)
                 INNER JOIN `ao_user_roles` ON (ug0.`role_id` = `ao_user_roles`.`id`)
                 INNER JOIN `ao_user_grants` ug1 ON (`ao_user_roles`.`id` = ug1.`role_id`)
                 INNER JOIN `ao_user_privileges` ON (ug1.`privilege_id` = `ao_user_privileges`.`id`)
                 WHERE `ao_user_object_grants`.`type` = %s AND `ao_user_object_grants`.`"""+object_type+"""_id` = %s
                 AND ug0.`user_id` = %s AND `ao_user_privileges`.`code` = %s"""

        params = [object_type, object_id, user_id, privilege_code]
        cursor = connection.cursor()
        cursor.execute(sql, params)
        return bool(cursor.fetchall())
