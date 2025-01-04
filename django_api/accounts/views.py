from accounts.models import Organization, CustomUser
from accounts.serializers import OrganizationSerializer, CustomUserSerializer
from rest_access_policy import AccessPolicy
from rest_access_policy import AccessViewSetMixin
from rest_framework import viewsets


class GenericAccessPolicy(AccessPolicy):
    statements = [
        {
            "action": "*",
            "principal": "authenticated",
            "effect": "allow",
        },
    ]


class OrganizationViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    access_policy = GenericAccessPolicy


class CustomUserViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    access_policy = GenericAccessPolicy
