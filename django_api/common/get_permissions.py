from django.http import HttpRequest
from django.db import models
from typing import Dict
from accounts.models import CustomPermissions


def merge_permissions(permissions: list[CustomPermissions]) -> Dict[str, bool]:
    """Merges *parallel* permissions, not child to parent permissions.
    Ie: multiple permissions on the same document

    Args:
        permissions (models.QuerySet): QS of permissions, usually just 1

    Returns:
        Dict[str, bool]:
    """
    result = {
        "can_create": False,
        "can_read": False,
        "can_update": False,
        "can_delete": False,
    }
    for p in permissions:
        result["can_create"] = result["can_create"] or p.can_create
        result["can_read"] = result["can_read"] or p.can_read
        result["can_update"] = result["can_update"] or p.can_update
        result["can_delete"] = result["can_delete"] or p.can_delete
    return result


def get_permission(request: HttpRequest, obj: models.Model):
    perms = get_document_permissions(request, obj)
    if perms is None:
        return merge_permissions([])  # will return all-false permissions
    return merge_permissions(perms)


def get_user_permissions(
    request: HttpRequest,
) -> models.manager.BaseManager[CustomPermissions]:
    return CustomPermissions.objects.filter(group__in=request.user.groups.all())


def get_document_permissions(
    request: HttpRequest,
    model: models.Model,
) -> models.manager.BaseManager[CustomPermissions] | None:
    user_permissions = get_user_permissions(request)
    direct_permissions = user_permissions.filter(object_id=model.id)

    if direct_permissions.count() > 0:
        return direct_permissions
    if model.parent is not None and model.inherit_permissions:
        return get_document_permissions(request, model.parent)
    return None
