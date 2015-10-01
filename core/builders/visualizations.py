import json


class VisualizationImplBuilder:

    def __init__(self, **fields):
        self.fields = fields

    def build(self):
        field = dict()
        field['format'] = dict()
        field['format']['type'] = self.fields['type']
        field['format']['chartTemplate'] = self.fields['chartTemplate']
        field['format']['showLegend'] = 'checked' if self.fields['showLegend'] == 'true' else ''
        field['format']['invertedAxis'] = 'checked' if self.fields['invertedAxis'] == 'true' else ''
        field['format']['invertData'] = 'checked' if self.fields['invertData'] == 'true' else ''
        field['format']['correlativeData'] = self.fields['correlativeData'] if self.fields['correlativeData'] else 'false'
        field['format']['nullValueAction'] = self.fields['nullValueAction'] if self.fields['nullValueAction'] else 'exclude'
        field['format']['nullValuePreset'] = self.fields['nullValuePreset']
        field['title'] = self.fields['title']
        field['data'] = self.fields['data']
        field['chart'] = dict()
        field['chart']['labelSelection'] = self.fields['labelSelection']
        field['chart']['headerSelection'] = self.fields['headerSelection']
        field['chart']['latitudSelection'] = self.fields['latitudSelection']
        field['chart']['longitudSelection'] = self.fields['longitudSelection']
        field['chart']['is3D'] = self.fields['is3D'] if self.fields['is3D'] else 'false'

        return json.dumps(field)

    def parse(self, impl_details):
        return json.loads(impl_details)
