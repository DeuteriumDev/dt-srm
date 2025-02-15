from django.http import HttpRequest
from kits.models import Kit, Folder
from documents.serializers import DocumentSerializer
from rest_framework import decorators
from rest_framework.response import Response
from django.db.models.expressions import RawSQL
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_api.pagination import CustomPageNumberPagination
from documents.access_policies import DocumentAccessPolicy


fields = ("id", "name", "created", "updated", "doc_type", "parent")
filter_fields = {
    "id": ["exact"],
    "name": ["exact", "contains"],
    "created": ["gte", "lte"],
    "updated": ["gte", "lte"],
    "doc_type": ["in"],
    "parent": ["exact", "isnull", "in"],
}
un_filterable_fields = ["doc_type"]


def flatten(xss):
    return [x for xs in xss for x in xs]


@extend_schema(
    operation_id="DocumentsList",
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
    responses={
        200: {
            "type": "object",
            "required": ["count", "results", "breadcrumbs"],
            "properties": {
                "count": {
                    "type": "integer",
                    "example": 123,
                },
                "next": {"type": "integer", "nullable": True, "example": 2},
                "previous": {"type": "integer", "nullable": True, "example": 1},
                "breadcrumbs": {
                    "type": "array",
                    "items": {
                        "id": {
                            "type": "string",
                            "format": "uuid",
                            "readOnly": True,
                        },
                        "name": {
                            "type": "string",
                            "readOnly": True,
                        },
                    },
                },
                "results": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string",
                                "format": "uuid",
                                "readOnly": True,
                            },
                            "name": {
                                "type": "string",
                                "readOnly": True,
                            },
                            "created": {
                                "type": "string",
                                "format": "date-time",
                                "readOnly": True,
                            },
                            "updated": {
                                "type": "string",
                                "format": "date-time",
                                "readOnly": True,
                            },
                            "doc_type": {
                                "type": "string",
                                "readOnly": True,
                            },
                            "tags": {
                                "type": "array",
                                "readOnly": True,
                                "items": {
                                    "type": "string",
                                    "readOnly": True,
                                },
                            },
                            "parent": {
                                "type": "object",
                                "nullable": True,
                                "properties": {
                                    "id": {
                                        "type": "string",
                                        "format": "uuid",
                                        "readOnly": True,
                                    },
                                    "name": {
                                        "type": "string",
                                        "readOnly": True,
                                    },
                                },
                            },
                        },
                        "required": [
                            "created",
                            "id",
                            "name",
                            "updated",
                            "doc_type",
                            "tags",
                            "parent",
                        ],
                    },
                },
            },
        },
    },
)
@decorators.api_view(["GET"])
def documents_list(request: HttpRequest):
    access_policy = DocumentAccessPolicy()
    paginator = CustomPageNumberPagination()

    filters = {}

    # final result QS
    docs = None

    for key, val in request.query_params.items():
        if key.find("__") > -1:
            [field, filter] = key.split("__")
            if field not in un_filterable_fields and (
                field in filter_fields.keys() and filter in filter_fields[field]
            ):
                # convert "True" / "False" to Boolean
                if val.lower() in ["true", "false"]:
                    filters[key] = val.lower() == "true"
                elif filter == "in":
                    filters[key] = val.split(",")
                else:
                    filters[key] = val

    # exclude [Folder]s if "doc_type" query param and not "in" the requested types
    if request.query_params.get(
        "doc_type__in"
    ) is None or "folder" in request.query_params.get("doc_type__in").split(","):
        kit_table_db = Kit.objects.model._meta.db_table
        folder_table_db = Folder.objects.model._meta.db_table
        folders = access_policy.scope_queryset(
            request,
            Folder.objects.all().filter(**filters),
        ).values(
            *fields,
            tags=RawSQL(
                f"""
                    array_remove(
                        array[
                            case when "{folder_table_db}"."favorite" = true then \'favorite\' end,
                            (
                                select case when count(*) > 0 then 'items:' || count(*) end
                                from (
                                    select parent_id
                                    from "{kit_table_db}"
                                    union all
                                    select parent_id
                                    from "{folder_table_db}"
                                ) docs
                                where docs."parent_id" = "{folder_table_db}"."id"
                            )::text
                        ],
                        Null
                    )""",
                (),
            ),
            doc_type=RawSQL("select 'folder'", ()),
        )
        if docs is None:
            docs = folders
        else:
            docs = docs.union(folders)

    # exclude [Kit]s if "doc_type" query param and not "in" the requested types
    if request.query_params.get(
        "doc_type__in"
    ) is None or "kit" in request.query_params.get("doc_type__in").split(","):
        kits = access_policy.scope_queryset(
            request,
            Kit.objects.all().filter(**filters),
        ).values(
            *fields,
            tags=RawSQL("Array[]::text[]", ()),
            doc_type=RawSQL("select 'kit'", ()),
        )
        if docs is None:
            docs = kits
        else:
            docs = docs.union(kits)

    ordering = request.query_params.get("ordering")
    if ordering is not None:
        docs = docs.order_by(*ordering.split(","))
    else:
        docs = docs.order_by("created")

    breadcrumbs = []

    # recursively navigate folder tree to make breadcrumbs
    def append_parent(parent_id):
        folder = Folder.objects.get(pk=parent_id)
        breadcrumbs.append({"id": folder.id, "name": folder.name})
        if folder.parent is not None:
            append_parent(folder.parent)

    if filters.get("parent__exact") is not None:
        append_parent(filters["parent__exact"])

    return Response(
        data={
            **paginator.get_paginated_response(
                DocumentSerializer(
                    paginator.paginate_queryset(
                        docs,
                        request,
                    ),
                    many=True,
                    context={"request": request},
                ).data
            ).data,
            "breadcrumbs": breadcrumbs,
        }
    )
