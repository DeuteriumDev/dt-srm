from rest_framework import serializers
from nodes.serializers import NodeVersioningSerializer, extend_tags_field
from .models import Folder
from rest_framework import serializers
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

    @extend_tags_field
    def get_tags(self, obj: Folder):
        return [f"items:{obj.children.count()}"]


class NodePolymorphicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        Folder: FolderSerializer,
        Invoice: InvoiceSerializer,
        Kit: KitSerializer,
    }
