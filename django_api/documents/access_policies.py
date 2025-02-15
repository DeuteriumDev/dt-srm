from django.http import HttpRequest
from rest_access_policy import AccessPolicy
from django.db import models
from typing import Dict
from accounts.models import CustomPermissions
from functools import reduce
from accounts.serializers import CustomPermissionsSerializer


def get_user_permissions(
    request: HttpRequest,
) -> models.manager.BaseManager[CustomPermissions]:
    return CustomPermissions.objects.filter(group__in=request.user.groups.all())


def get_document_permissions(
    model: models.Model,
    request: HttpRequest,
) -> models.manager.BaseManager[CustomPermissions] | None:
    user_permissions = get_user_permissions(request)
    direct_permissions = user_permissions.filter(object_id=model.id)

    if direct_permissions.count() > 0:
        return direct_permissions
    if model.parent is not None and model.inherit_permissions:
        return get_document_permissions(model.parent, request)
    return None


def merge_permissions(permissions: models.QuerySet) -> Dict[str, bool]:
    """Merges *parallel* permissions, not child to parent permissions.
    Ie: multiple permissions on the same document

    Args:
        permissions (models.QuerySet): QS of permissions, usually just 1

    Returns:
        Dict[str, bool]:
    """
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
        return CustomPermissionsSerializer(None).data
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
            """
            Recursively build an un-ordered set of all the documents,
            including children
            """
            for c in children:
                child_docs.add(c)
                if c is not None and c.children is not None:
                    # instead of repeating the checks inside the `if`
                    # statements we nest the if statements
                    if isinstance(c.children, list):
                        if len(c.children) > 0:
                            set_children(c.children)
                    elif c.children.count() > 0:
                        set_children(list(c.children.all()))

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
