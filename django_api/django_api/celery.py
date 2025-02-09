import os

from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_api.settings")
app = Celery("django_api", broker="pyamqp://guest@localhost//")
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks(
    [
        "accounts",
        "django_api",
        "kits",
    ]
)
