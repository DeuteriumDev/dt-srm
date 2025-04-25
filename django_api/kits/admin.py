from django.contrib import admin
from .models import Kit, Question, Answer
from unfold.admin import ModelAdmin


class KitAdmin(ModelAdmin):
    pass


class QuestionAdmin(ModelAdmin):
    pass


class AnswerAdmin(ModelAdmin):
    pass


admin.site.register(Kit, KitAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer, AnswerAdmin)
