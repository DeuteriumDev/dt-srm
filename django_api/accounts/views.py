from .models import CustomGroup, CustomPermissions, Organization, CustomUser
from .serializers import (
    CustomGroupSerializer,
    CustomPermissionsSerializer,
    OrganizationSerializer,
    CustomUserSerializer,
)
from rest_access_policy import AccessViewSetMixin
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from filters.mixins import FiltersMixin
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .access_policies import (
    AccountsAccessPolicy,
    AccountsUsersAccessPolicy,
    CustomPermissionsRelationPolicy,
)


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
arg_splitter = lambda val: val.split(",")


@extend_schema(
    parameters=params,
)
class CustomGroupViewSet(AccessViewSetMixin, FiltersMixin, viewsets.ModelViewSet):
    queryset = CustomGroup.objects.all()
    serializer_class = CustomGroupSerializer
    access_policy = AccountsAccessPolicy

    filterset_fields = ["id", "name", "parent", "hidden", "created", "updated"]
    ordering_fields = ["name", "created", "updated"]
    filter_mappings = abstract_filter_mappings
    arg_splitter = lambda val: val.split(",")
    filter_value_transformations = {
        "id__in": arg_splitter,
    }

    def get_queryset(self):
        return self.access_policy.scope_queryset(
            self.request, self.queryset, CustomGroup
        )


class OrganizationViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    access_policy = AccountsAccessPolicy


class CustomUserViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    access_policy = AccountsUsersAccessPolicy

    def get_queryset(self):
        return self.access_policy.scope_queryset(
            self.request, self.queryset, CustomUser
        )

    @action(detail=False)
    def me(self, request):
        return Response(self.get_serializer(request.user, many=False).data)


class CustomPermissionsViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    queryset = CustomPermissions.objects.all()
    serializer_class = CustomPermissionsSerializer
    access_policy = CustomPermissionsRelationPolicy

    def get_queryset(self):
        return self.access_policy.scope_queryset(
            self.request, self.queryset, CustomPermissions
        )
