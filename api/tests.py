import unittest
from junar.api.test import datastreams_manager
from junar.api.test import dashboards_manager
from junar.api.test import sources_manager
from junar.api.test import authorizations_manager
from junar.api.test import users_manager
from junar.api.test import applications
from junar.api.test import emitters
from junar.api.test import accounts

def suite():
    suite = unittest.TestSuite()
    suite.addTest(applications.ApplicationsManagerTest())
    suite.addTest(datastreams_manager.DataStreamsManagerTest())
    suite.addTest(dashboards_manager.DashboardsManagerTest())
    suite.addTest(sources_manager.SourcesManagerTest())
    suite.addTest(authorizations_manager.AuthorizationsManagerTest())
    suite.addTest(users_manager.UsersManagerTest())
    suite.addTest(emitters.EmittersTest())
    suite.addTest(accounts.AccountsTest())
    return suite