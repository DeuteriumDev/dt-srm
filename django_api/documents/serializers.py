from accounts.serializers import CustomPermissionsSerializer
from accounts.models import CustomPermissions
from nodes.serializers import NodeVersioningSerializer, ParentFolderSerializer
from .models import Folder
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer
from kits.serializers import KitSerializer
from kits.models import Kit
from rest_polymorphic.serializers import PolymorphicSerializer
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field


class FolderSerializer(NodeVersioningSerializer):
    breadcrumbs = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = "__all__"

    def get_tags(self, obj):
        return [f"items:{obj.children.count()}"]

    def get_parent_ids(self, obj):
        parent_ids = []
        current = obj
        while current.parent is not None and current.inherit_permissions:
            parent_ids.append(current.parent.id)
            current = current.parent
        return parent_ids

    @extend_schema_field(ParentFolderSerializer(many=True), component_name="Breadcrumb")
    def get_breadcrumbs(self, obj):
        folders = Folder.objects.filter(pk__in=self.get_parent_ids(obj)).order_by(
            "-created"
        )
        return ParentFolderSerializer(
            folders,
            many=True,
            context={
                "request": self.context["request"],
            },
        ).data

    @extend_schema_field(CustomPermissionsSerializer(many=True))
    def get_permissions(self, obj):
        permissions = CustomPermissions.objects.filter(
            object_id__in=self.get_parent_ids(obj),
            can_read=True,
            group_id__in=self.context["request"].user.groups.all(),
        )
        return CustomPermissionsSerializer(
            permissions,
            many=True,
            context={
                "request": self.context["request"],
            },
        ).data


class NodePolymorphicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        Folder: FolderSerializer,
        Invoice: InvoiceSerializer,
        Kit: KitSerializer,
    }
