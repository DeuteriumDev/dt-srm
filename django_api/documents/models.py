from django.db import models
import reversion

from nodes.models import NodeModel


@reversion.register()
class Folder(NodeModel):
    name = models.TextField(blank=False, null=False)
    description = models.TextField(null=True, blank=True, default="")
    favorite = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} {self.id}"
