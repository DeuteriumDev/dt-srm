from django.contrib import admin
from .models import Folder
from unfold.admin import ModelAdmin


class FolderAdmin(ModelAdmin):
    pass


admin.site.register(Folder, FolderAdmin)
