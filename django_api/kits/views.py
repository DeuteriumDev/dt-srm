from nodes.viewsets import AbstractNodeViewSet
from kits.models import Kit, Question, Answer
from kits.serializers import (
    KitSerializer,
    QuestionSerializer,
    AnswerSerializer,
)


class KitViewSet(AbstractNodeViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer


class QuestionViewSet(AbstractNodeViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AnswerViewSet(AbstractNodeViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
