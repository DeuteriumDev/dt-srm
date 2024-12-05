from rest_framework import serializers
from accounts.models import Organization, CustomUser
from drf_dynamic_fields import DynamicFieldsMixin


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class CustomUserSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = CustomUser
        depth = 1
        fields = [
            "id",
            "email",
            "avatar",
            "organizations",
            "first_name",
            "last_name",
            "is_active",
        ]


class OrganizationSerializer(DynamicFieldsModelSerializer):
    members = CustomUserSerializer(
        many=True,
        read_only=True,
        fields=[
            "id",
            "email",
            "avatar",
            "is_active",
        ],
    )

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "avatar",
            "members",
        ]
