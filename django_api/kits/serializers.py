from kits.models import Kit, Question, Answer
from nodes.serializers import NodeVersioningSerializer
from rest_framework import serializers
from documents.models import Folder


class ParentFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ("id", "name")


class KitSerializer(NodeVersioningSerializer):
    parent = ParentFolderSerializer()

    class Meta:
        model = Kit
        fields = "__all__"
        ordering = ["created"]
        depth = 2


class QuestionSerializer(NodeVersioningSerializer):
    class Meta:
        model = Question
        fields = "__all__"
        ordering = ["created"]
        depth = 1


class AnswerSerializer(NodeVersioningSerializer):
    class Meta:
        model = Answer
        fields = "__all__"
        ordering = ["created"]
