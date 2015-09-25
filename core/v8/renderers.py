from rest_framework import renderers

class EngineRenderer(renderers.BaseRenderer):
    def render(self, data, media_type=None, renderer_context=None):
        return data

class CSVEngineRenderer(EngineRenderer):
    media_type="text/csv"
    format = "csv"

class XLSEngineRenderer(EngineRenderer):
    media_type="application/vnd.ms-excel"
    format = "xls"

class HTMLEngineRenderer(EngineRenderer):
    media_type="text/html"
    format = "html"