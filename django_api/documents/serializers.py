from rest_framework import serializers
from .models import Folder
from rest_framework import serializers
from accounts.serializers import CustomPermissionsSerializer
from drf_dynamic_fields import DynamicFieldsMixin
from documents.access_policies import get_document_permissions
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes


class FolderSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    children_count = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = "__all__"
        ordering = ["created"]
        depth = 1

    @extend_schema_field(OpenApiTypes.INT)
    def get_children_count(self, obj):
        return len(obj.children)

    @extend_schema_field(CustomPermissionsSerializer())
    def get_permissions(self, obj):
        perm = get_document_permissions(obj, self.context["request"]).get()
        return CustomPermissionsSerializer(
            perm, context={"request": self.context["request"]}
        ).data


class DocumentSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    updated = serializers.DateTimeField()
    created = serializers.DateTimeField()
    doc_type = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
    parent = serializers.SerializerMethodField()

    def get_parent(self, obj):
        if obj["parent"] is None:
            return None
        folder = Folder.objects.get(pk=obj["parent"])
        return FolderSerializer(
            folder, context={"request": self.context["request"]}
        ).data


# class
