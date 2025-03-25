from pprint import pprint
from django.http import HttpRequest
from rest_access_policy import AccessPolicy
from django.contrib.contenttypes.models import ContentType

from common.get_permissions import get_permission, get_user_permissions


class AccountsAccessPolicy(AccessPolicy):
    statements = [
        # {
        #     "action": "*",
        #     "principal": "authenticated",
        #     "effect": "allow",
        # },
        {
            "action": "list",
            "principal": ["authenticated"],
            "effect": "allow",
        },
        {
            "action": "me",
            "principal": ["authenticated"],
            "effect": "allow",
        },
        {
            "action": ["create"],
            "principal": ["authenticated"],
            "effect": "allow",
            "condition": "has_create_access",
        },
        {
            "action": ["retrieve", "get"],
            "principal": ["authenticated"],
            "effect": "allow",
            "condition": "has_read_access",
        },
        {
            "action": ["update", "partial_update"],
            "principal": ["authenticated"],
            "effect": "allow",
            "condition": "has_update_access",
        },
        {
            "action": ["destroy"],
            "principal": ["authenticated"],
            "effect": "allow",
            "condition": "has_delete_access",
        },
    ]

    @classmethod
    def scope_queryset(_cls, request: HttpRequest, queryset, model):
        user_permissions = get_user_permissions(request)
        ids = [p.object_id for p in user_permissions]
        return queryset.filter(id__in=ids)

    def has_create_access(self, request, view, _action) -> bool:
        obj = request.data
        if obj["parent"] is None:
            return request.user.is_admin
        perm = get_permission(request, view.queryset.get(id=obj["parent"]))
        return perm["can_create"]

    def has_read_access(self, request, view, _action) -> bool:
        return get_permission(request, view.get_object())["can_read"]

    def has_update_access(self, request, view, _action) -> bool:
        return get_permission(request, view.get_object())["can_update"]

    def has_delete_access(self, request, view, _action) -> bool:
        return get_permission(request, view.get_object())["can_delete"]


class AccountsUsersAccessPolicy(AccessPolicy):
    statements = [
        {
            "action": "*",
            "principal": "admin",
            "effect": "allow",
        },
        {
            "action": ["list"],
            "principal": ["*"],
            "effect": "allow",
        },
        {
            "action": ["retrieve"],
            "principal": ["*"],
            "effect": "allow",
            "condition": "has_read_access",
        },
        {
            "action": ["update", "partial_update"],
            "principal": ["authenticated"],
            "effect": "allow",
            "condition": "has_update_access",
        },
        {
            "action": ["destroy"],
            "principal": ["authenticated"],
            "effect": "allow",
            "condition": "has_delete_access",
        },
    ]

    @classmethod
    def scope_queryset(_cls, request: HttpRequest, queryset, model):
        user_permission_ids = [
            p.content_object.id
            for p in get_user_permissions(request).filter(can_read=True)
        ]
        user_group_ids = [
            g.id for g in request.user.groups.all() if g.id in user_permission_ids
        ]

        return queryset.filter(groups__id__in=user_group_ids)
