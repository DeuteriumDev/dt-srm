from common.strtobool import strtobool
from drf_spectacular.utils import extend_schema, OpenApiParameter
from nodes.viewsets import (
    AbstractNodeViewSet,
)
from .models import Folder
from .serializers import FolderSerializer


@extend_schema(parameters=[OpenApiParameter(name="favorite", required=False, type=str)])
class FolderViewSet(AbstractNodeViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    filter_mappings = {
        **AbstractNodeViewSet.filter_mappings,
        "favorite": "favorite",
    }
    filter_value_transformations = {
        **AbstractNodeViewSet.filter_value_transformations,
        "favorite": strtobool,
    }
