import uuid
from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from accounts.models import CustomPermissions
from polymorphic.models import PolymorphicModel


class NodeModel(PolymorphicModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now=True)

    custom_permissions = GenericRelation(CustomPermissions)
    inherit_permissions = models.BooleanField(default=True, null=False, blank=False)
    parent = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        verbose_name="parent",
        related_name="children",
    )

    class Meta:
        managed = True
        ordering = ["updated"]
