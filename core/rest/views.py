from django.http import Http404
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import mixins
from core.models import GuidModel
from core.search.elastic import ElasticFinderManager
from core.v8.views import EngineViewSetMixin

import logging

logger = logging.getLogger(__name__)

class ResourceViewSet(EngineViewSetMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = GuidModel
    lookup_field = 'guid'
    data_types = ['dt', 'ds', 'vz']
        
    def list(self, request, format='json'):
        rp = self.request.query_params.get('rp', None) # TODO check for rp arguemnt used in some grids
        limit = self.request.query_params.get('limit', rp)
        offset = self.request.query_params.get('offset', '0')
        page_num = int(offset)/int(limit) + 1 if limit else 0

        resources, time, facets = ElasticFinderManager().search(
            query=request.query_params.get('query', ''),
            slice=int(limit) if limit else None,
            page=page_num,
            account_id=request.auth['account'].id,
            user_id=request.user.id,
            resource=self.get_data_types(),
            order=request.query_params.get('order', ''))

        page = self.paginate_queryset(resources)
        if page is not None:
            self.paginator.count = time['count']
            serializer = self.get_serializer(resources, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(resources, many=True,
            context={'request':request} )

        return Response(serializer.data)

    def get_data_types(self):
        if hasattr(self, 'data_types'):
            return self.data_types
        return []

    def get_queryset(self):
        params = {'language': self.request.auth['language'] }
        params[self.dao_get_param] = self.kwargs[self.lookup_field]
        return super(ResourceViewSet, self).get_queryset().get(**params)

    def get_object(self):
        obj = self.get_queryset()
        if not obj:
            raise Http404

        self.check_object_permissions(self.request, obj)
        return obj