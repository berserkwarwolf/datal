# -*- coding: utf-8 -*-

from django import forms
from core.choices import VISUALIZATION_TYPES
from core.v8.forms import RequestForm


class DatastreamRequestForm(RequestForm):
    tableid = forms.CharField(required=False)

# es el único que no hereda del RequestForm
class DatastreamPreviewForm(forms.Form):
    end_point = forms.CharField(required=False)
    impl_type = forms.CharField(required=False)
    impl_details = forms.CharField(required=False)
    datasource = forms.CharField(required=False)
    select_statement = forms.CharField(required=False)
    rdf_template = forms.CharField(required=False)
    bucket_name = forms.CharField(required=False)
    limit = forms.IntegerField(required=False)

class VisualizationRequestForm(RequestForm):
    # pBounds: Limites del mapa para filtrar los puntos
    bounds = forms.CharField(required=False)
    # pZoom: Nivel de zoom a utilizar para clusterizar        
    zoom = forms.IntegerField(required=False)


class VisualizationPreviewForm(VisualizationRequestForm):
    # pData: Rango para la seleccion de la serie de datos de la visualizacion
    data = forms.CharField(required=True)
    # pType
    type = forms.ChoiceField(required=True, choices=VISUALIZATION_TYPES)
    # pInvertData
    invertData = forms.CharField(required=False)
    # pInvertedAxis
    invertedAxis = forms.CharField(required=False)
    # pLabelSelection
    labels = forms.CharField(required=False)
    # pNullValueAction: Nombre de la accion a realizar en caso de encontrar un valor vacio
    nullValueAction = forms.CharField(required=True)
    # pNullValuePreset: Valor a utilizar en caso que la accion sea preset
    nullValuePreset = forms.CharField(required=False)
    # pHeaderSelection: Rango para la seleccion de las cabeceras de la visualizacion
    headers = forms.CharField(required=False)

class VisualizationPreviewMapForm(VisualizationRequestForm):
    # pLatitudSelection:  Rango para la seleccion de las latitudes de los puntos del mapa
    lat = forms.CharField(required=True)
    # pLongitudSelection Rango para la seleccion de las longitudes de los puntos del mapa
    lon = forms.CharField(required=True)
    # pTraceSelection: Rango para la seleccion de los trazos del mapa   
    traces = forms.CharField(required=False)


