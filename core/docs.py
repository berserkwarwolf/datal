from django.core.urlresolvers import reverse
from django.db import connection
from core.choices import StatusChoices, CollectTypeChoices, COLLECT_TYPE_CHOICES
from core.helpers import slugify
from core.primitives import PrimitiveComputer
from django.http import Http404

# tags
# sources
# remove notes from original SQLs

DEFAULT_URLCONF = 'workspace.urls'
MS_URLCONF = 'microsites.urls'

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
        self.dashboardrevision_id = row[4]
        self.created_at = row[5]
        self.metadata = row[6]
        self.title = row[7]
        self.description = row[8]
        self.notes = row[9]
        self.created_by_nick = row[10]
        self.created_by_email = row[11]
        self.edited_by_id = row[12]
        self.edited_by_nick = row[13]
        self.edited_by_email = row[14]
        self.account_id = row[15]
        self.category_id = row[16]
        self.category_name = row[17]
        self.status = row[18]
        self.widgets = []
        self.tags = None
        self.slug = slugify(self.title)

    def get_from_db(self, dashboardrevision_id):
        sql = """SELECT `ao_dashboards`.`id` AS `dashboard_id`
                    , `ao_dashboards`.`user_id` AS `created_by_id`
                    , `ao_dashboards`.`guid`
                    , `ao_dashboards`.`is_private`
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

    def is_private(self):
        return False

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
        #self.is_private = row[3]
        self.datastreamrevision_id = row[4]
        self.created_at = row[5]
        self.status = row[6]
        self.metadata = row[7]
        self.datastreami18n_id = row[8]
        self.title = row[9]
        self.description = row[10]
        self.notes = row[11]
        self.type = row[16]
        self.filename = row[17]
        self.end_point = row[18]
        self.dataset_revision_id = row[19]
        self.created_by_nick = row[20]
        self.created_by_email = row[21]
        self.edited_by_id = row[22]
        self.edited_by_nick = row[23]
        self.edited_by_email = row[24]
        self.account_id = row[25]
        self.category_id = row[26]
        self.category_name = row[27]
        self.dataset_id = row[28]
        self.tags = None
        self.sources = None
        self.slug = slugify(self.title)
        self.impl_type = row[29]
        self.rdf_template = row[30]

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
                     , `ao_datastreams`.`is_private`
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

    def is_vz(self):
        return False

    def is_ds(self):
        return True

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

    def permalink(self, urlconf = DEFAULT_URLCONF):
        return reverse('datastream_manager.action_view', urlconf, kwargs={'id': self.datastream_id, 'slug': self.slug})

    def embedUrl(self, urlconf = DEFAULT_URLCONF):
        return reverse('datastream_manager.action_embed', urlconf, kwargs={'guid': self.guid})

    def is_self_publishing(self):
        return self.type == CollectTypeChoices.SELF_PUBLISH

    def is_web_service(self):
        return self.type == CollectTypeChoices.WEBSERVICE

    def datastream_type(self):
        return unicode(COLLECT_TYPE_CHOICES[int(self.type)][1])

    def is_private(self):
        return False


class ParameterVZ:
    def __init__(self, row):
        self.name = row[21]
        self.position = row[22]
        self.description = row[23]
        self.default = row[24]
        self.value = ''

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
        #self.is_private = row[3]
        self.guid = row[4]
        self.visualizationrevision_id = row[5]
        self.impl_details = row[6]
        self.created_at = row[7]
        self.status = row[8]
        self.metadata = row[9]
        self.created_by_nick = row[10]
        self.created_by_email = row[11]
        self.edited_by_id = row[12]
        self.edited_by_nick = row[13]
        self.edited_by_email = row[14]
        self.account_id = row[15]
        self.datastreamrevision_id = row[16]
        self.datastreami18n_id = row[17]
        self.title = row[18]
        self.description = row[19]
        self.notes = row[20]
        self.type = row[25]
        self.filename = row[26]
        self.end_point = row[27]
        self.category_id = row[28]
        self.category_name = row[29]
        self.dataset_id = row[30]
        self.viz_rev_parameters = row[31] # can't repeat "parameters" fields (already used)
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
                 , `ao_visualizations`.`is_private`
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

    def is_vz(self):
        return True

    def is_ds(self):
        return False

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

    def is_private(self):
        return False
        

class DT:
    def __init__(self, datasetrevision_id, language):
        self.language = language
        cursor = self.get_from_db(datasetrevision_id)
        row = cursor.fetchone()
        if row is None:
            self.language = self.language == 'en' and 'es' or 'en'
            cursor = self.get_from_db(datasetrevision_id)
            row = cursor.fetchone()
            if row is None:
                raise Http404
        self.dataset_id = row[0]
        self.datasetrevision_id = row[1]
        self.title = row[2]
        self.description = row[3]
        self.type = row[4]
        self.filename = row[5]
        self.end_point = row[6]
        self.category_id = row[7]
        self.category_name = row[8]
        self.status = row[9]
        self.created_by_id = row[10]
        self.created_by_nick = row[11]
        self.edited_by_id = row[12]
        self.edited_by_nick = row[13]
        self.created_at = row[14]
        self.account_id = row[15]
        self.dataseti18n_id = row[16]
        self.impl_type = row[17]
        self.metadata = row[18]
        self.notes = row[19]
        self.license_url = row[20]
        self.spatial = row[21]
        self.frequency = row[22]
        self.mbox = row[23]
        self.tags = None 
        self.sources = None
        self.slug = slugify(self.title)

    def get_from_db(self, datasetrevision_id):
        sql = """SELECT `ao_datasets`.`id` AS `dataset_id`
                        , `ao_dataset_revisions`.`id` AS `datasetrevision_id`
                        , `ao_dataset_i18n`.`title`
                        , `ao_dataset_i18n`.`description`
                        , `ao_datasets`.`type`
                        , `ao_dataset_revisions`.`filename`
                        , `ao_dataset_revisions`.`end_point`
                        , `ao_categories`.`id` AS `category_id`
                        , `ao_categories_i18n`.`name` AS `category_name`
                        , `ao_dataset_revisions`.`status`
                        , `ao_datasets`.`user_id` AS `created_by_id`
                        , `resource_user`.`nick` AS `created_by_nick`
                        , `revision_user`.`id` AS `edited_by_id`
                        , `revision_user`.`nick` AS `edited_by_nick`
                        , `ao_dataset_revisions`.`created_at`
                        , `resource_user`.`account_id` AS `account_id`
                        , `ao_dataset_i18n`.`id` AS `dataseti18n_id`
                        , `ao_dataset_revisions`.`impl_type`
                        , `ao_dataset_revisions`.`meta_text`
                        , `ao_dataset_i18n`.`notes`
                        , `ao_dataset_revisions`.`license_url`
                        , `ao_dataset_revisions`.`spatial`
                        , `ao_dataset_revisions`.`frequency`
                        , `ao_dataset_revisions`.`mbox`
                FROM `ao_datasets`
                INNER JOIN `ao_dataset_revisions` ON (`ao_datasets`.`id` = `ao_dataset_revisions`.`dataset_id`)
                INNER JOIN `ao_users` AS `resource_user` ON (`ao_datasets`.`user_id` = `resource_user`.`id`)
                INNER JOIN `ao_users` AS `revision_user` ON (`ao_dataset_revisions`.`user_id` = `revision_user`.`id`)
                INNER JOIN `ao_dataset_i18n` ON (`ao_dataset_revisions`.`id` = `ao_dataset_i18n`.`dataset_revision_id`)
                INNER JOIN `ao_categories` ON (`ao_dataset_revisions`.`category_id` = `ao_categories`.`id`)
                INNER JOIN `ao_categories_i18n` ON (`ao_categories`.`id` = `ao_categories_i18n`.`category_id`)
                WHERE (`ao_dataset_revisions`.`id` = %s
                        AND `ao_dataset_i18n`.`language` = %s
                        AND `ao_categories_i18n`.`language` = %s)
                ORDER BY `ao_dataset_revisions`.`id` DESC"""
        return _execute_sql(sql, [datasetrevision_id, self.language, self.language])

    def is_private(self):
        return False

    def get_sources(self):
        if self.sources is None:
            sql = """SELECT `ao_sources`.`name`
                            , `ao_sources`.`url`
                     FROM `ao_sources`
                     INNER JOIN `ao_sources_dataset_revision` 
                     ON (`ao_sources`.`id` = `ao_sources_dataset_revision`.`source_id`)
                     WHERE (`ao_sources_dataset_revision`.`datasetrevision_id` = %s)"""
            cursor = _execute_sql(sql, [self.datasetrevision_id])
            row = cursor.fetchone()
            self.sources = []
            while row:
                self.sources.append(Src(row))
                row = cursor.fetchone()
        return self.sources

    def get_tags(self):
        """ copy of DB get_tags. Database has the ao_tags_dataset and seems unused """
        if self.tags is None:
            sql = """SELECT `ao_tags`.`name`
                    FROM `ao_tags`
                    INNER JOIN `ao_tags_dataset` ON (`ao_tags`.`id` = `ao_tags_dataset`.`tag_id`)
                    WHERE (`ao_tags_dataset`.`datasetrevision_id` = %s)"""
            cursor = _execute_sql(sql, [self.datasetrevision_id])
            row = cursor.fetchone()
            self.tags = []
            while row:
                self.tags.append(row[0])
                row = cursor.fetchone()
        return self.tags

    def permalink(self, urlconf=MS_URLCONF):
        return reverse('manageDatasets.action_view', urlconf, kwargs={'dataset_id': self.dataset_id, 'slug': self.slug})


class DBWidget:
    def __init__(self, row, language, last = True):
        self.last = last
        self.language = language
        self.id = row[0]
        self.dashboard_revision_id = row[1]
        self.datastream_id = row[2]
        self.visualization_id = row[3]
        self.order = row[4]
        self.parameters = self.compute(row[5])
        self.ds = None
        self.vz = None
        self.datastreamrevision_id = None
        self.visualizationrevision_id = None

    def compute(self, parameters):
        if not parameters:
            return parameters

        args        = parameters.split("&")
        query       = ''
        primitive   = PrimitiveComputer()
        for arg in args:
            parameter = arg.split("=")
            if len(parameter) > 1:
                query += '&' + parameter[0] + '=' + str(primitive.compute(parameter[1]))

        return query

    def is_ds(self):
        return not self.is_vz()

    def is_vz(self):
        return bool(self.visualization_id)

    def get_ds(self):
        if not self.ds:
            self.ds = DS(datastreamrevision_id = self._get_datastreamrevision_id(), language = self.language)
        return self.ds

    def _get_datastreamrevision_id(self):
        if self.datastreamrevision_id is None:
            sql = """SELECT MAX(`ao_datastream_revisions`.`id`) AS `datastreamrevision_id`
            FROM `ao_datastream_revisions`
            WHERE `ao_datastream_revisions`.`datastream_id` = %s"""
            params = [self.datastream_id]

            if not self.last:
                sql += """ AND `ao_datastream_revisions`.`status` = %s"""
                params.append(StatusChoices.PUBLISHED)

            cursor = _execute_sql(sql, params)
            row = cursor.fetchone()
            self.datastreamrevision_id = row[0]
        return self.datastreamrevision_id

    def _get_visualizationrevision_id(self):
        if self.visualizationrevision_id is None:
            sql = """SELECT MAX(`ao_visualizations_revisions`.`id`) AS `visualizationrevision_id`
            FROM `ao_visualizations_revisions`
            WHERE `ao_visualizations_revisions`.`visualization_id` = %s"""
            params = [self.visualization_id]

            if not self.last:
                sql += """ AND `ao_visualizations_revisions`.`status` = %s"""
                params.append(StatusChoices.PUBLISHED)

            cursor = _execute_sql(sql, params)
            row = cursor.fetchone()
            self.visualizationrevision_id = row[0]
        return self.visualizationrevision_id

    def get_vz(self):
        if not self.vz:
            self.vz = VZ(visualizationrevision_id = self._get_visualizationrevision_id(), language = self.language)
        return self.vz

    def get(self):
        if self.is_ds():
            return self.get_ds()
        else:
            return self.get_vz()

    def has_revision(self):
        if self.is_ds():
            return bool(self._get_datastreamrevision_id())
        else:
            return bool(self._get_visualizationrevision_id())

def _execute_sql(sql, params):
    cursor = connection.cursor()
    cursor.execute(sql, params)
    return cursor

class Src:
    def __init__(self, row):
        self.name = row[0]
        self.url = row[1]
