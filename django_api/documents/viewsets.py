from rest_access_policy import AccessViewSetMixin
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, OpenApiParameter
from filters.mixins import FiltersMixin
from documents import access_policies

filter_mappings_array = [
    "id__exact",
    "id__in",
    "name__exact",
    "description__contains",
    "description__exact",
    "parent__exact",
    "parent__in",
    "created__gte",
    "created__lte",
    "updated__gte",
    "updated__lte",
]
abstract_filter_mappings = {
    "name__contains": "name__icontains",
}
for f in filter_mappings_array:
    abstract_filter_mappings[f] = f


@extend_schema(
    parameters=[
        OpenApiParameter(name=n, required=False, type=str)
        for n in abstract_filter_mappings.keys()
    ],
)
class AbstractDocumentViewSet(FiltersMixin, AccessViewSetMixin, viewsets.ModelViewSet):
    access_policy = access_policies.DocumentAccessPolicy
    filterset_fields = "__all__"
    ordering_fields = "__all__"

    filter_mappings = abstract_filter_mappings

    arg_splitter = lambda val: val.split(",")
    filter_value_transformations = {
        "id__in": arg_splitter,
        "parent__in": arg_splitter,
    }

    def get_queryset(self):
        return self.access_policy.scope_queryset(self.request, self.queryset)
