import uuid
from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from accounts.models import CustomPermissions
from itertools import chain
from operator import attrgetter
from polymorphic.models import PolymorphicModel
from typing import Dict, List
from .tree.models import TreeNode
import reversion


class AbstractDocumentModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now=True)
    custom_permissions = GenericRelation(CustomPermissions)
    inherit_permissions = models.BooleanField(default=True, null=False, blank=False)

    class Meta:
        abstract = True
        ordering = ["updated"]

    @property
    def parent(self):
        raise Exception("Parent [parent]: Must override this property")

    @property
    def children(self):
        raise Exception("Parent [children]: Must override this property")


class Document(AbstractDocumentModel):
    """
    Fake model for adding query filtering to [documents view](./views.py) , do not use
    """

    name = models.TextField(blank=False, null=False)
    doc_type = models.TextField(blank=False, null=False)

    class Meta:
        managed = False


class Folder(AbstractDocumentModel):
    name = models.TextField(blank=False, null=False)
    description = models.TextField(null=True, blank=True, default="")
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        default=None,
        blank=True,
        related_name="children_folders",
    )
    favorite = models.BooleanField(default=False)

    @property
    def children(self) -> List[Dict]:
        return sorted(
            chain(self.children_folders.all(), self.children_kits.all()),
            key=attrgetter("created"),
        )

    def __str__(self):
        return f"Folder: {self.name}"


@reversion.register()
class DocumentNodeModel(PolymorphicModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(null=False, auto_now_add=True)
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


class FolderNode(DocumentNodeModel):
    name = models.TextField(blank=False, null=False)
    description = models.TextField(null=True, blank=True, default="")
    favorite = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} {self.id}"


class InvoiceNode(DocumentNodeModel):
    name = models.TextField(blank=False, null=False)
    description = models.TextField(null=True, blank=True, default="")
    total = models.FloatField(null=True, blank=True, default=0.0)
