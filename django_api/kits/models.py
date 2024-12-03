import uuid
from django.db import models

# Create your models here.


class Kit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField(default="")
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now=True)
    start = models.ForeignKey(
        to="Question", on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return f"Kit: {self.title}"


class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField(default="")
    description = models.TextField(null=True, blank=True, default="")
    image = models.URLField(null=True, blank=True)
    answers = models.ManyToManyField(null=True, blank=True, to="Answer")
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now=True)
    next = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return f"Question: {self.title}"


class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField(default="")
    description = models.TextField(null=True, blank=True, default="")
    image = models.URLField(null=True, blank=True)
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now=True)

    def __str__(self):
        return f"Answer: {self.title}"
