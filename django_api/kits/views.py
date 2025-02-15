from documents.viewsets import AbstractDocumentViewSet, abstract_filter_mappings
from kits.models import Kit, Question, Answer, Folder
from kits.serializers import (
    KitSerializer,
    QuestionSerializer,
    AnswerSerializer,
    FolderSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter


@extend_schema(
    parameters=[OpenApiParameter(name="favorite__exact", required=False, type=str)],
)
class FolderViewSet(AbstractDocumentViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

    filter_mappings = {
        **abstract_filter_mappings,
        "favorite__exact": "favorite__iexact",
    }


class KitViewSet(AbstractDocumentViewSet):
    queryset = Kit.objects.all()
    serializer_class = KitSerializer


class QuestionViewSet(AbstractDocumentViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AnswerViewSet(AbstractDocumentViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
