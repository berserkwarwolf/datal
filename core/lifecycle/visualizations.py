# -*- coding: utf-8 -*-
from django.conf import settings
from core.choices import StatusChoices, ActionStreams
from core.daos.visualizations import VisualizationDBDAO
from core.models import VisualizationRevision, Visualization, DashboardWidget, DataStreamRevision, VisualizationI18n
from core.daos.activity_stream import ActivityStreamDAO
from core.daos.searchify import SearchifyDAO
from core.exceptions import *
from core.helpers import update_dashboard_widgets_and_revisions


class VisualizationLifeCycleManager():
    """ Manage a visualization Life Cycle"""

    def __init__(self, user_id, resource=None, resource_id=0, visualization_revision_id=0):
        pass

    def create(self, datastream, title, description='', language=None
            , status=StatusChoices.DRAFT, meta_text='', notes='', impl_details=''):
        """ create a new visualization """
        if not language:
            language = self.user.language

        allowed_states = [StatusChoices.DRAFT, StatusChoices.PENDING_REVIEW, StatusChoices.PUBLISHED]
        if status not in allowed_states:
            raise IllegalStateException(
                                    from_state=None,
                                    to_state=status,
                                    allowed_states=allowed_states)

        self.dao.create(datastream=datastream, title=title
            , description=description, language=language, status=status
            , meta_text=meta_text, notes=notes, impl_details=impl_details)
        self.visualization_revision = self.dao.visualization_revision
        self.visualization = self.dao.visualization
        self.visualization_i18n = self.dao.visualization_i18n

        if status == StatusChoices.PUBLISHED:
            self.publish()

        self.update_last_revisions()
        self.log_activity(action_id=ActionStreams.CREATE)

        return self.dao


    def send_to_review(self, fromEdition=False):
        pass

    def accept(self):
        """ accept a review """
        allowed_states = [StatusChoices.PENDING_REVIEW]
        if self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.visualization_revision.status,
                                    to_state=StatusChoices.APPROVED,
                                    allowed_states=allowed_states)

        self.visualization_revision.status = StatusChoices.APPROVED
        self.visualization_revision.save()


    def publish(self, ignore_errors=False, publish_backward=True):
        # all previous states are valid

        # check for status on related datastream
        allowed_states = [StatusChoices.PUBLISHED, StatusChoices.APPROVED]
        datastream_revision = DataStreamRevision.objects.get(pk=self.visualization.datastream.last_revision_id)
        if ignore_errors==False and datastream_revision.status not in allowed_states:
            #APPROVED for future references
            self.visualization_revision.status = StatusChoices.APPROVED
            self.visualization_revision.save()
            raise IllegalStateException(
                                    from_state=self.visualization_revision.status,
                                    to_state=StatusChoices.PUBLISHED,
                                    allowed_states=allowed_states)

        # if related resource is StatusChoices.APPROVED, then we publish it
        if publish_backward:
            from core.lifecycle.datastreams import DatastreamLifeCycleManager
            related = DatastreamLifeCycleManager(user=self.user.id, resource=datastream_revision)
            related.publish_if_accepted(publish_backward=True, publish_forward=False)

        self.visualization_revision.status = StatusChoices.PUBLISHED
        self.visualization_revision.save()

        self.update_last_revisions()
        self.index_resource()


        self.log_activity(action_id=ActionStreams.PUBLISH)
        return True

    def reject(self):
        """ reject a review """
        allowed_states = [StatusChoices.PENDING_REVIEW]
        if self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.visualization_revision.status,
                                    to_state=StatusChoices.DRAFT,
                                    allowed_states=allowed_states)

        self.visualization_revision.status = StatusChoices.DRAFT
        self.visualization_revision.save()

    def unpublish(self, ignore_errors=False):
        """ unpublish resource (there's no related resources)
        ignore_errors: sometimes we draft a dataset and we dont know about related states
        """

        allowed_states = [StatusChoices.PUBLISHED]
        if ignore_errors==False and self.visualization_revision.status not in allowed_states:
            raise IllegalStateException(
                                    from_state=self.visualization_revision.status,
                                    to_state=StatusChoices.DRAFT,
                                    allowed_states=allowed_states)

        self.visualization_revision.status = StatusChoices.DRAFT
        self.visualization_revision.save()

        self.remove_from_widgets()
        self.unindex_resource()
   
        self.update_last_revisions()
        self.log_activity(action_id=ActionStreams.UNPUBLISH)

    def remove(self):
        """ remove a resource (there's no related resources) """

        self.remove_from_widgets()
        if self.visualization_revision.status == StatusChoices.PUBLISHED:
            self.unindex_resource()
            
        self.log_activity(action_id=ActionStreams.PUBLISH)
        #real delete after related deleted
        VisualizationRevision.objects.filter(visualization=self.visualization).delete() #remove all revisions
        self.visualization.delete()

        


    def remove_revision(self):
        """ 
        remove just the revision. If it's the last one remove this and related resources
        If 
        """
        
        if not self.visualization_revision:
            raise VisualizationRequiredException()
        try:
            self.visualization_revision.delete()
            if VisualizationDBDAO(user_id=self.user.id).count_revisions() == 0:
                self.visualization.delete()
            else:
                self.update_last_revisions()
                
            return True
        except:
            #TODO raise or notify error?
            return False

            
    def edit(self, fields):
        """create a new revision and change it"""
        #TODO check for bad fields
        
        last_status = self.visualization_revision.status
        self.clone()
        fields['status'] = StatusChoices.DRAFT


        for field, value in fields.iteritems():
            # user are defined on datastream and datastream_revision
            if field in [ 'user', 'user_id', 'impl_details', 'status', 'meta_text', 'parameters']:
                setattr(self.visualization_revision, field, value)
            elif field in ['title', 'description', 'notes']:
                setattr(self.visualization_i18n, field, value)
            elif field in ['user', 'user_id']:
                setattr(self.visualization, field, value)
                

        if last_status == StatusChoices.PUBLISHED:
            self.unindex_resource()
            
        self.visualization_revision.save()
        self.visualization.save()
        self.visualization_i18n.save()

        self.update_last_revisions()

    def clone(self):
        """ clone this resourse """
        self.visualization_revision = self.visualization_revision.clone()
        self.visualization_i18n = VisualizationI18n.objects.filter(visualization_revision=self.visualization_revision, language=self.user.language)[0]


    def related_resources(self, types='all'):
        pass

    def apply_cascade_remove(self):
        pass

    def apply_cascade_unpublish(self, ignore_errors=False, is_test=True):
        pass

    def remove_from_widgets(self):
        widgets = DashboardWidget.objects.filter(visualization=self.visualization)
        update_dashboard_widgets_and_revisions(widgets)

    def log_activity(self, action_id):
        d18n = self.visualization_revision.visualizationi18n_set.all()[0]
        return ActivityStreamDAO().create(account_id=self.user.account.id, user_id=self.user.id
                            , revision_id=self.visualization_revision.id, resource_type=settings.TYPE_VISUALIZATION
                            , resource_id=self.visualization.id, action_id=action_id
                            , resource_title=d18n.title)

    def reload(self):
        """ reload from DB """
        self.visualization=Visualization.objects.get(pk=self.visualization.id)
        self.visualization_revision = VisualizationRevision.objects.get(pk=self.visualization.last_revision_id)

    def update_last_revisions(self):
        """ update last_revision_id and last_published_revision_id """
        self.visualization.last_revision_id = self.visualization_revision.id
        if self.visualization_revision.status == StatusChoices.PUBLISHED:
            self.visualization.last_published_revision_id = self.visualization_revision.id
        else:
            try:
                self.visualization.last_published_revision_id = VisualizationRevision.objects.get_last_published_id(self.visualization.id)
            except:
                self.visualization.last_published_revision_id = None
            
        self.visualization.save()

    def publish_if_accepted(self, publish_backward=False):
        states = [StatusChoices.APPROVED, StatusChoices.PUBLISHED]
        if self.visualization_revision.status not in states:
            return 

        self.publish(publish_backward=publish_backward)

    def index_resource(self):
        SearchifyDAO().index(self.dao.visualization_dict)

    def unindex_resource(self):
        SearchifyDAO().unindex(self.dao.visualization_dict)