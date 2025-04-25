from django.contrib import admin
from .models import Invoice, LineItem, Item
from unfold.admin import ModelAdmin


class InvoiceAdmin(ModelAdmin):
    pass


class LineItemAdmin(ModelAdmin):
    pass


class ItemAdmin(ModelAdmin):
    pass


# Register your models here.
admin.site.register(Invoice, InvoiceAdmin)
admin.site.register(LineItem, LineItemAdmin)
admin.site.register(Item, ItemAdmin)
