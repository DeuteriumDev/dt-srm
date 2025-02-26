import uuid
from django.db import models
import reversion

from nodes.models import NodeModel


@reversion.register()
class Invoice(NodeModel):
    name = models.TextField(blank=False, null=False)
    description = models.TextField(null=True, blank=True, default="")
    total = models.FloatField(null=True, blank=True, default=0.0)


@reversion.register()
class LineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    position = models.IntegerField(null=True, blank=True)
    invoice = models.ForeignKey(
        Invoice,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="line_items",
    )


@reversion.register()
class Item(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(null=True, blank=True, default="")
    value = models.FloatField(null=True, blank=True, default=0.0)
    line_item = models.ForeignKey(
        LineItem,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="items",
    )
