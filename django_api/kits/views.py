from kits.models import Kit, Question, Answer
from kits.serializers import KitSerializer, QuestionSerializer, AnswerSerializer
from rest_framework import viewsets, permissions, reverse, response, decorators
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope


class KitViewSet(viewsets.ModelViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer
    # permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer


@decorators.api_view(["GET"])
def api_root(request, format=None):
    return response.Response(
        {
            "kits": reverse("kit-list", request=request, format=format),
            "questions": reverse("question-list", request=request, format=format),
            "answers": reverse("answer-list", request=request, format=format),
        }
    )
