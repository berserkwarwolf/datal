import factory
from core.choices import (
    CollectTypeChoices, SourceImplementationChoices, StatusChoices)
from core.models import *

class AccountLevelFactory(factory.Factory):
    FACTORY_FOR = AccountLevel
    
    name = 'Level 5'
    code = 'level_5'
    description = ''

class AccountFactory(factory.Factory):
    FACTORY_FOR = Account
    
    name = 'test_account'
    level = factory.SubFactory(AccountLevelFactory)
    status = 1
    meta_data = ''

class UserFactory(factory.Factory):
    FACTORY_FOR = User  
    
    name = 'Test name'
    nick = 'test'
    email = factory.LazyAttribute(lambda o: '%s@junar.com' % (o.nick.lower()))
    language = 'en'
    account = factory.SubFactory(AccountFactory)

class CategoryFactory(factory.Factory):
    FACTORY_FOR = Category
    
    account = factory.SubFactory(AccountFactory)

class CategoryI18nFactory(factory.Factory):
    FACTORY_FOR = CategoryI18n
    
    language = 'en'
    category = factory.SubFactory(Category)
    name = 'Test Category'
    slug = 'test_category'
    description = 'Category Description'    

class DatasetFactory(factory.Factory):
    FACTORY_FOR = Dataset

    user = factory.SubFactory(UserFactory)
    is_dead = 0
    type = CollectTypeChoices.URL    

class DatasetRevisionFactory(factory.Factory):
    FACTORY_FOR = DatasetRevision

    user = factory.SubFactory(UserFactory)
    dataset = factory.SubFactory(DatasetFactory)
    category = factory.SubFactory(CategoryFactory)
    end_point = 'http://www.google.com'
    filename = 'http://www.google.com'
    impl_type = SourceImplementationChoices.HTML
    status = StatusChoices.DRAFT
    size = 0

class DatasetI18nFactory(factory.Factory):
    FACTORY_FOR = DatasetI18n
    
    dataset_revision = factory.SubFactory(DatasetRevisionFactory)
    language = 'en'
    title = 'Test Dataset'
    description = 'Dataset description'

class RoleFactory(factory.Factory):
    FACTORY_FOR = Role
    
    name = 'Publisher'
    code = 'ao-publisher'
    description = ''
    
class PrivilegeFactory(factory.Factory):
    FACTORY_FOR = Privilege
    
    name = 'Can Query Dataset'
    code = 'workspace.can_query_dataset'
    description = ''

class GrantFactory(factory.Factory):
    FACTORY_FOR = Grant
    
    user = factory.SubFactory(UserFactory)
    role = factory.SubFactory(RoleFactory)
    privilege = factory.SubFactory(PrivilegeFactory)