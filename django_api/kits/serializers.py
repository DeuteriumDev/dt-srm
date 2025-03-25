from kits.models import Kit, Question, Answer
from nodes.serializers import NodeVersioningSerializer
from rest_framework.validators import UniqueTogetherValidator


class AnswerSerializer(NodeVersioningSerializer):
    class Meta:
        model = Answer
        fields = "__all__"
        ordering = ["created"]
        validators = [
            UniqueTogetherValidator(
                queryset=Answer.objects.all(),
                fields=["question", "index"],
            )
        ]


class QuestionSerializer(NodeVersioningSerializer):
    class Meta:
        model = Question
        fields = "__all__"
        ordering = ["created"]
        # depth = 1


class KitSerializer(NodeVersioningSerializer):

    class Meta:
        model = Kit
        fields = "__all__"
        ordering = ["created"]
