from documents.serializers import NodePolymorphicSerializer

from .viewsets import AbstractNodeReadonlyViewSet
from .models import NodeModel


class NodeViewSet(AbstractNodeReadonlyViewSet):
    queryset = NodeModel.objects.all()
    serializer_class = NodePolymorphicSerializer
