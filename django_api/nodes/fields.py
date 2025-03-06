from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field


@extend_schema_field(
    {
        "type": "array",
        "items": {
            "type": "string",
        },
        "readOnly": True,
    }
)
class TagsField(serializers.SerializerMethodField):
    pass
