import logging
from core.v8.engine import Engine

class EngineCommand(object):
    endpoint = 'defalt_endpoint'

    def __init__(self, data):
        self.engine = Engine(self.endpoint)
        self.data = data

    def onException(self, exc):
        pass

    def run(self):
        try:
            return self.engine.request(dict(self.data))
        except Exception, e:
            logger = logging.getLogger(__name__)
            logger.debug(e)
            self.onException(e)


class EngineDataCommand(EngineCommand):
    endpoint = settings.MEMCACHED_ENGINE_END_POINT

class EngineChartCommand(EngineCommand):
    endpoint = settings.END_POINT_CHART_SERVLET

class EnginePreviewChartCommand(EngineCommand):
    endpoint = settings.END_POINT_CHART_PREVIEWER_SERVLET

class EngineLoadCommand(EngineCommand):
    endpoint = settings.END_POINT_LOADER_SERVLET

class PreviewLoadCommand(EngineCommand):
    endpoint = settings.END_POINT_PREVIEWER_SERVLET

