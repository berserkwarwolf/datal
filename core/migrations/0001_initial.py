# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'AccountLevel'
        db.create_table('ao_account_levels', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('description', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'core', ['AccountLevel'])

        # Adding model 'Account'
        db.create_table('ao_accounts', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=80)),
            ('level', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.AccountLevel'])),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=4)),
            ('meta_data', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('expires_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('parent', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Account'], null=True, on_delete=models.PROTECT, blank=True)),
        ))
        db.send_create_signal(u'core', ['Account'])

        # Adding model 'User'
        db.create_table('ao_users', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('nick', self.gf('django.db.models.fields.CharField')(unique=True, max_length=30)),
            ('email', self.gf('django.db.models.fields.EmailField')(unique=True, max_length=75)),
            ('password', self.gf('django.db.models.fields.CharField')(max_length=155)),
            ('country', self.gf('django.db.models.fields.CharField')(default='US', max_length=3, blank=True)),
            ('ocupation', self.gf('django.db.models.fields.CharField')(max_length=2, blank=True)),
            ('language', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_visit', self.gf('django.db.models.fields.DateTimeField')(null=True)),
            ('account', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Account'], null=True, on_delete=models.PROTECT)),
        ))
        db.send_create_signal(u'core', ['User'])

        # Adding M2M table for field roles on 'User'
        m2m_table_name = 'ao_user_role_roles'
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('user', models.ForeignKey(orm[u'core.user'], null=False)),
            ('role', models.ForeignKey(orm[u'core.role'], null=False))
        ))
        db.create_unique(m2m_table_name, ['user_id', 'role_id'])

        # Adding model 'DataStream'
        db.create_table('ao_datastreams', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('guid', self.gf('django.db.models.fields.CharField')(unique=True, max_length=29)),
            ('is_private', self.gf('django.db.models.fields.SmallIntegerField')(default=0)),
            ('last_revision', self.gf('django.db.models.fields.related.ForeignKey')(related_name='last_revision', null=True, to=orm['core.DataStreamRevision'])),
            ('last_published_revision', self.gf('django.db.models.fields.related.ForeignKey')(related_name='last_published_revision', null=True, to=orm['core.DataStreamRevision'])),
        ))
        db.send_create_signal(u'core', ['DataStream'])

        # Adding model 'DataStreamRevision'
        db.create_table('ao_datastream_revisions', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'])),
            ('dataset', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dataset'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Category'])),
            ('data_source', self.gf('django.db.models.fields.TextField')()),
            ('select_statement', self.gf('django.db.models.fields.TextField')()),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('meta_text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('rdf_template', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'core', ['DataStreamRevision'])

        # Adding model 'DatastreamI18n'
        db.create_table('ao_datastream_i18n', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('language', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('datastream_revision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStreamRevision'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=80)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=140, blank=True)),
            ('notes', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DatastreamI18n'])

        # Adding model 'DataStreamParameter'
        db.create_table('ao_datastream_parameters', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('datastream_revision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStreamRevision'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('default', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('position', self.gf('django.db.models.fields.PositiveSmallIntegerField')()),
            ('impl_details', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
        ))
        db.send_create_signal(u'core', ['DataStreamParameter'])

        # Adding unique constraint on 'DataStreamParameter', fields ['datastream_revision', 'name']
        db.create_unique('ao_datastream_parameters', ['datastream_revision_id', 'name'])

        # Adding model 'Dashboard'
        db.create_table('ao_dashboards', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('guid', self.gf('django.db.models.fields.CharField')(unique=True, max_length=29)),
            ('is_private', self.gf('django.db.models.fields.SmallIntegerField')(default=0)),
        ))
        db.send_create_signal(u'core', ['Dashboard'])

        # Adding model 'DashboardRevision'
        db.create_table('ao_dashboard_revisions', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('dashboard', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dashboard'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Category'])),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('meta_text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DashboardRevision'])

        # Adding model 'DashboardI18n'
        db.create_table('ao_dashboard_i18n', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('language', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('dashboard_revision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DashboardRevision'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=80)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=140, blank=True)),
            ('notes', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DashboardI18n'])

        # Adding model 'DashboardWidget'
        db.create_table('ao_dashboard_widgets', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('order', self.gf('django.db.models.fields.IntegerField')()),
            ('parameters', self.gf('django.db.models.fields.CharField')(max_length=2048, blank=True)),
            ('dashboard_revision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DashboardRevision'])),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'], null=True, blank=True)),
            ('visualization', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Visualization'], null=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DashboardWidget'])

        # Adding model 'Dataset'
        db.create_table('ao_datasets', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('type', self.gf('django.db.models.fields.IntegerField')()),
            ('is_dead', self.gf('django.db.models.fields.SmallIntegerField')(default=0)),
            ('guid', self.gf('django.db.models.fields.CharField')(unique=True, max_length=29)),
            ('last_revision', self.gf('django.db.models.fields.related.ForeignKey')(related_name='last_revision', null=True, on_delete=models.SET_NULL, to=orm['core.DatasetRevision'])),
            ('last_published_revision', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='last_published_revision', null=True, on_delete=models.SET_NULL, to=orm['core.DatasetRevision'])),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['Dataset'])

        # Adding model 'DatasetRevision'
        db.create_table('ao_dataset_revisions', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('dataset', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dataset'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Category'])),
            ('end_point', self.gf('django.db.models.fields.CharField')(max_length=2048)),
            ('filename', self.gf('django.db.models.fields.CharField')(max_length=2048)),
            ('impl_details', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('impl_type', self.gf('django.db.models.fields.IntegerField')()),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('meta_text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('size', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('license_url', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('spatial', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('frequency', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('mbox', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'core', ['DatasetRevision'])

        # Adding model 'DatasetI18n'
        db.create_table('ao_dataset_i18n', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('language', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('dataset_revision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DatasetRevision'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=80)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=140, blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('notes', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'core', ['DatasetI18n'])

        # Adding model 'Visualization'
        db.create_table('ao_visualizations', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'])),
            ('guid', self.gf('django.db.models.fields.CharField')(unique=True, max_length=29)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('is_private', self.gf('django.db.models.fields.SmallIntegerField')(default=0)),
            ('last_revision', self.gf('django.db.models.fields.related.ForeignKey')(related_name='last_revision', null=True, to=orm['core.VisualizationRevision'])),
            ('last_published_revision', self.gf('django.db.models.fields.related.ForeignKey')(related_name='last_published_revision', null=True, to=orm['core.VisualizationRevision'])),
        ))
        db.send_create_signal(u'core', ['Visualization'])

        # Adding model 'VisualizationRevision'
        db.create_table('ao_visualizations_revisions', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('visualization', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Visualization'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.PROTECT)),
            ('impl_details', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('meta_text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('parameters', self.gf('django.db.models.fields.CharField')(max_length=2048, blank=True)),
        ))
        db.send_create_signal(u'core', ['VisualizationRevision'])

        # Adding model 'VisualizationI18n'
        db.create_table('ao_visualizations_i18n', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('language', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('visualization_revision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.VisualizationRevision'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=80)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=140, blank=True)),
            ('notes', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['VisualizationI18n'])

        # Adding model 'Category'
        db.create_table('ao_categories', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('account', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Account'], null=True)),
        ))
        db.send_create_signal(u'core', ['Category'])

        # Adding model 'CategoryI18n'
        db.create_table('ao_categories_i18n', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('language', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Category'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=30)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=140, blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['CategoryI18n'])

        # Adding model 'Tag'
        db.create_table('ao_tags', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=40)),
            ('status', self.gf('django.db.models.fields.SmallIntegerField')(default=0)),
        ))
        db.send_create_signal(u'core', ['Tag'])

        # Adding model 'TagDataset'
        db.create_table('ao_tags_dataset', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tag', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Tag'], null=True)),
            ('datasetrevision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DatasetRevision'], null=True)),
        ))
        db.send_create_signal(u'core', ['TagDataset'])

        # Adding model 'TagDatastream'
        db.create_table('ao_tags_datastream', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tag', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Tag'], null=True)),
            ('datastreamrevision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStreamRevision'], null=True)),
        ))
        db.send_create_signal(u'core', ['TagDatastream'])

        # Adding model 'TagDashboard'
        db.create_table('ao_tags_dashboard', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tag', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Tag'], null=True)),
            ('dashboardrevision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DashboardRevision'], null=True)),
        ))
        db.send_create_signal(u'core', ['TagDashboard'])

        # Adding model 'TagVisualization'
        db.create_table('ao_tags_visualization', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tag', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Tag'], null=True)),
            ('visualizationrevision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.VisualizationRevision'], null=True)),
        ))
        db.send_create_signal(u'core', ['TagVisualization'])

        # Adding model 'Role'
        db.create_table('ao_user_roles', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=63)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=63)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['Role'])

        # Adding model 'Privilege'
        db.create_table('ao_user_privileges', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=63)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=63)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['Privilege'])

        # Adding model 'Grant'
        db.create_table('ao_user_grants', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], null=True, on_delete=models.PROTECT)),
            ('role', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Role'], null=True)),
            ('guest', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Guest'], null=True)),
            ('privilege', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Privilege'], null=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['Grant'])

        # Adding model 'ObjectGrant'
        db.create_table('ao_user_object_grants', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('grant', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Grant'])),
            ('dashboard', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dashboard'], null=True)),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'], null=True)),
            ('visualization', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Visualization'], null=True)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=63)),
            ('auth_key', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['ObjectGrant'])

        # Adding model 'Guest'
        db.create_table('ao_user_guests', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('email', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal(u'core', ['Guest'])

        # Adding model 'Threshold'
        db.create_table('ao_account_thresholds', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('account_level', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.AccountLevel'], null=True, blank=True)),
            ('account', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Account'], null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('limit', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'core', ['Threshold'])

        # Adding model 'Preference'
        db.create_table('ao_account_preferences', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('account', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Account'])),
            ('key', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('value', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'core', ['Preference'])

        # Adding model 'Application'
        db.create_table('ao_applications', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], null=True, blank=True)),
            ('account', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Account'], null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=80, blank=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('category', self.gf('django.db.models.fields.CharField')(max_length=40, blank=True)),
            ('locale', self.gf('django.db.models.fields.CharField')(max_length=10, blank=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=2048, blank=True)),
            ('auth_key', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('public_auth_key', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('domains', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('expires_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('valid', self.gf('django.db.models.fields.SmallIntegerField')(default=0)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=2)),
        ))
        db.send_create_signal(u'core', ['Application'])

        # Adding model 'Setting'
        db.create_table('ao_settings', (
            ('key', self.gf('django.db.models.fields.CharField')(max_length=40, primary_key=True)),
            ('value', self.gf('django.db.models.fields.TextField')()),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
        ))
        db.send_create_signal(u'core', ['Setting'])

        # Adding model 'UserPassTickets'
        db.create_table('ao_user_passtickets', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('uuid', self.gf('django.db.models.fields.CharField')(max_length=38)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'])),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=38)),
        ))
        db.send_create_signal(u'core', ['UserPassTickets'])

        # Adding model 'Source'
        db.create_table('ao_sources', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=40)),
            ('url', self.gf('django.db.models.fields.CharField')(max_length=2048)),
        ))
        db.send_create_signal(u'core', ['Source'])

        # Adding model 'SourceDataset'
        db.create_table('ao_sources_dataset_revision', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Source'], null=True)),
            ('datasetrevision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DatasetRevision'], null=True)),
        ))
        db.send_create_signal(u'core', ['SourceDataset'])

        # Adding model 'SourceDatastream'
        db.create_table('ao_sources_datastream_revision', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Source'])),
            ('datastreamrevision', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStreamRevision'])),
        ))
        db.send_create_signal(u'core', ['SourceDatastream'])

        # Adding model 'VisualizationHits'
        db.create_table('ao_visualization_hits', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('visualization', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Visualization'])),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('channel_type', self.gf('django.db.models.fields.SmallIntegerField')()),
        ))
        db.send_create_signal(u'core', ['VisualizationHits'])

        # Adding model 'DataStreamHits'
        db.create_table('ao_datastream_hits', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'])),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('channel_type', self.gf('django.db.models.fields.SmallIntegerField')()),
        ))
        db.send_create_signal(u'core', ['DataStreamHits'])

        # Adding model 'DashboardHits'
        db.create_table('ao_dashboard_hits', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('dashboard', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dashboard'])),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('channel_type', self.gf('django.db.models.fields.SmallIntegerField')()),
        ))
        db.send_create_signal(u'core', ['DashboardHits'])

        # Adding model 'DashboardRank'
        db.create_table('ao_dashboard_ranks', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('dashboard', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dashboard'])),
            ('position', self.gf('django.db.models.fields.SmallIntegerField')()),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DashboardRank'])

        # Adding model 'DataStreamRank'
        db.create_table('ao_datastream_ranks', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'])),
            ('position', self.gf('django.db.models.fields.SmallIntegerField')()),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DataStreamRank'])

        # Adding model 'DashboardComment'
        db.create_table('ao_dashboard_comments', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('dashboard', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dashboard'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'])),
            ('comment', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DashboardComment'])

        # Adding model 'DataStreamComment'
        db.create_table('ao_datastream_comments', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'])),
            ('comment', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['DataStreamComment'])

        # Adding model 'Log'
        db.create_table('ao_logs', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.User'], on_delete=models.DO_NOTHING)),
            ('dashboard', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Dashboard'], null=True, on_delete=models.DO_NOTHING)),
            ('datastream', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.DataStream'], null=True, on_delete=models.DO_NOTHING)),
            ('visualization', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Visualization'], null=True, on_delete=models.DO_NOTHING)),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['Log'])


    def backwards(self, orm):
        # Removing unique constraint on 'DataStreamParameter', fields ['datastream_revision', 'name']
        db.delete_unique('ao_datastream_parameters', ['datastream_revision_id', 'name'])

        # Deleting model 'AccountLevel'
        db.delete_table('ao_account_levels')

        # Deleting model 'Account'
        db.delete_table('ao_accounts')

        # Deleting model 'User'
        db.delete_table('ao_users')

        # Removing M2M table for field roles on 'User'
        db.delete_table('ao_user_role_roles')

        # Deleting model 'DataStream'
        db.delete_table('ao_datastreams')

        # Deleting model 'DataStreamRevision'
        db.delete_table('ao_datastream_revisions')

        # Deleting model 'DatastreamI18n'
        db.delete_table('ao_datastream_i18n')

        # Deleting model 'DataStreamParameter'
        db.delete_table('ao_datastream_parameters')

        # Deleting model 'Dashboard'
        db.delete_table('ao_dashboards')

        # Deleting model 'DashboardRevision'
        db.delete_table('ao_dashboard_revisions')

        # Deleting model 'DashboardI18n'
        db.delete_table('ao_dashboard_i18n')

        # Deleting model 'DashboardWidget'
        db.delete_table('ao_dashboard_widgets')

        # Deleting model 'Dataset'
        db.delete_table('ao_datasets')

        # Deleting model 'DatasetRevision'
        db.delete_table('ao_dataset_revisions')

        # Deleting model 'DatasetI18n'
        db.delete_table('ao_dataset_i18n')

        # Deleting model 'Visualization'
        db.delete_table('ao_visualizations')

        # Deleting model 'VisualizationRevision'
        db.delete_table('ao_visualizations_revisions')

        # Deleting model 'VisualizationI18n'
        db.delete_table('ao_visualizations_i18n')

        # Deleting model 'Category'
        db.delete_table('ao_categories')

        # Deleting model 'CategoryI18n'
        db.delete_table('ao_categories_i18n')

        # Deleting model 'Tag'
        db.delete_table('ao_tags')

        # Deleting model 'TagDataset'
        db.delete_table('ao_tags_dataset')

        # Deleting model 'TagDatastream'
        db.delete_table('ao_tags_datastream')

        # Deleting model 'TagDashboard'
        db.delete_table('ao_tags_dashboard')

        # Deleting model 'TagVisualization'
        db.delete_table('ao_tags_visualization')

        # Deleting model 'Role'
        db.delete_table('ao_user_roles')

        # Deleting model 'Privilege'
        db.delete_table('ao_user_privileges')

        # Deleting model 'Grant'
        db.delete_table('ao_user_grants')

        # Deleting model 'ObjectGrant'
        db.delete_table('ao_user_object_grants')

        # Deleting model 'Guest'
        db.delete_table('ao_user_guests')

        # Deleting model 'Threshold'
        db.delete_table('ao_account_thresholds')

        # Deleting model 'Preference'
        db.delete_table('ao_account_preferences')

        # Deleting model 'Application'
        db.delete_table('ao_applications')

        # Deleting model 'Setting'
        db.delete_table('ao_settings')

        # Deleting model 'UserPassTickets'
        db.delete_table('ao_user_passtickets')

        # Deleting model 'Source'
        db.delete_table('ao_sources')

        # Deleting model 'SourceDataset'
        db.delete_table('ao_sources_dataset_revision')

        # Deleting model 'SourceDatastream'
        db.delete_table('ao_sources_datastream_revision')

        # Deleting model 'VisualizationHits'
        db.delete_table('ao_visualization_hits')

        # Deleting model 'DataStreamHits'
        db.delete_table('ao_datastream_hits')

        # Deleting model 'DashboardHits'
        db.delete_table('ao_dashboard_hits')

        # Deleting model 'DashboardRank'
        db.delete_table('ao_dashboard_ranks')

        # Deleting model 'DataStreamRank'
        db.delete_table('ao_datastream_ranks')

        # Deleting model 'DashboardComment'
        db.delete_table('ao_dashboard_comments')

        # Deleting model 'DataStreamComment'
        db.delete_table('ao_datastream_comments')

        # Deleting model 'Log'
        db.delete_table('ao_logs')


    models = {
        u'core.account': {
            'Meta': {'object_name': 'Account', 'db_table': "'ao_accounts'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'expires_at': ('django.db.models.fields.DateTimeField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.AccountLevel']"}),
            'meta_data': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '80'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Account']", 'null': 'True', 'on_delete': 'models.PROTECT', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '4'})
        },
        u'core.accountlevel': {
            'Meta': {'object_name': 'AccountLevel', 'db_table': "'ao_account_levels'"},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'})
        },
        u'core.application': {
            'Meta': {'object_name': 'Application', 'db_table': "'ao_applications'"},
            'account': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Account']", 'null': 'True', 'blank': 'True'}),
            'auth_key': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'category': ('django.db.models.fields.CharField', [], {'max_length': '40', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'domains': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'expires_at': ('django.db.models.fields.DateTimeField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'locale': ('django.db.models.fields.CharField', [], {'max_length': '10', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '80', 'blank': 'True'}),
            'public_auth_key': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '2048', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'null': 'True', 'blank': 'True'}),
            'valid': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'})
        },
        u'core.category': {
            'Meta': {'object_name': 'Category', 'db_table': "'ao_categories'"},
            'account': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Account']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'core.categoryi18n': {
            'Meta': {'object_name': 'CategoryI18n', 'db_table': "'ao_categories_i18n'"},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Category']"}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '140', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '30'})
        },
        u'core.dashboard': {
            'Meta': {'object_name': 'Dashboard', 'db_table': "'ao_dashboards'"},
            'guid': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '29'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_private': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'})
        },
        u'core.dashboardcomment': {
            'Meta': {'object_name': 'DashboardComment', 'db_table': "'ao_dashboard_comments'"},
            'comment': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dashboard': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dashboard']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']"})
        },
        u'core.dashboardhits': {
            'Meta': {'object_name': 'DashboardHits', 'db_table': "'ao_dashboard_hits'"},
            'channel_type': ('django.db.models.fields.SmallIntegerField', [], {}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dashboard': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dashboard']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'core.dashboardi18n': {
            'Meta': {'object_name': 'DashboardI18n', 'db_table': "'ao_dashboard_i18n'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dashboard_revision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DashboardRevision']"}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '140', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '80'})
        },
        u'core.dashboardrank': {
            'Meta': {'object_name': 'DashboardRank', 'db_table': "'ao_dashboard_ranks'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dashboard': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dashboard']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'position': ('django.db.models.fields.SmallIntegerField', [], {})
        },
        u'core.dashboardrevision': {
            'Meta': {'ordering': "['-id']", 'object_name': 'DashboardRevision', 'db_table': "'ao_dashboard_revisions'"},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Category']"}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dashboard': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dashboard']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'meta_text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'}),
            'widgets': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['core.DataStream']", 'through': u"orm['core.DashboardWidget']", 'symmetrical': 'False'})
        },
        u'core.dashboardwidget': {
            'Meta': {'ordering': "['order']", 'object_name': 'DashboardWidget', 'db_table': "'ao_dashboard_widgets'"},
            'dashboard_revision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DashboardRevision']"}),
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {}),
            'parameters': ('django.db.models.fields.CharField', [], {'max_length': '2048', 'blank': 'True'}),
            'visualization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Visualization']", 'null': 'True', 'blank': 'True'})
        },
        u'core.dataset': {
            'Meta': {'object_name': 'Dataset', 'db_table': "'ao_datasets'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'guid': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '29'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_dead': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'}),
            'last_published_revision': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'last_published_revision'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['core.DatasetRevision']"}),
            'last_revision': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'last_revision'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['core.DatasetRevision']"}),
            'type': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'})
        },
        u'core.dataseti18n': {
            'Meta': {'object_name': 'DatasetI18n', 'db_table': "'ao_dataset_i18n'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dataset_revision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DatasetRevision']"}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '140', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '80'})
        },
        u'core.datasetrevision': {
            'Meta': {'ordering': "['-id']", 'object_name': 'DatasetRevision', 'db_table': "'ao_dataset_revisions'"},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Category']"}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dataset': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dataset']"}),
            'end_point': ('django.db.models.fields.CharField', [], {'max_length': '2048'}),
            'filename': ('django.db.models.fields.CharField', [], {'max_length': '2048'}),
            'frequency': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'impl_details': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'impl_type': ('django.db.models.fields.IntegerField', [], {}),
            'license_url': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'mbox': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'meta_text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'size': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'spatial': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'})
        },
        u'core.datastream': {
            'Meta': {'object_name': 'DataStream', 'db_table': "'ao_datastreams'"},
            'guid': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '29'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_private': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'}),
            'last_published_revision': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'last_published_revision'", 'null': 'True', 'to': u"orm['core.DataStreamRevision']"}),
            'last_revision': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'last_revision'", 'null': 'True', 'to': u"orm['core.DataStreamRevision']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'})
        },
        u'core.datastreamcomment': {
            'Meta': {'object_name': 'DataStreamComment', 'db_table': "'ao_datastream_comments'"},
            'comment': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']"})
        },
        u'core.datastreamhits': {
            'Meta': {'object_name': 'DataStreamHits', 'db_table': "'ao_datastream_hits'"},
            'channel_type': ('django.db.models.fields.SmallIntegerField', [], {}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'core.datastreami18n': {
            'Meta': {'object_name': 'DatastreamI18n', 'db_table': "'ao_datastream_i18n'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'datastream_revision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStreamRevision']"}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '140', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '80'})
        },
        u'core.datastreamparameter': {
            'Meta': {'ordering': "['position']", 'unique_together': "(('datastream_revision', 'name'),)", 'object_name': 'DataStreamParameter', 'db_table': "'ao_datastream_parameters'"},
            'datastream_revision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStreamRevision']"}),
            'default': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'impl_details': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'position': ('django.db.models.fields.PositiveSmallIntegerField', [], {})
        },
        u'core.datastreamrank': {
            'Meta': {'object_name': 'DataStreamRank', 'db_table': "'ao_datastream_ranks'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'position': ('django.db.models.fields.SmallIntegerField', [], {})
        },
        u'core.datastreamrevision': {
            'Meta': {'ordering': "['-id']", 'object_name': 'DataStreamRevision', 'db_table': "'ao_datastream_revisions'"},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Category']"}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'data_source': ('django.db.models.fields.TextField', [], {}),
            'dataset': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dataset']"}),
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'meta_text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'rdf_template': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'select_statement': ('django.db.models.fields.TextField', [], {}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'})
        },
        u'core.grant': {
            'Meta': {'object_name': 'Grant', 'db_table': "'ao_user_grants'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'guest': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Guest']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'privilege': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Privilege']", 'null': 'True'}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Role']", 'null': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'null': 'True', 'on_delete': 'models.PROTECT'})
        },
        u'core.guest': {
            'Meta': {'object_name': 'Guest', 'db_table': "'ao_user_guests'"},
            'email': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'grants': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['core.Privilege']", 'through': u"orm['core.Grant']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'core.log': {
            'Meta': {'object_name': 'Log', 'db_table': "'ao_logs'"},
            'content': ('django.db.models.fields.TextField', [], {}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dashboard': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dashboard']", 'null': 'True', 'on_delete': 'models.DO_NOTHING'}),
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']", 'null': 'True', 'on_delete': 'models.DO_NOTHING'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.DO_NOTHING'}),
            'visualization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Visualization']", 'null': 'True', 'on_delete': 'models.DO_NOTHING'})
        },
        u'core.objectgrant': {
            'Meta': {'object_name': 'ObjectGrant', 'db_table': "'ao_user_object_grants'"},
            'auth_key': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dashboard': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Dashboard']", 'null': 'True'}),
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']", 'null': 'True'}),
            'grant': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Grant']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '63'}),
            'visualization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Visualization']", 'null': 'True'})
        },
        u'core.preference': {
            'Meta': {'object_name': 'Preference', 'db_table': "'ao_account_preferences'"},
            'account': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Account']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'value': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        },
        u'core.privilege': {
            'Meta': {'object_name': 'Privilege', 'db_table': "'ao_user_privileges'"},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '63'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '63'})
        },
        u'core.role': {
            'Meta': {'object_name': 'Role', 'db_table': "'ao_user_roles'"},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '63'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'grants': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['core.Privilege']", 'through': u"orm['core.Grant']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '63'})
        },
        u'core.setting': {
            'Meta': {'object_name': 'Setting', 'db_table': "'ao_settings'"},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'max_length': '40', 'primary_key': 'True'}),
            'value': ('django.db.models.fields.TextField', [], {})
        },
        u'core.source': {
            'Meta': {'object_name': 'Source', 'db_table': "'ao_sources'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '40'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '2048'})
        },
        u'core.sourcedataset': {
            'Meta': {'object_name': 'SourceDataset', 'db_table': "'ao_sources_dataset_revision'"},
            'datasetrevision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DatasetRevision']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Source']", 'null': 'True'})
        },
        u'core.sourcedatastream': {
            'Meta': {'object_name': 'SourceDatastream', 'db_table': "'ao_sources_datastream_revision'"},
            'datastreamrevision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStreamRevision']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Source']"})
        },
        u'core.tag': {
            'Meta': {'object_name': 'Tag', 'db_table': "'ao_tags'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '40'}),
            'status': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'})
        },
        u'core.tagdashboard': {
            'Meta': {'object_name': 'TagDashboard', 'db_table': "'ao_tags_dashboard'"},
            'dashboardrevision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DashboardRevision']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Tag']", 'null': 'True'})
        },
        u'core.tagdataset': {
            'Meta': {'object_name': 'TagDataset', 'db_table': "'ao_tags_dataset'"},
            'datasetrevision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DatasetRevision']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Tag']", 'null': 'True'})
        },
        u'core.tagdatastream': {
            'Meta': {'object_name': 'TagDatastream', 'db_table': "'ao_tags_datastream'"},
            'datastreamrevision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStreamRevision']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Tag']", 'null': 'True'})
        },
        u'core.tagvisualization': {
            'Meta': {'object_name': 'TagVisualization', 'db_table': "'ao_tags_visualization'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Tag']", 'null': 'True'}),
            'visualizationrevision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.VisualizationRevision']", 'null': 'True'})
        },
        u'core.threshold': {
            'Meta': {'object_name': 'Threshold', 'db_table': "'ao_account_thresholds'"},
            'account': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Account']", 'null': 'True', 'blank': 'True'}),
            'account_level': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.AccountLevel']", 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'limit': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'})
        },
        u'core.user': {
            'Meta': {'object_name': 'User', 'db_table': "'ao_users'"},
            'account': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Account']", 'null': 'True', 'on_delete': 'models.PROTECT'}),
            'country': ('django.db.models.fields.CharField', [], {'default': "'US'", 'max_length': '3', 'blank': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'unique': 'True', 'max_length': '75'}),
            'grants': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['core.Privilege']", 'through': u"orm['core.Grant']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'last_visit': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'nick': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'}),
            'ocupation': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '155'}),
            'roles': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['core.Role']", 'db_table': "'ao_user_role_roles'", 'symmetrical': 'False'})
        },
        u'core.userpasstickets': {
            'Meta': {'object_name': 'UserPassTickets', 'db_table': "'ao_user_passtickets'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '38'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']"}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '38'})
        },
        u'core.visualization': {
            'Meta': {'object_name': 'Visualization', 'db_table': "'ao_visualizations'"},
            'datastream': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.DataStream']"}),
            'guid': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '29'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_private': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'}),
            'last_published_revision': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'last_published_revision'", 'null': 'True', 'to': u"orm['core.VisualizationRevision']"}),
            'last_revision': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'last_revision'", 'null': 'True', 'to': u"orm['core.VisualizationRevision']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'})
        },
        u'core.visualizationhits': {
            'Meta': {'object_name': 'VisualizationHits', 'db_table': "'ao_visualization_hits'"},
            'channel_type': ('django.db.models.fields.SmallIntegerField', [], {}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'visualization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Visualization']"})
        },
        u'core.visualizationi18n': {
            'Meta': {'object_name': 'VisualizationI18n', 'db_table': "'ao_visualizations_i18n'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '140', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'notes': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '80'}),
            'visualization_revision': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.VisualizationRevision']"})
        },
        u'core.visualizationrevision': {
            'Meta': {'ordering': "['-id']", 'object_name': 'VisualizationRevision', 'db_table': "'ao_visualizations_revisions'"},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'impl_details': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'meta_text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'parameters': ('django.db.models.fields.CharField', [], {'max_length': '2048', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.User']", 'on_delete': 'models.PROTECT'}),
            'visualization': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['core.Visualization']"})
        }
    }

    complete_apps = ['core']