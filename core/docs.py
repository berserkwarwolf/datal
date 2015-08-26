from django.core.urlresolvers import reverse
from django.db import connection
from django.http import Http404

from core.choices import StatusChoices, CollectTypeChoices, COLLECT_TYPE_CHOICES
from core.helpers import slugify
from core.primitives import PrimitiveComputer

DEFAULT_URLCONF = ''

class DB:
    def __init__(self, dashboardrevision_id, language, last = True):
        self.language = language
        self.last = last
        cursor = self.get_from_db(dashboardrevision_id)
        row = cursor.fetchone()
        if row is None:
            self.language = self.language == 'en' and 'es' or 'en'
            cursor = self.get_from_db(dashboardrevision_id)
            row = cursor.fetchone()
            if row is None:
                raise Http404
        self.dashboard_id = row[0]
        self.created_by_id = row[1]
        self.guid = row[2]
        self.dashboardrevision_id = row[3]
        self.created_at = row[4]
        self.metadata = row[5]
        self.title = row[6]
        self.description = row[7]
        self.notes = row[8]
        self.created_by_nick = row[9]
        self.created_by_email = row[10]
        self.edited_by_id = row[11]
        self.edited_by_nick = row[12]
        self.edited_by_email = row[13]
        self.account_id = row[14]
        self.category_id = row[15]
        self.category_name = row[16]
        self.status = row[17]
        self.widgets = []
        self.tags = None
        self.slug = slugify(self.title)

    def get_from_db(self, dashboardrevision_id):
        sql = """SELECT `ao_dashboards`.`id` AS `dashboard_id`
                    , `ao_dashboards`.`user_id` AS `created_by_id`
                    , `ao_dashboards`.`guid`
                    , `ao_dashboard_revisions`.`id` AS `dashboardrevision_id`
                    , `ao_dashboard_revisions`.`created_at`
                    , `ao_dashboard_revisions`.`meta_text`
                    , `ao_dashboard_i18n`.`title`
                    , `ao_dashboard_i18n`.`description`
                    , `ao_dashboard_i18n`.`notes`
                    , `resource_user`.`nick` AS `created_by_nick`
                    , `resource_user`.`email` AS `created_by_email`
                    , `revision_user`.`id` AS `edited_by_id`
                    , `revision_user`.`nick` AS `edited_by_nick`
                    , `revision_user`.`email` AS `edited_by_email`
                    , `resource_user`.`account_id`
                    , `ao_categories`.`id` AS `category_id`
                    , `ao_categories_i18n`.`name` AS `category_name`
                    , `ao_dashboard_revisions`.`status`
                FROM `ao_dashboards`
                INNER JOIN `ao_dashboard_revisions` ON (`ao_dashboards`.`id` = `ao_dashboard_revisions`.`dashboard_id`)
                INNER JOIN `ao_users` AS `resource_user` ON (`ao_dashboards`.`user_id` = `resource_user`.`id`)
                INNER JOIN `ao_users` AS `revision_user` ON (`ao_dashboards`.`user_id` = `revision_user`.`id`)
                INNER JOIN `ao_dashboard_i18n` ON (`ao_dashboard_revisions`.`id` = `ao_dashboard_i18n`.`dashboard_revision_id`)
                INNER JOIN `ao_categories` ON (`ao_dashboard_revisions`.`category_id` = `ao_categories`.`id`)
                INNER JOIN `ao_categories_i18n` ON (`ao_categories`.`id` = `ao_categories_i18n`.`category_id`)
                WHERE (`ao_dashboard_revisions`.`id` = %s AND `ao_dashboard_i18n`.`language` = %s AND `ao_categories_i18n`.`language` = %s)"""
        return _execute_sql(sql, [dashboardrevision_id, self.language, self.language])

        #params = [dashboardrevision_id, self.language]
        #if not self.last:
        #    sql += """ AND `ao_dashboard_revisions`.`status` = %s"""
        #    params.append(StatusChoices.PUBLISHED)
        #return _execute_sql(sql, params)

    # add language
    def get_widgets(self):
        sql = """SELECT `ao_dashboard_widgets`.`id` AS `dashboardwidget_id`
                     , `ao_dashboard_widgets`.`dashboard_revision_id` AS `dashboardrevision_id`
                     , `ao_dashboard_widgets`.`datastream_id`
                     , `ao_dashboard_widgets`.`visualization_id`
                     , `ao_dashboard_widgets`.`order`
                     , `ao_dashboard_widgets`.`parameters`
                FROM `ao_dashboard_widgets`
                WHERE `ao_dashboard_widgets`.`dashboard_revision_id` = %s
                ORDER BY `ao_dashboard_widgets`.`order` ASC"""
        cursor = _execute_sql(sql, [self.dashboardrevision_id])
        row = cursor.fetchone()
        while row:
            db_widget = DBWidget(row, language = self.language, last = self.last)
            if db_widget.has_revision():
                self.widgets.append(db_widget)
            row = cursor.fetchone()
        return self.widgets

    def get_tags(self):
        if self.tags is None:
            sql = """SELECT `ao_tags`.`name`
                    FROM `ao_tags`
                    INNER JOIN `ao_tags_dashboard` ON (`ao_tags`.`id` = `ao_tags_dashboard`.`tag_id`)
                    WHERE (`ao_tags_dashboard`.`dashboardrevision_id` = %s)"""
            cursor = _execute_sql(sql, [self.dashboardrevision_id])
            row = cursor.fetchone()
            self.tags = []
            while row:
                self.tags.append(row[0])
                row = cursor.fetchone()
        return self.tags

    def permalink(self, urlconf = DEFAULT_URLCONF):
        return reverse('dashboard_manager.action_view', urlconf, kwargs={'id': self.dashboard_id, 'slug': self.slug})


class Parameter:
    def __init__(self, row):
        self.name = row[12]
        self.position = row[13]
        self.description = row[14]
        self.default = PrimitiveComputer().compute(row[15])
        self.value = ''


class DS:
    def __init__(self, datastreamrevision_id, language):
        self.language = language
        cursor = self.get_from_db(datastreamrevision_id)
        row = cursor.fetchone()
        if row is None:
            self.language = self.language == 'en' and 'es' or 'en'
            cursor = self.get_from_db(datastreamrevision_id)
            row = cursor.fetchone()
            if row is None:
                raise Http404
        self.datastream_id = row[0]
        self.created_by_id = row[1]
        self.guid = row[2]
        self.datastreamrevision_id = row[3]
        self.created_at = row[4]
        self.status = row[5]
        self.metadata = row[6]
        self.datastreami18n_id = row[7]
        self.title = row[8]
        self.description = row[9]
        self.notes = row[10]
        self.type = row[15]
        self.filename = row[16]
        self.end_point = row[17]
        self.dataset_revision_id = row[18]
        self.created_by_nick = row[19]
        self.created_by_email = row[20]
        self.edited_by_id = row[21]
        self.edited_by_nick = row[22]
        self.edited_by_email = row[23]
        self.account_id = row[24]
        self.category_id = row[25]
        self.category_name = row[26]
        self.dataset_id = row[27]
        self.tags = None
        self.sources = None
        self.slug = slugify(self.title)
        self.impl_type = row[28]
        self.rdf_template = row[29]

        # parameters!
        self.parameters = []
        while row and row[12]:
            if row[4] != self.datastreamrevision_id or row[19] != self.dataset_revision_id:
                break
            self.parameters.append(Parameter(row))
            row = cursor.fetchone()

    def get_from_db(self, datastreamrevision_id):
        sql = """SELECT `ao_datastreams`.`id` AS `datastream_id`
                     , `ao_datastreams`.`user_id` AS `created_by_id`
                     , `ao_datastreams`.`guid`
                     , `ao_datastream_revisions`.`id` AS `datastreamrevision_id`
                     , `ao_datastream_revisions`.`created_at`
                     , `ao_datastream_revisions`.`status`
                     , `ao_datastream_revisions`.`meta_text` as `metadata`
                     , `ao_datastream_i18n`.`id` AS `datastreami18n_id`
                     , `ao_datastream_i18n`.`title`
                     , `ao_datastream_i18n`.`description`
                     , `ao_datastream_i18n`.`notes`
                     , `ao_datastream_parameters`.`name` AS `parameter_name`
                     , `ao_datastream_parameters`.`position` AS `parameter_position`
                     , `ao_datastream_parameters`.`description` AS `parameter_description`
                     , `ao_datastream_parameters`.`default` AS `parameter_default`
                     , `ao_datasets`.`type`
                     , `ao_dataset_revisions`.`filename`
                     , `ao_dataset_revisions`.`end_point`
                     , `ao_dataset_revisions`.`id` AS `dataset_revision_id`
                     , `resource_user`.`nick` AS `created_by_nick`
                     , `resource_user`.`email` AS `created_by_email`
                     , `revision_user`.`id` AS `edited_by_id`
                     , `revision_user`.`nick` AS `edited_by_nick`
                     , `revision_user`.`email` AS `edited_by_email`
                     , `resource_user`.`account_id` AS `account_id`
                     , `ao_categories`.`id` AS `category_id`
                     , `ao_categories_i18n`.`name` AS `category_name`
                     , `ao_datasets`.`id` AS `dataset_id`
                     , `ao_dataset_revisions`.`impl_type` AS `impl_type`
                     , `ao_datastream_revisions`.`rdf_template` AS `rdf_template`
                 FROM `ao_datastreams`
                 INNER JOIN `ao_datastream_revisions` ON (`ao_datastreams`.`id` = `ao_datastream_revisions`.`datastream_id`)
                INNER JOIN `ao_users` AS `resource_user` ON (`ao_datastreams`.`user_id` = `resource_user`.`id`)
                INNER JOIN `ao_users` AS `revision_user`  ON (`ao_datastreams`.`user_id` = `revision_user`.`id`)
                 INNER JOIN `ao_datastream_i18n` ON (`ao_datastream_revisions`.`id` = `ao_datastream_i18n`.`datastream_revision_id`)
                 LEFT OUTER JOIN `ao_datastream_parameters` ON (`ao_datastream_revisions`.`id` = `ao_datastream_parameters`.`datastream_revision_id`)
                 INNER JOIN `ao_datasets` ON (`ao_datastream_revisions`.`dataset_id` = `ao_datasets`.`id`)
                 INNER JOIN `ao_dataset_revisions` ON (`ao_datasets`.`id` = `ao_dataset_revisions`.`dataset_id`)
                 INNER JOIN `ao_categories` ON (`ao_datastream_revisions`.`category_id` = `ao_categories`.`id`)
                 INNER JOIN `ao_categories_i18n` ON (`ao_categories`.`id` = `ao_categories_i18n`.`category_id`)
                 WHERE (`ao_datastream_revisions`.`id` =  %s
                         AND `ao_datastream_i18n`.`language` = %s
                         AND `ao_categories_i18n`.`language` = %s )
                 ORDER BY `ao_dataset_revisions`.`id` DESC, `ao_datastream_parameters`.`position` ASC"""
        return _execute_sql(sql, [datastreamrevision_id, self.language, self.language])

    def embedUrl(self, urlconf = DEFAULT_URLCONF):
        return reverse('datastream_manager.action_embed', MS_URLCONF, kwargs={'guid': self.guid})

    def is_self_publishing(self):
        return self.type == CollectTypeChoices.SELF_PUBLISH

    def is_web_service(self):
        return self.type == CollectTypeChoices.WEBSERVICE

    def datastream_type(self):
        return unicode(COLLECT_TYPE_CHOICES[int(self.type)][1])


class VZ:
    def __init__(self, visualizationrevision_id, language):
        self.language = language
        cursor = self.get_from_db(visualizationrevision_id)
        row = cursor.fetchone()
        if row is None:
            self.language = self.language == 'en' and 'es' or 'en'
            cursor = self.get_from_db(visualizationrevision_id)
            row = cursor.fetchone()
            if row is None:
                raise Http404
        self.visualization_id = row[0]
        self.created_by_id = row[1]
        self.datastream_id = row[2]
        self.guid = row[3]
        self.visualizationrevision_id = row[4]
        self.impl_details = row[5]
        self.created_at = row[6]
        self.status = row[7]
        self.metadata = row[8]
        self.created_by_nick = row[9]
        self.created_by_email = row[10]
        self.edited_by_id = row[11]
        self.edited_by_nick = row[12]
        self.edited_by_email = row[13]
        self.account_id = row[14]
        self.datastreamrevision_id = row[15]
        self.datastreami18n_id = row[16]
        self.title = row[17]
        self.description = row[18]
        self.notes = row[19]
        self.type = row[24]
        self.filename = row[25]
        self.end_point = row[26]
        self.category_id = row[27]
        self.category_name = row[28]
        self.dataset_id = row[29]
        self.viz_rev_parameters = row[30] # can't repeat "parameters" fields (already used)
        self.slug = slugify(self.title)
        self.tags = None
        self.sources = None

        # parameters!
        self.parameters = []
        while row and row[21]:
            self.parameters.append(ParameterVZ(row))
            row = cursor.fetchone()

    def get_from_db(self, visualizationrevision_id):
        sql = """SELECT `ao_visualizations`.`id` AS `visualization_id`
                 , `ao_visualizations`.`user_id` AS `created_by_id`
                 , `ao_visualizations`.`datastream_id`
                 , `ao_visualizations`.`guid`
                 , `ao_visualizations_revisions`.`id` AS `visualizationrevision_id`
                 , `ao_visualizations_revisions`.`impl_details`
                 , `ao_visualizations_revisions`.`created_at`
                 , `ao_visualizations_revisions`.`status`
                 , `ao_visualizations_revisions`.`meta_text`
                 , `resource_user`.`nick` AS `created_by_nick`
                 , `resource_user`.`email` AS `created_by_email`
                 , `revision_user`.`id` AS `edited_by_id`
                 , `revision_user`.`nick` AS `edited_by_nick`
                 , `revision_user`.`email` AS `edited_by_email`
                 , `resource_user`.`account_id` AS `account_id`
                 , `ao_datastream_revisions`.`id` AS `datastreamrevision_id`
                 , `ao_datastream_i18n`.`id` AS `datastreami18n_id`
                 , `ao_visualizations_i18n`.`title`
                 , `ao_visualizations_i18n`.`description`
                 , `ao_visualizations_i18n`.`notes`
                 , `ao_datastream_parameters`.`name` AS `parameter_name`
                 , `ao_datastream_parameters`.`position` AS `parameter_position`
                 , `ao_datastream_parameters`.`description` AS `parameter_description`
                 , `ao_datastream_parameters`.`default` AS `parameter_default`
                 , `ao_datasets`.`type`
                 , `ao_dataset_revisions`.`filename`
                 , `ao_dataset_revisions`.`end_point`
                 , `ao_categories`.`id` AS `category_id`
                 , `ao_categories_i18n`.`name` AS `category_name`
                 , `ao_datasets`.`id` AS `dataset_id`
                 , `ao_visualizations_revisions`.`parameters` AS `viz_rev_parameters`
                    FROM `ao_visualizations`
                    INNER JOIN `ao_visualizations_revisions` ON (`ao_visualizations`.`id` = `ao_visualizations_revisions`.`visualization_id`)
                    INNER JOIN `ao_visualizations_i18n` ON (`ao_visualizations_revisions`.`id` = `ao_visualizations_i18n`.`visualization_revision_id`)
                    INNER JOIN `ao_users` AS `resource_user` ON (`ao_visualizations`.`user_id` = `resource_user`.`id`)
                    INNER JOIN `ao_users` AS `revision_user` ON (`ao_visualizations_revisions`.`user_id` = `revision_user`.`id`)
                    INNER JOIN `ao_datastreams` ON (`ao_visualizations`.`datastream_id` = `ao_datastreams`.`id`)
                    INNER JOIN `ao_datastream_revisions` ON (`ao_datastreams`.`id` = `ao_datastream_revisions`.`datastream_id`)
                    INNER JOIN `ao_datastream_i18n` ON (`ao_datastream_revisions`.`id` = `ao_datastream_i18n`.`datastream_revision_id`)
                    LEFT OUTER JOIN `ao_datastream_parameters` ON (`ao_datastream_revisions`.`id` = `ao_datastream_parameters`.`datastream_revision_id`)
                    INNER JOIN `ao_datasets` ON (`ao_datastream_revisions`.`dataset_id` = `ao_datasets`.`id`)
                    INNER JOIN `ao_dataset_revisions` ON (`ao_datasets`.`id` = `ao_dataset_revisions`.`dataset_id`)
                    INNER JOIN `ao_categories` ON (`ao_datastream_revisions`.`category_id` = `ao_categories`.`id`)
                    INNER JOIN `ao_categories_i18n` ON (`ao_categories`.`id` = `ao_categories_i18n`.`category_id`)
                    WHERE (`ao_visualizations_revisions`.`id` = %s
                            AND `ao_datastream_i18n`.`language` = %s
                            AND `ao_categories_i18n`.`language` = %s)
                    ORDER BY `ao_datastream_revisions`.`id` DESC, `ao_dataset_revisions`.`id` DESC, `ao_datastream_parameters`.`position` ASC"""
        return _execute_sql(sql, [visualizationrevision_id, self.language, self.language])

    def permalink(self, urlconf = DEFAULT_URLCONF):
        return reverse('chart_manager.action_view', urlconf, kwargs={'id': self.visualization_id, 'slug': self.slug})

    def is_self_publishing(self):
        return self.type == CollectTypeChoices.SELF_PUBLISH

    def is_web_service(self):
        return self.type == CollectTypeChoices.WEBSERVICE

    def datastream_type(self):
        return unicode(COLLECT_TYPE_CHOICES[int(self.type)][1])

    """
    def get_tags(self):
        if self.tags is None:
            sql = SELECT `ao_tags`.`name`
                    FROM `ao_tags`
                    INNER JOIN `ao_tags_visualization` ON (`ao_tags`.`id` = `ao_tags_visualization`.`tag_id`)
                    WHERE (`ao_tags_visualization`.`visualizationrevision_id` = %s)
            cursor = _execute_sql(sql, [self.visualizationrevision_id])
            row = cursor.fetchone()
            self.tags = []
            while row:
                self.tags.append(row[0])
                row = cursor.fetchone()
        return self.tags
    """
    def get_sources(self):
        if self.sources is None:
            sql = """SELECT `ao_sources`.`name`
                            , `ao_sources`.`url`
                     FROM `ao_sources`
                     INNER JOIN `ao_sources_datastream_revision` ON (`ao_sources`.`id` = `ao_sources_datastream_revision`.`source_id`)
                     WHERE (`ao_sources_datastream_revision`.`datastreamrevision_id` = %s)"""
            cursor = _execute_sql(sql, [self.datastreamrevision_id])
            row = cursor.fetchone()
            self.sources = []
            while row:
                self.sources.append(Src(row))
                row = cursor.fetchone()
        return self.sources

    def get_tags(self):
        if self.tags is None:
            sql = """SELECT `ao_tags`.`name`
                     FROM `ao_tags`
                     INNER JOIN `ao_tags_datastream` ON (`ao_tags_datastream`.`tag_id` = `ao_tags`.`id`)
                     WHERE (`ao_tags_datastream`.`datastreamrevision_id` = %s)"""
            cursor = _execute_sql(sql, [self.datastreamrevision_id])
            row = cursor.fetchone()
            self.tags = []
            while row:
                self.tags.append(row[0])
                row = cursor.fetchone()
        return self.tags


def _execute_sql(sql, params):
    cursor = connection.cursor()
    cursor.execute(sql, params)
    return cursor


class Src:
    def __init__(self, row):
        self.name = row[0]
        self.url = row[1]
