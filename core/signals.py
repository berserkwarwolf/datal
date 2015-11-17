from django.dispatch import Signal


# Dataset
dataset_changed = Signal(providing_args=['id'])
dataset_unpublished = Signal(providing_args=['id'])
dataset_removed = Signal(providing_args=['id'])
