from rest_framework import serializers

from .models import CustomPermissions, Organization, CustomUser, CustomGroup
from rest_framework.validators import UniqueTogetherValidator
from django.contrib.contenttypes.models import ContentType
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes


class CustomUserGroupSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"
        depth = 1


class CustomUserSerializer(serializers.ModelSerializer):
    groups = CustomUserGroupSerializer(many=True, read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)

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
            "date_joined",
        ]


class CustomMembersSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    email = serializers.CharField(read_only=True)
    avatar = serializers.ImageField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)


class CustomGroupSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    members = CustomMembersSerializer(many=True, read_only=True)

    class Meta:
        model = CustomGroup
        fields = "__all__"

    @extend_schema_field(OpenApiTypes.INT)
    def get_member_count(self, obj):
        return obj.members.count()

    def create(self, validated_data):
        group = super().create(validated_data)
        CustomPermissions.objects.create(
            object_id=group.id,
            group=group,
            content_type=ContentType.objects.get_for_model(CustomGroup),
        )
        group.members.add(self.context["request"].user)
        group.save()
        return group


class ContentObjectSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)


class CustomPermissionsSerializer(serializers.ModelSerializer):
    # [see README.md #Common-Problems](./README.md#common-problems)
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
    created = serializers.DateTimeField(read_only=True)
    updated = serializers.DateTimeField(read_only=True)

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
