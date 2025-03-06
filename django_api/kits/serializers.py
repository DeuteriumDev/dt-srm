from kits.models import Kit, Question, Answer
from nodes.serializers import NodeVersioningSerializer, ParentFolderSerializer
from rest_framework.validators import UniqueTogetherValidator


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
