from accounts.serializers import CustomUserSerializer
from rest_framework import serializers
import reversion
from datetime import datetime
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from reversion.models import Version


def extend_tags_field(*args):
    return extend_schema_field(
        {
            "type": "array",
            "items": {
                "type": "string",
            },
            "readOnly": True,
        }
    )(*args)


class NodeVersioningSerializer(serializers.ModelSerializer):
    updated = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    child_versionable_models = ()

    def __init__(self, *args, **kwargs):
        for m in self.child_versionable_models:
            if not self.Model._meta.get_field(m).is_relation:
                raise ValueError("Non-relational field passed")

        super().__init__(*args, **kwargs)

    """vv Model serializer overrides vv"""

    def create(self, validated_data):
        with reversion.create_revision():
            reversion.set_user(self.context["request"].user)
            reversion.set_comment(
                f"Created {self.Meta.model.__name__}: {datetime.now().isoformat()}"
            )
            result = super().create(validated_data)
            return result

    def update(self, instance, validated_data):
        with reversion.create_revision():
            reversion.set_user(self.context["request"].user)
            reversion.set_comment(
                f"Updated {self.Meta.model.__name__}: {datetime.now().isoformat()}"
            )
            super().update(
                instance,
                validated_data,
            )
            return instance

    """vv Serializer Method Field functions vv"""

    @extend_schema_field(OpenApiTypes.DATETIME)
    def get_updated(self, obj):
        qs = Version.objects.get_for_object(obj)
        for m in self.child_versionable_models:
            qs.union(
                Version.objects.get_for_object(obj._meta.get_field(m).related_model)
            )
        return qs.order_by("-revision__date_created").first().revision.date_created

    @extend_schema_field(CustomUserSerializer())
    def get_updated_by(self, obj):
        return CustomUserSerializer(
            Version.objects.get_for_object(obj)
            .order_by("-revision__date_created")
            .first()
            .revision.user,
        ).data

    @extend_tags_field
    def get_tags(self, _obj):
        return []
