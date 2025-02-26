from rest_framework import viewsets
from nodes.viewsets import (
    AbstractNodeViewSet,
)

from .models import Invoice, Item, LineItem
from .serializers import (
    InvoiceSerializer,
    ItemSerializer,
    LineItemSerializer,
)


class InvoiceViewSet(AbstractNodeViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer


# Create your views here.
class LineItemViewSet(viewsets.ModelViewSet):
    queryset = LineItem.objects.all()
    serializer_class = LineItemSerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
