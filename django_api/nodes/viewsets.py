from rest_access_policy import AccessViewSetMixin
from rest_framework import viewsets, mixins
from drf_spectacular.utils import extend_schema, OpenApiParameter
from filters.mixins import FiltersMixin
from .access_policies import RelationalAccessPolicy
from common.strtobool import strtobool


filter_mappings_array = [
    "id__exact",
    "id__in",
    "name__exact",
    "description__exact",
    "parent__exact",
    "parent__in",
    "created__gte",
    "created__lte",
    "updated__gte",
    "updated__lte",
    "parent__isnull",
]
abstract_filter_mappings = {
    "name__contains": "name__icontains",
    "description__contains": "description__icontains",
}
for f in filter_mappings_array:
    abstract_filter_mappings[f] = f


params = [
    OpenApiParameter(name=n, required=False, type=str)
    for n in abstract_filter_mappings.keys()
]


@extend_schema(
    parameters=params,
)
class AbstractNodeViewSet(
    FiltersMixin,
    AccessViewSetMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    access_policy = RelationalAccessPolicy
    filterset_fields = "__all__"
    ordering_fields = "__all__"

    filter_mappings = abstract_filter_mappings

    arg_splitter = lambda val: val.split(",")
    filter_value_transformations = {
        "id__in": arg_splitter,
        "parent__in": arg_splitter,
        "parent__isnull": strtobool,
    }

    def get_queryset(self):
        return self.access_policy.scope_queryset(self.request, self.queryset)


@extend_schema(
    parameters=params,
)
class AbstractNodeReadonlyViewSet(
    FiltersMixin,
    AccessViewSetMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    access_policy = RelationalAccessPolicy
    filterset_fields = "__all__"
    ordering_fields = "__all__"

    filter_mappings = abstract_filter_mappings

    arg_splitter = lambda val: val.split(",")
    filter_value_transformations = {
        "id__in": arg_splitter,
        "parent__in": arg_splitter,
        "parent__isnull": strtobool,
    }

    def get_queryset(self):
        return self.access_policy.scope_queryset(self.request, self.queryset)
