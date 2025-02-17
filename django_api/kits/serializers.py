from pprint import pprint
from rest_framework import serializers
from kits.models import Kit, Question, Answer


class KitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kit
        fields = "__all__"
        ordering = ["created"]
        depth = 2


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"
        ordering = ["created"]
        depth = 1


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = "__all__"
        ordering = ["created"]
