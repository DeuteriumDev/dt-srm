from django.db import models

# Create your models here.


class Kit(models.Model):
    title = models.TextField
    slug = models.SlugField(null=False)
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now_add=True)
    start = models.ForeignKey(to="Question", on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.slug} {self.title}"


class Question(models.Model):
    title = models.TextField
    description = models.TextField(null=True, blank=True)
    image = models.URLField(null=True, blank=True)
    answers = models.ManyToManyField(null=True, blank=True, to="Answer")
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now_add=True)
    slug = models.SlugField(null=False)
    next = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.slug} {self.title}"


class Answer(models.Model):
    title = models.TextField
    description = models.TextField
    image = models.URLField(null=True, blank=True)
    created = models.DateTimeField(null=False, auto_now_add=True)
    updated = models.DateTimeField(null=False, auto_now_add=True)
    slug = models.SlugField(null=False)

    def __str__(self):
        return f"{self.slug} {self.title}"
