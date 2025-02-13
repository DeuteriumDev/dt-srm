from rest_framework import serializers
from kits.models import Kit, Question, Answer, Folder
from drf_dynamic_fields import DynamicFieldsMixin

class FolderSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = "__all__"
        ordering = ["created"]
        depth = 2

    def get_children_count(self, obj):
        return len(obj.children)


class KitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kit
        fields = "__all__"
        depth = 2


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"
        depth = 1


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = "__all__"


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
        return {"id": folder.id, "name": folder.name}
