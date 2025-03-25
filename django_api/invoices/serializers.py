from nodes.serializers import NodeVersioningSerializer
from .models import Invoice, LineItem, Item
from rest_framework.validators import UniqueTogetherValidator


class ItemSerializer(NodeVersioningSerializer):
    class Meta:
        model = Item
        fields = "__all__"
        validators = [
            UniqueTogetherValidator(
                queryset=Item.objects.all(),
                fields=["line_item", "index"],
            )
        ]


class LineItemSerializer(NodeVersioningSerializer):
    items = ItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = LineItem
        fields = "__all__"
        validators = [
            UniqueTogetherValidator(
                queryset=LineItem.objects.all(),
                fields=["invoice", "index"],
            )
        ]


class InvoiceSerializer(NodeVersioningSerializer):
    line_items = LineItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = "__all__"
