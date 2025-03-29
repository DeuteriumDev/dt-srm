from accounts.serializers import CustomPermissionsSerializer
from accounts.models import CustomPermissions
from nodes.serializers import NodeVersioningSerializer
from .models import Folder
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer
from kits.serializers import KitSerializer
from kits.models import Kit
from rest_polymorphic.serializers import PolymorphicSerializer
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field


class FolderSerializer(NodeVersioningSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = "__all__"

    def get_tags(self, obj):
        tags = [f"items:{obj.children.count()}"]
        if obj.favorite is True:
            tags.append("favorite")
        return tags

    @extend_schema_field(CustomPermissionsSerializer(many=True))
    def get_permissions(self, obj):
        permissions = CustomPermissions.objects.filter(
            object_id__in=self.get_parent_ids(obj) + [obj.id],
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
