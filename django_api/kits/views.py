from functools import reduce
from django.http import HttpRequest
from accounts.models import CustomPermissions
from kits.models import Kit, Question, Answer, Folder
from kits.serializers import (
    KitSerializer,
    QuestionSerializer,
    AnswerSerializer,
    FolderSerializer,
)
from rest_access_policy import AccessPolicy
from rest_access_policy import AccessViewSetMixin
from rest_framework import viewsets
from django.db import models
from typing import Dict


def get_user_permissions(
    request: HttpRequest,
) -> models.manager.BaseManager[CustomPermissions]:
    return CustomPermissions.objects.filter(group__in=request.user.groups.all())


def get_document_permissions(
    model: models.Model,
    request: HttpRequest,
) -> models.manager.BaseManager[CustomPermissions] | None:
    user_permissions = get_user_permissions(request)
    print("doc permi:", model.id, user_permissions.filter(object_id=model.id))
    direct_permissions = user_permissions.filter(object_id=model.id)

    if direct_permissions.count() > 0:
        return direct_permissions
    if model.parent is not None and model.inherit_permissions:
        return get_document_permissions(model.parent, request)
    return None


def merge_permissions(permissions: models.QuerySet) -> Dict[str, bool]:
    return reduce(
        lambda p1, p2: {
            "can_create": p1.can_create or p2.can_create,
            "can_read": p1.can_read or p2.can_read,
            "can_update": p1.can_update or p2.can_update,
            "can_delete": p1.can_delete or p2.can_delete,
        },
        [p for p in permissions],
    )


def get_permission(request, view):
    perms = get_document_permissions(view.get_object(), request)
    if perms is None:
        return {
            "can_create": False,
            "can_read": False,
            "can_update": False,
            "can_delete": False,
        }
    print(merge_permissions(perms))
    return merge_permissions(perms)


class DocumentAccessPolicy(AccessPolicy):
    statements = [
        {
            "action": "*",
            "principal": "admin",
            "effect": "allow",
        },
        {
            "action": "create",
            "principal": "authenticated",
            "effect": "allow",
            "condition": "has_create_access",
        },
        {
            "action": "list",
            "principal": "authenticated",
            "effect": "allow",
        },
        {
            "action": "detail",
            "principal": "authenticated",
            "effect": "allow",
            "condition": "has_read_access",
        },
        {
            "action": "update",
            "principal": "authenticated",
            "effect": "allow",
            "condition": "has_update_access",
        },
        {
            "action": "destroy",
            "principal": "authenticated",
            "effect": "allow",
            "condition": "has_delete_access",
        },
    ]

    @classmethod
    def scope_queryset(
        _cls,
        request: HttpRequest,
        queryset,
    ):
        user_permissions = get_user_permissions(request)
        child_docs = set()

        def set_children(children):
            """Recursively build an un-ordered set of all the documents, including children"""
            for c in children:
                child_docs.add(c)
                managers = getattr(c, c.children_property_name)
                if managers.count() > 0:
                    set_children(list(managers.all()))

        set_children([p.content_object for p in user_permissions])

        return queryset.filter(id__in=[c.id for c in child_docs])

    def has_create_access(self, request, view, _action) -> bool:
        return get_permission(request, view)["can_create"]

    def has_read_access(self, request, view, _action) -> bool:
        return get_permission(request, view)["can_read"]

    def has_update_access(self, request, view, _action) -> bool:
        return get_permission(request, view)["can_update"]

    def has_delete_access(self, request, view, _action) -> bool:
        return get_permission(request, view)["can_delete"]


class DocumentViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    access_policy = DocumentAccessPolicy

    def get_queryset(self):
        return self.access_policy.scope_queryset(self.request, self.queryset)


class FolderViewSet(DocumentViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer


class KitViewSet(DocumentViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer


class QuestionViewSet(DocumentViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AnswerViewSet(DocumentViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
