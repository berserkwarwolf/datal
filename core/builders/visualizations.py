import json


class VisualizationImplBuilder:

    def __init__(self, **fields):
        self.fields = fields

    def build(self):
        field = dict()
        field['format'] = dict()
        field['format']['type'] = self.fields['type']
        field['format']['chartTemplate'] = self.fields['chartTemplate']
        field['format']['showLegend'] = self.fields['showLegend']
        field['format']['invertedAxis'] = self.fields['invertedAxis']
        field['format']['correlativeData'] = self.fields['correlativeData']
        field['format']['nullValueAction'] = self.fields['nullValueAction']
        field['format']['nullValuePreset'] = self.fields['nullValuePreset']
        field['title'] = self.fields['title']
        field['data'] = self.fields['range_data']
        field['chart'] = dict()
        field['chart']['labelSelection'] = self.fields['labelSelection']
        field['chart']['is3D'] = self.fields['is3D']

        return json.dumps(field)
