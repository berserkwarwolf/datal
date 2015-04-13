# -*- coding: utf-8 -*-
from core.daos.datasets import AbstractDatasetDBDAO
from workspace import settings

class DatasetDBDAO(AbstractDatasetDBDAO):
    """ class for manage access to datasets' database tables """
    
    def query(self, account_id=None, language=None, page=0, itemsxpage=settings.PAGINATION_RESULTS_PER_PAGE,
          sort_by='-id', filters_dict=None, filter_name=None, exclude=None):

        return super(DatasetDBDAO, self).query(account_id, language, page, itemsxpage, sort_by, filters_dict, filter_name, exclude)