from django.test import LiveServerTestCase

from selenium.webdriver.phantomjs.webdriver import WebDriver


# from selenium.webdriver.support.ui import Select, WebDriverWait
# from selenium.webdriver.support import expected_conditions
#
# from core.choices import CollectTypeChoices, SourceImplementationChoices, StatusChoices, ODATA_FREQUENCY
#
#
class DATALSeleniumTests(LiveServerTestCase):
    fixtures = ['account.json', 'accountlevel.json', 'category.json', 'categoryi18n.json', 'grant.json',
                'preference.json', 'privilege.json', 'role.json', 'threshold.json', 'user.json', ]

    @classmethod
    def setUpClass(cls):
        cls.selenium = WebDriver()
        super(DATALSeleniumTests, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super(DATALSeleniumTests, cls).tearDownClass()

    def login_as_admin(self):
        self.selenium.get('%s%s' % (self.live_server_url, '/signin/'))
        username_input = self.selenium.find_element_by_name("username")
        username_input.send_keys('administrador')
        password_input = self.selenium.find_element_by_name("password")
        password_input.send_keys('administrador')
        self.selenium.find_element_by_id('id_submitButton').click()

    def login_as_editor(self):
        self.selenium.get('%s%s' % (self.live_server_url, '/signin/'))
        username_input = self.selenium.find_element_by_name("username")
        username_input.send_keys('editor')
        password_input = self.selenium.find_element_by_name("password")
        password_input.send_keys('editor')
        self.selenium.find_element_by_id('id_submitButton').click()

    def login_as_publicador(self):
        self.selenium.get('%s%s' % (self.live_server_url, '/signin/'))
        username_input = self.selenium.find_element_by_name("username")
        username_input.send_keys('publicador')
        password_input = self.selenium.find_element_by_name("password")
        password_input.send_keys('publicador')
        self.selenium.find_element_by_id('id_submitButton').click()

# def test_create_dataset_webservice_rest(self):
#         endpoint = 'http://nolaborables.com.ar/API/v1/2015'
#         impl_type = SourceImplementationChoices().REST
#         path_to_data = '$.*'
#         title = 'Prueba de Dataset tipo Webservice REST'
#         description = 'Prueba de dataset'
#
#         # Creo dataset tipo webservice
#         self.login()
#         self.selenium.get('%s%s' % (self.live_server_url, '/datasets/create/webservice'))
#         self.selenium.find_element_by_id('id_end_point').send_keys(endpoint)
#         select_impl_type = Select(self.selenium.find_element_by_id('id_impl_type'))
#         select_impl_type.select_by_value(str(impl_type))
#         self.selenium.find_element_by_id('id_path_to_data').send_keys(path_to_data)
#         self.selenium.find_element_by_xpath('//*[@id="contentHeder"]/div/a[2]').click()
#
#         self.selenium.find_element_by_id('id_title').send_keys(title)
#         self.selenium.find_element_by_id('id_description').send_keys(description)
#         self.selenium.find_element_by_xpath('//*[@id="id_createDataset"]/div[2]/header/div/a[2]').click()
