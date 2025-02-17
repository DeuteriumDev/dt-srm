from django.db import models
from documents.models import AbstractDocumentModel
from documents.models import Folder


class Kit(AbstractDocumentModel):
    name = models.TextField(blank=False, null=False)
    start = models.ForeignKey(
        to="Question",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="kit",
    )
    parent = models.ForeignKey(
        Folder,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="children_kits",
    )

    @property
    def children(self):
        if self.start is not None:
            return [self.start]
        return []

    def __str__(self):
        return f"Kit: {self.name}"


class Question(AbstractDocumentModel):
    title = models.TextField(default="")
    description = models.TextField(null=True, blank=True, default="")
    image = models.URLField(null=True, blank=True)
    answers = models.ManyToManyField(
        blank=True,
        to="Answer",
        related_name="question",
    )
    next = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="previous",
    )

    @property
    def children(self):
        return self.answers

    @property
    def parent(self):
        if self.kit is not None:
            return self.kit
        return self.previous

    def __str__(self):
        return f"Question: {self.title}"


class Answer(models.Model):
    title = models.TextField(blank=False, null=False)
    description = models.TextField(default="")
    image = models.URLField(null=True, blank=True)
    index = models.PositiveIntegerField(default=0)

    @property
    def parent(self):
        return self.question

    children = None

    def __str__(self):
        return f"Answer: {self.title}"
