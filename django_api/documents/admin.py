from django.contrib import admin
from .models import FolderNode, InvoiceNode, Folder


admin.site.register(Folder)
admin.site.register(FolderNode)
admin.site.register(InvoiceNode)
