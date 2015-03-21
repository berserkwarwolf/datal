from junar.core.models import DataStreamHits, VisualizationHits, DashboardHits

def create_report(object_id, model, channel_type):
    if model == DataStreamHits:
        model.objects.create(datastream_id=object_id, channel_type=channel_type)
    elif model == VisualizationHits:
         model.objects.create(visualization_id=object_id, channel_type=channel_type)
    elif model == DashboardHits:
         model.objects.create(dashboard_id=object_id, channel_type=channel_type)
