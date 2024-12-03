from rest_framework import serializers
from kits.models import Kit, Question, Answer
from drf_dynamic_fields import DynamicFieldsMixin


class KitSerializer(DynamicFieldsMixin, serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Kit
        fields = [
            "id",
            "title",
            "created",
            "updated",
            "start",
            "url",
        ]


class QuestionSerializer(DynamicFieldsMixin, serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "description",
            "image",
            "answers",
            "created",
            "updated",
            "next",
            "url",
        ]
        depth = 1


class AnswerSerializer(DynamicFieldsMixin, serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "title",
            "description",
            "image",
            "created",
            "updated",
            "url",
        ]
