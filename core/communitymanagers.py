from django.db import connection
from django.core.urlresolvers import reverse
from core.models import *
from core.utils import slugify
from core import helpers

from core.search import *

# CategoryManager
def get_for_browse(self, category_slug, language):
    category_query = super(managers.CategoryManager, self).values('id', 'categoryi18n__name')
    category_query = category_query.filter(categoryi18n__language=language, categoryi18n__slug=category_slug)[0]
    return {'id': category_query['id'], 'name': category_query['categoryi18n__name']}
managers.CategoryManager.get_for_browse = get_for_browse


class FinderManager(finder.FinderManager):
    def __init__(self, finder_class=searchify.IndexTankFinder, failback_finder_class=searchify.IndexTankFinder):
        self.finder_class = finder_class
	self.finder = elastic.ElasticsearchFinder
        self.failback_finder_class = failback_finder_class
        self.failback_finder_class = elastic.ElasticsearchFinder
        finder.FinderManager.__init__(self)


def visualization_query_hot_n(self, lang, hot = None):

    if not hot:
        hot = Setting.objects.get(pk = settings.HOT_VISUALIZATIONS).value

    sql = """SELECT `ao_datastream_revisions`.`id` AS `datastream_revision_id`,
               `ao_visualizations_revisions`.`id` AS `visualization_revision_id`,
               `ao_datastreams`.`id` AS `datastream_id`,
               `ao_visualizations`.`id` AS `visualization_id`,
               `ao_visualizations_revisions`.`impl_details`,
               `ao_datastream_i18n`.`title`,
               `ao_datastream_i18n`.`description`,
               `ao_categories_i18n`.`name` AS `category_name`,
               `ao_users`.`account_id`
            FROM `ao_visualizations_revisions`
            INNER JOIN `ao_visualizations` ON (`ao_visualizations_revisions`.`visualization_id` = `ao_visualizations`.`id`)
            INNER JOIN `ao_datastreams` ON (`ao_visualizations`.`datastream_id` = `ao_datastreams`.`id`)
            INNER JOIN `ao_datastream_revisions` ON (`ao_datastreams`.`id` = `ao_datastream_revisions`.`datastream_id` AND `ao_datastream_revisions`.`status` = 3)
            INNER JOIN `ao_datastream_i18n` ON (`ao_datastream_revisions`.`id` = `ao_datastream_i18n`.`datastream_revision_id`)
            INNER JOIN `ao_categories` ON (`ao_datastream_revisions`.`category_id` = `ao_categories`.`id`)
            INNER JOIN `ao_categories_i18n` ON (`ao_categories`.`id` = `ao_categories_i18n`.`category_id`)
            INNER JOIN `ao_users` ON (`ao_visualizations`.`user_id` = `ao_users`.`id`)
            WHERE `ao_visualizations_revisions`.`id` IN (
                    SELECT MAX(`ao_visualizations_revisions`.`id`)
                    FROM `ao_visualizations_revisions`
                    WHERE `ao_visualizations_revisions`.`visualization_id` IN ("""+ hot +""")
                          AND `ao_visualizations_revisions`.`status` = 3
                    GROUP BY `visualization_id`
                )
             AND `ao_categories_i18n`.`language` = %s
            ORDER BY `ao_visualizations`.`id` DESC, `ao_datastreams`.`id` DESC, `ao_visualizations_revisions`.`id` DESC, `ao_datastream_revisions`.`id` DESC"""

    cursor = connection.cursor()
    cursor.execute(sql, (lang,))

    rows    = cursor.fetchall().__iter__()
    row     = helpers.next(rows, None)

    visualizations = []
    while row != None:
        datastream_id = row[2]
        visualization_id = row[3]
        title = row[5]
        permalink = reverse('chart_manager.action_view', kwargs={'id': visualization_id, 'slug': slugify(title)})
        visualizations.append({'id'           : row[0],
                               'sov_id'       : row[1],
                               'impl_details' : row[4],
                               'title'        : title,
                               'description'  : row[6],
                               'category'     : row[7],
                               'permalink'    : permalink,
                               'account_id'   : row[8]
                            })

        while row != None and datastream_id == row[2] and visualization_id == row[3]:
            row = helpers.next(rows, None)

    return visualizations
managers.VisualizationManager.query_hot_n = visualization_query_hot_n

def datastream_query_hot_n(self, limit, lang, hot = None):

    if not hot:
        hot = Setting.objects.get(pk = settings.HOT_DATASTREAMS).value

    sql = """SELECT `ao_datastream_revisions`.`id` as 'datastream_revision_id',
               `ao_datastream_revisions`.`datastream_id` as 'datastream_id',
               `ao_datastream_i18n`.`title`,
               `ao_datastream_i18n`.`description`,
               `ao_categories_i18n`.`name` AS `category_name`,
               `ao_users`.`nick` AS `user_nick`,
               `ao_users`.`email` AS `user_email`,
               `ao_users`.`account_id`
        FROM `ao_datastream_revisions`
        INNER JOIN `ao_datastream_i18n` ON (`ao_datastream_revisions`.`id` = `ao_datastream_i18n`.`datastream_revision_id`)
        INNER JOIN `ao_categories` ON (`ao_datastream_revisions`.`category_id` = `ao_categories`.`id`)
        INNER JOIN `ao_categories_i18n` ON (`ao_categories`.`id` = `ao_categories_i18n`.`category_id`)
        INNER JOIN `ao_datastreams` ON (`ao_datastream_revisions`.`datastream_id` = `ao_datastreams`.`id`)
        INNER JOIN `ao_users` ON (`ao_datastreams`.`user_id` = `ao_users`.`id`)
        WHERE `ao_datastream_revisions`.`id` IN (
            SELECT MAX(`ao_datastream_revisions`.`id`)
            FROM `ao_datastream_revisions`
             WHERE `ao_datastream_revisions`.`datastream_id` IN (""" + hot + """)
                   AND `ao_datastream_revisions`.`status` = 3
            GROUP BY `datastream_id`
        ) -- AND `ao_categories_i18n`.`language` = %s"""

    cursor = connection.cursor()
    cursor.execute(sql, [lang])
    row = cursor.fetchone()
    datastreams = []
    while row:
        datastream_id = row[1]
        title = row[2]
        slug = slugify(title)
        permalink = reverse('exportDataStream.action_view', kwargs={'id': datastream_id, 'slug': slug})
        datastreams.append({'id'          : row[0],
                            'title'        : title,
                            'description'  : row[3],
                            'category_name': row[4],
                            'user_nick'    : row[5],
                            'user_email'   : row[6],
                            'permalink'    : permalink,
                            'account_id'   : row[7]
                            })
        row = cursor.fetchone()
    return datastreams
managers.DataStreamManager.query_hot_n = datastream_query_hot_n


def dashboard_query_hot_n(self, lang, hot = None):

    sql = """SELECT `ao_dashboard_revisions`.`id` as 'dashboard_revision_id',
               `ao_dashboard_revisions`.`dashboard_id` as 'dashboard_id',
               `ao_dashboard_i18n`.`title`,
               `ao_dashboard_i18n`.`description`,
               `ao_categories_i18n`.`name` AS `category_name`,
               `ao_users`.`nick` AS `user_nick`,
               `ao_users`.`email` AS `user_email`,
               `ao_users`.`account_id`
        FROM `ao_dashboard_revisions`
        INNER JOIN `ao_dashboard_i18n` ON (`ao_dashboard_revisions`.`id` = `ao_dashboard_i18n`.`dashboard_revision_id`)
        INNER JOIN `ao_categories` ON (`ao_dashboard_revisions`.`category_id` = `ao_categories`.`id`)
        INNER JOIN `ao_categories_i18n` ON (`ao_categories`.`id` = `ao_categories_i18n`.`category_id`)
        INNER JOIN `ao_dashboards` ON (`ao_dashboard_revisions`.`dashboard_id` = `ao_dashboards`.`id`)
        INNER JOIN `ao_users` ON (`ao_dashboards`.`user_id` = `ao_users`.`id`)
        WHERE `ao_dashboard_revisions`.`id` IN (
            SELECT MAX(`ao_dashboard_revisions`.`id`)
            FROM `ao_dashboard_revisions`
            WHERE `ao_dashboard_revisions`.`dashboard_id` IN (""" + hot + """)
                  AND `ao_dashboard_revisions`.`status` = 3
            GROUP BY `dashboard_id`
        ) AND `ao_categories_i18n`.`language` = %s"""

    cursor = connection.cursor()
    cursor.execute(sql, (lang))
    row = cursor.fetchone()
    dashboards = []
    while row:
        dashboard_id = row[1]
        title = row[2]
        slug = slugify(title)
        permalink = reverse('dashboard_manager.action_view', kwargs={'id': dashboard_id, 'slug': slug})
        dashboards.append({'id'          : row[0],
                            'title'        : title,
                            'description'  : row[3],
                            'category_name': row[4],
                            'user_nick'    : row[5],
                            'user_email'   : row[6],
                            'permalink'    : permalink,
                            'account_id'   : row[7]
                            })
        row = cursor.fetchone()

    return dashboards

managers.DashboardManager.query_hot_n = dashboard_query_hot_n
