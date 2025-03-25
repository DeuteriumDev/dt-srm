from django.db import models
from nodes.models import NodeModel
import reversion


@reversion.register()
class Kit(NodeModel):
    name = models.TextField(blank=False, null=False)
    description = models.TextField(null=True, blank=True, default="")

    def __str__(self):
        return f"Kit: {self.name}"


@reversion.register()
class Question(models.Model):
    title = models.TextField(default="")
    description = models.TextField(null=True, blank=True, default="")
    image = models.URLField(null=True, blank=True)
    next = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="previous",
    )
    kit = models.OneToOneField(
        Kit,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name="start",
    )

    def __str__(self):
        return f"Question: {self.title}"


@reversion.register()
class Answer(models.Model):
    title = models.TextField(blank=False, null=False)
    description = models.TextField(default="")
    image = models.URLField(null=True, blank=True)
    index = models.PositiveIntegerField(null=False, blank=False, default=0)

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="answers",
    )

    def __str__(self):
        return f"Answer: {self.title}"
