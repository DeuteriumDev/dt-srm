from rest_framework import serializers
from nodes.serializers import NodeVersioningSerializer
from .models import Folder
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer
from kits.serializers import KitSerializer
from kits.models import Kit
from rest_polymorphic.serializers import PolymorphicSerializer


class ParentFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ("id", "name")


class FolderSerializer(NodeVersioningSerializer):
    parent = ParentFolderSerializer()

    class Meta:
        model = Folder
        fields = "__all__"

    @extend_schema_field(
        {
            "type": "array",
            "items": {
                "type": "string",
            },
            "readOnly": True,
        }
    )
    def get_tags(self, obj: Folder):
        return [f"items:{obj.children.count()}"]


class NodePolymorphicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        Folder: FolderSerializer,
        Invoice: InvoiceSerializer,
        Kit: KitSerializer,
    }
