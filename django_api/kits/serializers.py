from pprint import pprint
from rest_framework import serializers
from accounts.serializers import CustomPermissionsSerializer
from kits.models import Kit, Question, Answer, Folder
from drf_dynamic_fields import DynamicFieldsMixin
from documents.access_policies import get_document_permissions


class KitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kit
        fields = "__all__"
        ordering = ["created"]
        depth = 2


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"
        ordering = ["created"]
        depth = 1


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = "__all__"
        ordering = ["created"]


class FolderSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = "__all__"
        ordering = ["created"]
        depth = 1

    def get_children(self, obj):
        children = []
        for child in obj.children:
            if isinstance(child, Kit):
                children.append({**KitSerializer(child).data, "doc_type": "kit"})
            if isinstance(child, Folder):
                children.append({**self.to_internal_value(child), "doc_type": "folder"})

        return children

    def get_permissions(self, obj):
        perm = get_document_permissions(obj, self.context["request"]).get()
        return CustomPermissionsSerializer(
            perm, context={"request": self.context["request"]}
        ).data
