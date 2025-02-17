from documents.viewsets import AbstractDocumentViewSet
from kits.models import Kit, Question, Answer
from kits.serializers import (
    KitSerializer,
    QuestionSerializer,
    AnswerSerializer,
)


class KitViewSet(AbstractDocumentViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer


class QuestionViewSet(AbstractDocumentViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AnswerViewSet(AbstractDocumentViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
