from rest_framework import serializers
from kits.serializers import FolderSerializer
from kits.models import Folder


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
