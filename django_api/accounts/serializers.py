from rest_framework import serializers
from .models import CustomPermissions, Organization, CustomUser, CustomGroup
from rest_framework.validators import UniqueTogetherValidator
from django.contrib.contenttypes.models import ContentType


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"
        depth = 1


class CustomUserSerializer(serializers.ModelSerializer):
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


class CustomGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomGroup
        fields = "__all__"


class ContentObjectSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)


class CustomPermissionsSerializer(serializers.ModelSerializer):
    ctype = serializers.ChoiceField(
        choices=ContentType.objects.all().values_list("id", "model"),
        required=True,
        source="content_type.id",
    )
    content_object = ContentObjectSerializer(read_only=True)
    group_id = serializers.UUIDField(
        required=True,
        write_only=True,
    )

    group = CustomGroupSerializer(read_only=True)

    class Meta:
        model = CustomPermissions
        fields = (
            "id",
            "object_id",
            "can_create",
            "can_read",
            "can_update",
            "can_delete",
            "created",
            "updated",
            "ctype",
            "content_object",
            "group_id",
            "group",
        )

        validators = [
            UniqueTogetherValidator(
                queryset=CustomPermissions.objects.all(),
                fields=[
                    "object_id",
                    "group_id",
                ],
            )
        ]

    def create(self, validated_data):
        return CustomPermissions.objects.create(
            object_id=validated_data["object_id"],
            group=CustomGroup.objects.get(pk=validated_data["group_id"]),
            can_create=validated_data["can_create"],
            can_read=validated_data["can_read"],
            can_update=validated_data["can_update"],
            can_delete=validated_data["can_delete"],
            content_type=ContentType.objects.get(
                pk=validated_data["content_type"]["id"]
            ),
        )

    def update(self, instance, validated_data):
        instance.object_id = validated_data.get("object_id", instance.object_id)
        instance.can_create = validated_data.get("can_create", instance.can_create)
        instance.can_read = validated_data.get("can_read", instance.can_read)
        instance.can_update = validated_data.get("can_update", instance.can_update)
        instance.can_delete = validated_data.get("can_delete", instance.can_delete)
        if validated_data.get("ctype"):
            instance.content_type = ContentType.objects.get(pk=validated_data["ctype"])
        if validated_data.get("group_id"):
            instance.group = CustomGroup.objects.get(pk=validated_data["group_id"])
        instance.save()

        return instance
