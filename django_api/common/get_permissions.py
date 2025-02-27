from django.http import HttpRequest
from django.db import models
from typing import Dict
from accounts.models import CustomPermissions
from functools import reduce
from accounts.serializers import CustomPermissionsSerializer


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


def get_permission(request: HttpRequest, view):
    perms = get_document_permissions(view.get_object(), request)
    if perms is None:
        return CustomPermissionsSerializer(None).data
    return merge_permissions(perms)


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
