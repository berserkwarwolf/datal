# -*- coding: utf-8 -*-
from core.engine import preview_chart
from django.test import TestCase


class TestEngine(TestCase):

    def test_preview_chart(self):
        query = {
            'pInvertedAxis': u'',
            'pNullValuePreset': u'',
            'pHeaderSelection': u'K1:K1',
            'pId': 70703,
            'pType': u'linechart',
            'pData': u'K2:K4',
            'pNullValueAction': u'exclude',
            'pLabelSelection': u'C2:C4',
            'pInvertData': u''
        }
        result, content_type = preview_chart(query)
        # print result
        assert content_type == 'application/json; charset=UTF-8'


    def test_preview_map(self):
        query = {
            'pId': 70703,
            'pType': 'mapchart',
            'pNullValueAction': 'exclude',
            'pNullValuePreset': '',
            'pData': 'C2:C12',
            'pLatitudSelection': 'K2:K12',
            'pLongitudSelection': 'L2:L12',
            'pHeaderSelection': '',
            'pTraceSelection': '',
            # 'pZoom': '1',
            # 'pBounds': '-24.237324317659557;-45.949525292619;-42.98732431765956;-95.230775292619'
        }
        result, content_type = preview_chart(query)
        # print result, content_type
        assert content_type == 'application/json; charset=UTF-8'