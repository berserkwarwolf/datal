from django.test import TestCase
from junar.core.models import *

class ModelTest(TestCase):

    def test_model(self):

        print '  -- testing guid generation for data streams'
        title = u'this is a title to compute the guid'
        expected_guid = u'THIS-IS-A-TITLE-TO'

        datastream = DataStream()
        datastream.user_id = 1
        datastream.title = title
        datastream.save()
        assert datastream.guid == expected_guid, 'Generating incorrectly the 1st guid of a data stream'

        datastream1 = DataStream.objects.create(title = title, user_id = 1)
        assert datastream1.guid != expected_guid, 'Generating incorrectly the 2nd guid of a data stream'

        print '  -- testing guid generation for dashboards'
        dashboard = Dashboard()
        dashboard.user_id = 1
        dashboard.title = title
        dashboard.save()
        assert dashboard.guid == expected_guid, 'Generating incorrectly the 1st guid of a dashboard'

        dashboard1 = Dashboard.objects.create(title = title, user_id = 1)
        assert dashboard1.guid != expected_guid, 'Generating incorrectly the 2nd guid of a dashboard'

        print '  -- testing correct slug generation'
        name = 'lorem ipsum dolor sit amet'
        slug = 'lorem-ipsum-dolor-sit-amet'

        category = Category()
        category.save()

        ci18n = CategoryI18n()
        ci18n.name = name
        ci18n.category = category
        ci18n.language = 'en'
        ci18n.save()
        assert ci18n.slug == slug, 'Generating incorrectly the category slug'