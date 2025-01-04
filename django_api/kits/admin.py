from django.contrib import admin
from .models import Kit, Question, Answer, Folder

admin.site.register(Kit)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Folder)
