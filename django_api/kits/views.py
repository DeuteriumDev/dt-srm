from multiprocessing import context
from kits.models import Kit, Question, Answer
from kits.serializers import KitSerializer, QuestionSerializer, AnswerSerializer
from rest_access_policy import AccessPolicy
from rest_access_policy import AccessViewSetMixin
from rest_framework import viewsets, reverse, decorators
from rest_framework.response import Response


class GenericAccessPolicy(AccessPolicy):
    statements = [
        {"action": "*", "principal": "*", "effect": "allow"},
    ]

    @classmethod
    def scope_queryset(cls, request, queryset):
        return queryset
    

    # def get_user_group_values(self, user):
    #     return list(user.roles.values_list("title", flat=True), user.)


class KitViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    # queryset = Kit.objects.all()
    serializer_class = KitSerializer
    access_policy = GenericAccessPolicy

    def get_queryset(self):
        print(dir(self.request.user))
        return self.access_policy.scope_queryset(
            self.request,
            Kit.objects.all(),
        )


class QuestionViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    access_policy = GenericAccessPolicy


class AnswerViewSet(AccessViewSetMixin, viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    access_policy = GenericAccessPolicy
