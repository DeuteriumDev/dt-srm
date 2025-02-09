from functools import reduce
from django.http import HttpRequest
from accounts.models import CustomPermissions
from kits.models import Kit, Question, Answer, Folder
from kits.serializers import (
    KitSerializer,
    QuestionSerializer,
    AnswerSerializer,
    FolderSerializer,
    DocumentSerializer,
)
from rest_access_policy import AccessPolicy, AccessViewSetMixin
from rest_framework import viewsets, mixins, filters, views, pagination, decorators
from django.db import models
from typing import Dict
from django.db.models.expressions import RawSQL
from drf_spectacular.utils import extend_schema, OpenApiParameter


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


class AbstractDocumentViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    access_policy = DocumentAccessPolicy
    filterset_fields = "__all__"

    def get_queryset(self):
        return self.access_policy.scope_queryset(self.request, self.queryset)


class FolderViewSet(AbstractDocumentViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer


class KitViewSet(AbstractDocumentViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer


class QuestionViewSet(AbstractDocumentViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AnswerViewSet(AbstractDocumentViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer


def flatten(xss):
    return [x for xs in xss for x in xs]


fields = ("id", "name", "created", "updated", "doc_type")
filter_fields = {
    "id": ["exact"],
    "name": ["exact", "contains"],
    "created": ["gte", "lte"],
    "updated": ["gte", "lte"],
    "doc_type": ["in"],
}


@extend_schema(
    parameters=[
        *flatten(
            [
                [
                    # all params are strings since @hey-api doesn't "type"
                    # dates on the client-module
                    OpenApiParameter(name=f"{n}__{o}", required=False, type=str)
                    for o in filter_fields.get(n)
                ]
                for n in filter_fields.keys()
            ]
        ),
        OpenApiParameter(name="page", required=False, type=int),
        OpenApiParameter(
            name="ordering",
            required=False,
            enum=flatten([(i, f"-{i}") for i in fields]),
        ),
    ],
    responses={200: DocumentSerializer(many=True)},
)
@decorators.api_view(["GET"])
def documents_list(request: HttpRequest):
    access_policy = DocumentAccessPolicy()
    paginator = pagination.PageNumberPagination()
    paginator.page_size = 10

    filters = {}

    # final result QS
    docs = None

    for key, val in request.query_params.items():
        if key.find("__") > -1:
            [field, filter] = key.split("__")
            if field != "doc_type" and (
                field in filter_fields.keys() and filter in filter_fields[field]
            ):
                filters[key] = val

    # exclude folders if "doc_type" query param and not "in" the requested types
    if request.query_params.get(
        "doc_type__in"
    ) is None or "folder" in request.query_params.get("doc_type__in").split(","):
        folders = access_policy.scope_queryset(
            request,
            Folder.objects.all().filter(**filters),
        ).values(*fields, doc_type=RawSQL("select 'folder'", ()))
        if docs is None:
            docs = folders
        else:
            docs = docs.union(folders)

    # exclude kits if "doc_type" query param and not "in" the requested types
    if request.query_params.get(
        "doc_type__in"
    ) is None or "kit" in request.query_params.get("doc_type__in").split(","):
        kits = access_policy.scope_queryset(
            request,
            Kit.objects.all().filter(**filters),
        ).values(*fields, doc_type=RawSQL("select 'kit'", ()))
        if docs is None:
            docs = kits
        else:
            docs = docs.union(kits)

    ordering = request.query_params.get("ordering")
    if ordering is not None:
        docs = docs.order_by(*ordering.split(","))

    return paginator.get_paginated_response(
        DocumentSerializer(
            paginator.paginate_queryset(
                docs,
                request,
            ),
            many=True,
        ).data
    )
