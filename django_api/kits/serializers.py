from rest_framework import serializers
from accounts.serializers import OrganizationSerializer
from accounts.models import Organization
from kits.models import Kit, Question, Answer, Folder


class FolderSerializer(serializers.ModelSerializer):
    # organization = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = [
            "id",
            "name",
            "created",
            "updated",
            "parent",
            # "custom_permission"
        ]
        ordering = ["created"]


class KitSerializer(serializers.ModelSerializer):
    # organization = serializers.SerializerMethodField()

    class Meta:
        model = Kit
        fields = [
            "id",
            "title",
            "created",
            "updated",
            "start",
            # "organization",
            # "parent_folder",
        ]
        depth = 2

    # def get_organization(self, obj):
    #     if obj.parent_folder is not None:
    #         parent_folder = FolderSerializer(obj.parent_folder).data
    #         return OrganizationSerializer(
    #             Organization.objects.get(pk=parent_folder["organization"]["id"]),
    #             fields=["id", "name"],
    #         ).data

    #     return None


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "description",
            "image",
            "answers",
            "created",
            "updated",
            "next",
        ]
        depth = 1


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "title",
            "description",
            "image",
            "created",
            "updated",
            "index",
        ]
