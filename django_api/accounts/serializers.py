from rest_framework import serializers
from .models import CustomPermissions, Organization, CustomUser, CustomGroup
from rest_framework.validators import UniqueTogetherValidator


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = None
        if kwargs.get("fields") is not None:
            fields = kwargs.pop("fields", None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class OrganizationSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"
        depth = 1


class CustomUserSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "avatar",
            "first_name",
            "last_name",
            "is_active",
            "groups",
        ]
        depth = 1


class CustomPermissionsSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = CustomPermissions
        fields = "__all__"
        depth = 1

        validators = [
            UniqueTogetherValidator(
                queryset=CustomPermissions.objects.all(),
                fields=[
                    "object_id",
                    "group",
                ],
            )
        ]


class CustomGroupSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = CustomGroup
        fields = "__all__"
