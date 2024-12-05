from rest_framework import serializers
from kits.models import Kit, Question, Answer
from drf_dynamic_fields import DynamicFieldsMixin


class KitSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = Kit
        fields = [
            "id",
            "title",
            "created",
            "updated",
            "start",
        ]


class QuestionSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
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
        ]
        depth = 1


class AnswerSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "title",
            "description",
            "image",
            "created",
            "updated",
        ]
