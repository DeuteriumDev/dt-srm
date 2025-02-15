import uuid
from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from accounts.models import CustomPermissions


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
