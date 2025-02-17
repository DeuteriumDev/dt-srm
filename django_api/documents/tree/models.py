from django.core.exceptions import ValidationError
from django.db import models
from polymorphic.managers import PolymorphicManager
from polymorphic.models import PolymorphicModel

from .fields import TreeNodeForeignKey
from .query import TreeQuerySet


class TreeNode(PolymorphicModel):
    parent = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        verbose_name="parent",
        related_name="children",
    )

    # objects = PolymorphicManager()

    class Meta:
        abstract = True

    # def ancestors(self, **kwargs):
    #     """
    #     Returns all ancestors of the current node

    #     See ``TreeQuerySet.ancestors`` for details and optional arguments.
    #     """
    #     print(self.__class__._default_manager)
    #     return self.__class__._default_manager.ancestors(self, **kwargs)

    # def descendants(self, **kwargs):
    #     """
    #     Returns all descendants of the current node

    #     See ``TreeQuerySet.descendants`` for details and optional arguments.
    #     """

    #     print('desc')
    #     return self.__class__._default_manager.descendants(self, **kwargs)
