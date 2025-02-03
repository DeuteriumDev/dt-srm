from rest_framework import serializers
from kits.models import Kit, Question, Answer, Folder
from drf_dynamic_fields import DynamicFieldsMixin


class FolderSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = "__all__"
        ordering = ["created"]


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
    id = serializers.UUIDField
    name = serializers.CharField
    updated = serializers.DateTimeField
    created = serializers.DateTimeField

    def to_representation(self, instance):
        return instance
