# -*- coding: utf-8 -*-

from django import forms
from core.choices import VISUALIZATION_TYPES
from core.v8.forms import RequestForm

class DatasetLoadForm(RequestForm):
    wargs = forms.CharField(required=False)
    
    def clean(self):
        cleaned_data = super(DatasetLoadForm, self).clean()
        for key, valor in self.data.items():
            if key not in cleaned_data and not key.startswith('form'):
                cleaned_data[key]=valor
        return cleaned_data


# es el único que no hereda del RequestForm
class DatastreamPreviewForm(forms.Form):
    # pEndPoint: end poibnt del dataset relacionado al ds
    end_point = forms.CharField(required=True)
    # pImplType: Tipo de implementacion del dataset relacionado al datastream       
    impl_type = forms.CharField(required=True)
    # pImplDetails: XML con detales de implementacion del dataset relacionado al datastream
    impl_details = forms.CharField(required=False)
    # pDataSource: XML describiendo la estructura del dataset
    datasource = forms.CharField(required=True)
    # pSelectStatement: XML con la sentencia SQL para scrapear los datos desde la fuente
    select_statement = forms.CharField(required=True)
    # pBucketName: Nombre del bucket configurado para la cuenta
    bucket_name = forms.CharField(required=False)
    # pLimit: Cantidad de filas que se quiere previsualizar   
    limit = forms.IntegerField(required=False)
    page = forms.IntegerField(required=False)
    rdf_template = forms.CharField(required=False)

class VisualizationRequestForm(RequestForm):
    # pBounds: Limites del mapa para filtrar los puntos
    bounds = forms.CharField(required=False)
    # pZoom: Nivel de zoom a utilizar para clusterizar        
    zoom = forms.IntegerField(required=False)
    # pWhereExpr: Condicion logica para unit los filtros
    whereExpr= forms.CharField(required=False)


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
    nullValueAction = forms.CharField(required=False)
    # pNullValuePreset: Valor a utilizar en caso que la accion sea preset
    nullValuePreset = forms.CharField(required=False)
    # pHeaderSelection: Rango para la seleccion de las cabeceras de la visualizacion
    headers = forms.CharField(required=False)
    
class VisualizationPreviewMapForm(VisualizationPreviewForm):
    # pLatitudSelection:  Rango para la seleccion de las latitudes de los puntos del mapa
    lat = forms.CharField(required=False)
    # pLongitudSelection Rango para la seleccion de las longitudes de los puntos del mapa
    lon = forms.CharField(required=False)
    # pTraceSelection: Rango para la seleccion de los trazos del mapa   
    traces = forms.CharField(required=False)
    # pType
    type = forms.ChoiceField(required=False, choices=VISUALIZATION_TYPES, initial='mapchart')

