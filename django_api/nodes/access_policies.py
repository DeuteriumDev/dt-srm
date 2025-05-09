from django.http import HttpRequest
from rest_access_policy import AccessPolicy
from common.get_permissions import get_user_permissions, get_permission


class RelationalAccessPolicy(AccessPolicy):
    statements = [
        {
            "action": "*",
            "principal": "admin",
            "effect": "allow",
        },
        {
            "action": ["create"],
            "principal": ["authenticated"],
            "effect": "allow",
            "condition": "has_create_access",
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
    def scope_queryset(
        _cls,
        request: HttpRequest,
        queryset,
    ):
        user_permissions = get_user_permissions(request).filter(can_read=True)
        child_docs = set()

        def set_children(children):
            """
            Recursively build an un-ordered set of all the documents,
            including children
            """
            for c in children:
                if c is not None:
                    if hasattr(c, "inherit_permissions") and c.inherit_permissions:
                        child_docs.add(c)
                    elif not hasattr(c, "inherit_permissions"):
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
