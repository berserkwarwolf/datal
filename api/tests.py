import unittest
from api.test import datastreams_manager
from api.test import dashboards_manager
from api.test import sources_manager
from api.test import authorizations_manager
from api.test import users_manager
from api.test import applications
from api.test import emitters
from api.test import accounts

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